import { Inject, Injectable, Logger } from '@nestjs/common';
import type { LiveClassProvider } from '@edvoura/contracts';

import { ENVIRONMENT } from '../../common/config/environment.constants.js';
import type { Environment } from '../../common/config/environment.js';
import { DatabaseService } from '../../common/database/database.service.js';

interface ZoomTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

interface ZoomMeetingResponse {
  id: number;
  join_url: string;
  start_url: string;
  password: string;
}

type JsonHttpResponse<T> = {
  ok: boolean;
  status: number;
  json: () => Promise<T>;
};

export interface LiveSessionResult {
  lessonId: string;
  provider: LiveClassProvider;
  externalMeetingId: string | null;
  joinUrl: string | null;
  hostUrl: string | null;
  passcode: string | null;
}

@Injectable()
export class LiveSessionService {
  private readonly logger = new Logger(LiveSessionService.name);

  private zoomAccessToken: string | null = null;
  private zoomTokenExpiresAt: number = 0;

  private googleAccessToken: string | null = null;
  private googleTokenExpiresAt: number = 0;

  constructor(
    @Inject(ENVIRONMENT) private readonly env: Environment,
    private readonly databaseService: DatabaseService,
  ) {}

  async provisionSession(
    lessonId: string,
    provider: LiveClassProvider,
    scheduledStart: string,
    scheduledEnd: string,
    topic: string,
  ): Promise<LiveSessionResult> {
    let result: LiveSessionResult;

    if (provider === 'zoom') {
      result = await this.provisionZoom(lessonId, scheduledStart, scheduledEnd, topic);
    } else if (provider === 'google_meet') {
      result = await this.provisionGoogleMeet(lessonId, scheduledStart, scheduledEnd, topic);
    } else {
      // native_later — stub
      result = {
        lessonId,
        provider,
        externalMeetingId: null,
        joinUrl: null,
        hostUrl: null,
        passcode: null,
      };
    }

    // Persist to private.lesson_live_sessions
    await this.databaseService.db
      .insertInto('private.lesson_live_sessions')
      .values({
        lesson_id: lessonId,
        provider,
        external_meeting_id: result.externalMeetingId,
        join_url: result.joinUrl,
        host_url: result.hostUrl,
        passcode: result.passcode,
        raw_payload: {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .onConflict((oc) =>
        oc.column('lesson_id').doUpdateSet({
          external_meeting_id: result.externalMeetingId,
          join_url: result.joinUrl,
          host_url: result.hostUrl,
          passcode: result.passcode,
          updated_at: new Date().toISOString(),
        }),
      )
      .execute();

    return result;
  }

  async getSessionForLesson(lessonId: string): Promise<LiveSessionResult | null> {
    const row = await this.databaseService.db
      .selectFrom('private.lesson_live_sessions')
      .select([
        'lesson_id as lessonId',
        'provider',
        'external_meeting_id as externalMeetingId',
        'join_url as joinUrl',
        'host_url as hostUrl',
        'passcode',
      ])
      .where('lesson_id', '=', lessonId)
      .executeTakeFirst();

    if (!row) return null;

    return {
      lessonId: row.lessonId,
      provider: row.provider,
      externalMeetingId: row.externalMeetingId,
      joinUrl: row.joinUrl,
      hostUrl: row.hostUrl,
      passcode: row.passcode,
    };
  }

  // ─── Zoom Server-to-Server OAuth ──────────────────────────────────────────

  private async getZoomAccessToken(): Promise<string> {
    const { ZOOM_ACCOUNT_ID, ZOOM_CLIENT_ID, ZOOM_CLIENT_SECRET } = this.env;

    if (!ZOOM_ACCOUNT_ID || !ZOOM_CLIENT_ID || !ZOOM_CLIENT_SECRET) {
      throw new Error('Zoom credentials not configured');
    }

    // Return cached token if valid (5 min buffer)
    if (this.zoomAccessToken && Date.now() < this.zoomTokenExpiresAt - 5 * 60 * 1000) {
      this.logger.debug('Using cached Zoom access token');
      return this.zoomAccessToken;
    }

    this.logger.log('Fetching new Zoom access token...');
    const tokenResponse = (await fetch(
      `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${ZOOM_ACCOUNT_ID}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Basic ${Buffer.from(`${ZOOM_CLIENT_ID}:${ZOOM_CLIENT_SECRET}`).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      },
    )) as JsonHttpResponse<ZoomTokenResponse>;

    if (!tokenResponse.ok) {
      throw new Error(`Zoom OAuth failed: ${tokenResponse.status}`);
    }

    const tokenData = await tokenResponse.json();
    this.zoomAccessToken = tokenData.access_token;
    this.zoomTokenExpiresAt = Date.now() + tokenData.expires_in * 1000;

    return this.zoomAccessToken;
  }

  private async provisionZoom(
    lessonId: string,
    scheduledStart: string,
    scheduledEnd: string,
    topic: string,
  ): Promise<LiveSessionResult> {
    try {
      const accessToken = await this.getZoomAccessToken();

      // Step 2: Create meeting
      const startTime = new Date(scheduledStart);
      const endTime = new Date(scheduledEnd);
      const durationMinutes = Math.round((endTime.getTime() - startTime.getTime()) / 60000);

      const meetingResponse = (await fetch('https://api.zoom.us/v2/users/me/meetings', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic,
          type: 2, // scheduled meeting
          start_time: startTime.toISOString(),
          duration: durationMinutes,
          timezone: this.env.DEFAULT_TIMEZONE,
          settings: {
            join_before_host: false,
            waiting_room: true,
            mute_upon_entry: true,
          },
        }),
      })) as JsonHttpResponse<ZoomMeetingResponse>;

      if (!meetingResponse.ok) {
        throw new Error(`Zoom meeting creation failed: ${meetingResponse.status}`);
      }

      const meeting = await meetingResponse.json();

      this.logger.log(`Zoom meeting created: ${meeting.id} for lesson ${lessonId}`);

      return {
        lessonId,
        provider: 'zoom',
        externalMeetingId: String(meeting.id),
        joinUrl: meeting.join_url,
        hostUrl: meeting.start_url,
        passcode: meeting.password,
      };
    } catch (err) {
      this.logger.error(`Zoom provisioning failed for lesson ${lessonId}`, err);
      return {
        lessonId,
        provider: 'zoom',
        externalMeetingId: `failed-${Date.now()}`,
        joinUrl: null,
        hostUrl: null,
        passcode: null,
      };
    }
  }

  // ─── Google Meet (Service Account) ──────────────────────────────────────

  private async getGoogleAccessToken(): Promise<string> {
    const { GOOGLE_SERVICE_ACCOUNT_KEY_JSON, GOOGLE_CALENDAR_IMPERSONATE_EMAIL } = this.env;

    if (!GOOGLE_SERVICE_ACCOUNT_KEY_JSON || !GOOGLE_CALENDAR_IMPERSONATE_EMAIL) {
      throw new Error('Google Workspace credentials not configured');
    }

    // Return cached token if valid (5 min buffer)
    if (this.googleAccessToken && Date.now() < this.googleTokenExpiresAt - 5 * 60 * 1000) {
      this.logger.debug('Using cached Google access token');
      return this.googleAccessToken;
    }

    this.logger.log('Fetching new Google access token...');
    const credentials = JSON.parse(GOOGLE_SERVICE_ACCOUNT_KEY_JSON) as {
      client_email: string;
      private_key: string;
      token_uri: string;
    };

    const { importPKCS8, SignJWT } = await import('jose');

    const privateKey = await importPKCS8(credentials.private_key, 'RS256');

    const jwt = await new SignJWT({
      iss: credentials.client_email,
      sub: GOOGLE_CALENDAR_IMPERSONATE_EMAIL,
      scope: 'https://www.googleapis.com/auth/calendar.events',
      aud: credentials.token_uri,
    })
      .setProtectedHeader({ alg: 'RS256' })
      .setIssuedAt()
      .setExpirationTime('1h')
      .sign(privateKey);

    const response = await fetch(credentials.token_uri, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: jwt,
      }),
    });

    if (!response.ok) {
      const errBody = await response.text();
      throw new Error(`Google OAuth failed: ${response.status} ${errBody}`);
    }

    const data = (await response.json()) as { access_token: string; expires_in: number };
    this.googleAccessToken = data.access_token;
    this.googleTokenExpiresAt = Date.now() + data.expires_in * 1000;

    return this.googleAccessToken;
  }

  private async provisionGoogleMeet(
    lessonId: string,
    scheduledStart: string,
    scheduledEnd: string,
    topic: string,
  ): Promise<LiveSessionResult> {
    try {
      const accessToken = await this.getGoogleAccessToken();

      const startTime = new Date(scheduledStart);
      const endTime = new Date(scheduledEnd);

      const eventBody = {
        summary: topic,
        start: { dateTime: startTime.toISOString() },
        end: { dateTime: endTime.toISOString() },
        conferenceData: {
          createRequest: {
            requestId: `edvoura-lesson-${lessonId}`,
            conferenceSolutionKey: { type: 'hangoutsMeet' },
          },
        },
      };

      const calendarId = 'primary';
      const response = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events?conferenceDataVersion=1`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(eventBody),
        },
      );

      if (!response.ok) {
        const errBody = await response.text();
        throw new Error(`Google Calendar API failed: ${response.status} ${errBody}`);
      }

      const eventResponse = (await response.json()) as {
        id: string;
        hangoutLink?: string;
        conferenceData?: {
          entryPoints?: Array<{ entryPointType: string; uri: string; passcode?: string }>;
        };
      };

      this.logger.log(`Google Meet created: ${eventResponse.id} for lesson ${lessonId}`);

      let joinUrl = eventResponse.hangoutLink ?? null;
      let passcode = null;

      if (eventResponse.conferenceData?.entryPoints) {
        const videoEntry = eventResponse.conferenceData.entryPoints.find(
          (e) => e.entryPointType === 'video',
        );
        if (videoEntry) {
          joinUrl = videoEntry.uri;
          passcode = videoEntry.passcode ?? null;
        }
      }

      return {
        lessonId,
        provider: 'google_meet',
        externalMeetingId: eventResponse.id,
        joinUrl,
        hostUrl: joinUrl, // For Meet, join and host URL are the same
        passcode,
      };
    } catch (err) {
      if ((err as Error).message.includes('not configured')) {
        this.logger.warn('Google Workspace credentials not configured — creating stub session');
      } else {
        this.logger.error(`Google Meet provisioning failed for lesson ${lessonId}`, err);
      }
      
      return {
        lessonId,
        provider: 'google_meet',
        externalMeetingId: `gmeet-stub-${Date.now()}`,
        joinUrl: null,
        hostUrl: null,
        passcode: null,
      };
    }
  }
}
