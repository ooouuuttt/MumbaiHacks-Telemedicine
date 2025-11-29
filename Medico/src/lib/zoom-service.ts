
'use server';

import { Buffer } from 'buffer';

interface ZoomMeeting {
  start_url: string;
  join_url: string;
}

async function getZoomAccessToken(): Promise<string> {
  const accountId = process.env.ZOOM_ACCOUNT_ID;
  const clientId = process.env.ZOOM_CLIENT_ID;
  const clientSecret = process.env.ZOOM_CLIENT_SECRET;

  if (!accountId || !clientId || !clientSecret) {
    throw new Error('Zoom credentials are not set in environment variables.');
  }

  const response = await fetch(`https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${accountId}`, {
    method: 'POST',
    headers: {
      'Authorization': 'Basic ' + Buffer.from(`${clientId}:${clientSecret}`).toString('base64'),
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error('Failed to get Zoom access token:', errorData);
    throw new Error(`Failed to get Zoom access token. Status: ${response.status}`);
  }

  const data = await response.json();
  return data.access_token;
}

interface CreateMeetingPayload {
  topic: string;
  startTime: string;
}

export async function createZoomMeeting(payload: CreateMeetingPayload): Promise<{ start_url: string; join_url: string, error?: string; }> {
  try {
    const accessToken = await getZoomAccessToken();
    
    const response = await fetch('https://api.zoom.us/v2/users/me/meetings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        topic: payload.topic,
        type: 2, // Scheduled meeting
        start_time: payload.startTime,
        duration: 30, // 30 minutes
        settings: {
          join_before_host: true,
          mute_upon_entry: true,
          participant_video: true,
          host_video: true,
          auto_recording: 'none',
        },
      }),
    });

    if (!response.ok) {
      const errorBody = await response.json();
      console.error('Zoom API Error:', errorBody);
      return { start_url: '', join_url: '', error: `Failed to create Zoom meeting. ${errorBody.message}` };
    }

    const meeting: ZoomMeeting = await response.json();
    return { start_url: meeting.start_url, join_url: meeting.join_url };
  } catch (error: any) {
    console.error('Error in createZoomMeeting:', error);
    return { start_url: '', join_url: '', error: error.message || 'An unexpected error occurred while creating the Zoom meeting.' };
  }
}
