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
      result = await this.provisionGoogleMeet(lessonId, topic);
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

  private async provisionZoom(
    lessonId: string,
    scheduledStart: string,
    scheduledEnd: string,
    topic: string,
  ): Promise<LiveSessionResult> {
    const { ZOOM_ACCOUNT_ID, ZOOM_CLIENT_ID, ZOOM_CLIENT_SECRET } = this.env;

    if (!ZOOM_ACCOUNT_ID || !ZOOM_CLIENT_ID || !ZOOM_CLIENT_SECRET) {
      this.logger.warn('Zoom credentials not configured — creating stub session');
      return {
        lessonId,
        provider: 'zoom',
        externalMeetingId: `stub-${Date.now()}`,
        joinUrl: null,
        hostUrl: null,
        passcode: null,
      };
    }

    try {
      // Step 1: Get access token via Server-to-Server OAuth
      const tokenResponse = await fetch(
        `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${ZOOM_ACCOUNT_ID}`,
        {
          method: 'POST',
          headers: {
            Authorization: `Basic ${Buffer.from(`${ZOOM_CLIENT_ID}:${ZOOM_CLIENT_SECRET}`).toString('base64')}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );

      if (!tokenResponse.ok) {
        throw new Error(`Zoom OAuth failed: ${tokenResponse.status}`);
      }

      const tokenData = (await tokenResponse.json()) as ZoomTokenResponse;

      // Step 2: Create meeting
      const startTime = new Date(scheduledStart);
      const endTime = new Date(scheduledEnd);
      const durationMinutes = Math.round((endTime.getTime() - startTime.getTime()) / 60000);

      const meetingResponse = await fetch('https://api.zoom.us/v2/users/me/meetings', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
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
      });

      if (!meetingResponse.ok) {
        throw new Error(`Zoom meeting creation failed: ${meetingResponse.status}`);
      }

      const meeting = (await meetingResponse.json()) as ZoomMeetingResponse;

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

  // ─── Google Meet (stub — requires full OAuth flow) ────────────────────────

  private async provisionGoogleMeet(
    lessonId: string,
    _topic: string,
  ): Promise<LiveSessionResult> {
    const { GOOGLE_MEET_CLIENT_ID } = this.env;

    if (!GOOGLE_MEET_CLIENT_ID) {
      this.logger.warn('Google Meet credentials not configured — creating stub session');
    } else {
      this.logger.log('Google Meet provisioning is stubbed — full OAuth flow needed');
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
