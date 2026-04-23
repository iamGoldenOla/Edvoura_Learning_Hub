import { google } from 'googleapis';

export async function createGoogleMeetSession({
  title,
  startTime,
  endTime,
}: {
  title: string;
  startTime: string;
  endTime: string;
}) {
  const keyJsonStr = process.env.GOOGLE_SERVICE_ACCOUNT_KEY_JSON;
  
  if (!keyJsonStr) {
    throw new Error('GOOGLE_SERVICE_ACCOUNT_KEY_JSON environment variable is not set.');
  }

  const credentials = JSON.parse(keyJsonStr);

  const auth = new google.auth.JWT({
    email: credentials.client_email,
    key: credentials.private_key,
    scopes: ['https://www.googleapis.com/auth/calendar.events'],
  });

  const calendar = google.calendar({ version: 'v3', auth });

  // Use the calendar ID shared with the service account bot
  const calendarId = process.env.GOOGLE_CALENDAR_ID || 'edvouralearninghub@gmail.com';

  const event = {
    summary: title,
    start: {
      dateTime: startTime,
      timeZone: 'Africa/Lagos', // Default timezone or passed as param
    },
    end: {
      dateTime: endTime,
      timeZone: 'Africa/Lagos',
    },
    conferenceData: {
      createRequest: {
        requestId: `edvoura-meet-${Date.now()}`,
        conferenceSolutionKey: {
          type: 'hangoutsMeet',
        },
      },
    },
  };

  try {
    const response = await calendar.events.insert({
      calendarId,
      conferenceDataVersion: 1,
      requestBody: event,
    });

    const meetLink = response.data.hangoutLink;
    const hostLink = response.data.htmlLink;

    if (!meetLink) {
      throw new Error('Failed to generate Google Meet link.');
    }

    return {
      joinUrl: meetLink,
      hostUrl: hostLink || meetLink, // Optional host link
    };
  } catch (error) {
    console.error('Error creating Google Calendar event:', error);
    throw new Error('Failed to create Google Meet session.');
  }
}
