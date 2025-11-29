import { google } from 'googleapis';
import { db, auth } from '@/lib/firebaseAdmin';
import { NextRequest, NextResponse } from 'next/server';
import { CalendarEvent } from '@/lib/calendarUtils';

interface CreateCalendarRequest {
  events: CalendarEvent[];
  prescriptionId?: string;
}

interface CreateCalendarResponse {
  created: Array<{
    id: string;
    htmlLink: string;
    summary: string;
  }>;
  createdAt: string;
}

/**
 * Create calendar events for medicines
 * POST /api/calendar/create
 *
 * Expects:
 * - Authorization header: Bearer <Firebase ID Token>
 * - Body: { events: [...], prescriptionId?: string }
 *
 * Returns created event ids and htmlLinks
 */
export async function POST(request: NextRequest) {
  try {
    // Get Firebase ID token from Authorization header
    const authHeader = request.headers.get('authorization') || '';
    const idToken = authHeader.replace('Bearer ', '');

    console.log('[calendar/create] Authorization header present:', !!authHeader);
    if (!idToken) {
      console.error('[calendar/create] No ID token provided');
      return NextResponse.json(
        { error: 'missing_auth', message: 'Authorization header required' },
        { status: 401 }
      );
    }

    // Verify Firebase ID token
    let decodedToken;
    try {
      console.log('[calendar/create] Verifying ID token...');
      decodedToken = await auth.verifyIdToken(idToken);
      console.log('[calendar/create] ID token verified for uid:', decodedToken.uid);
    } catch (err: any) {
      console.error('[calendar/create] Token verification failed:', err?.message || err);
      return NextResponse.json(
        { error: 'invalid_token', message: 'Invalid or expired ID token', details: err?.message },
        { status: 401 }
      );
    }

    const uid = decodedToken.uid;

    // Get user's refresh token from Firestore
    const tokenDoc = await db.collection('google_oauth_tokens').doc(uid).get();

    if (!tokenDoc.exists || !tokenDoc.data()?.refresh_token) {
      return NextResponse.json(
        {
          error: 'no_refresh_token',
          message: 'User has not granted calendar access',
          needsReauth: true,
        },
        { status: 403 }
      );
    }

    const refreshToken = tokenDoc.data()?.refresh_token;
    console.log('[calendar/create] Token document data:', tokenDoc.data());

    // Initialize OAuth2 client with refresh token
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );

    oauth2Client.setCredentials({ refresh_token: refreshToken });
    // Try to ensure we can obtain an access token and log credentials
    try {
      const access = await oauth2Client.getAccessToken();
      console.log('[calendar/create] Obtained access token (short):', !!access?.token);
      console.log('[calendar/create] OAuth2 client credentials keys:', Object.keys(oauth2Client.credentials || {}));
    } catch (tokenErr: any) {
      console.error('[calendar/create] Failed to refresh access token from refresh_token:', tokenErr?.message || tokenErr);
    }

    // Create calendar service
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    // Parse request body
    const body = (await request.json()) as CreateCalendarRequest;
    const events = body.events || [];
    const prescriptionId = body.prescriptionId;

    if (!events.length) {
      return NextResponse.json(
        { error: 'no_events', message: 'Events array is empty' },
        { status: 400 }
      );
    }

    // Create events on calendar
    const created = [];

    try {
      for (const event of events) {
        try {
          console.log('[calendar/create] Creating event:', event.summary, event.start, event.recurrence);
          const response = await calendar.events.insert({
            calendarId: 'primary',
            requestBody: event,
          });

          console.log('[calendar/create] Event insert response:', response.status, response.data?.id, response.data?.htmlLink);

          created.push({
            id: response.data.id || '',
            htmlLink: response.data.htmlLink || '',
            summary: event.summary,
          });
        } catch (eventError: any) {
          console.error('[calendar/create] Failed to create individual event:', event.summary, eventError?.message || eventError);
          // Continue creating other events even if one fails
        }
      }

      console.log('[calendar/create] Created events count:', created.length);
    } catch (calendarError) {
      const err = calendarError as any;

      // Check if it's an auth error (refresh token expired or revoked)
      if (err.message?.includes('invalid_grant') || err.status === 401) {
        return NextResponse.json(
          {
            error: 'invalid_grant',
            message: 'Calendar access expired or revoked',
            needsReauth: true,
          },
          { status: 401 }
        );
      }

      throw calendarError;
    }

    // Store event creation metadata in Firestore if prescriptionId provided
    if (prescriptionId) {
      await db
        .collection('prescription_reminders')
        .doc(prescriptionId)
        .set(
          {
            eventIds: created.map((e) => e.id),
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          { merge: true }
        );
    }

    const response: CreateCalendarResponse = {
      created,
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Calendar create error:', error);
    return NextResponse.json(
      {
        error: 'server_error',
        message: (error as Error)?.message || 'Failed to create calendar events',
      },
      { status: 500 }
    );
  }
}
