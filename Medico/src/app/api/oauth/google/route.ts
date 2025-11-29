import { google } from 'googleapis';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Generate Google OAuth consent URL for Calendar access
 * GET /api/oauth/google?uid=<uid>
 *
 * Redirects user to Google consent screen
 * After consent, user is redirected to /api/oauth/google/callback
 */
export async function GET(request: NextRequest) {
  try {
    const uid = request.nextUrl.searchParams.get('uid');

    if (!uid) {
      return NextResponse.json({ error: 'uid query parameter required' }, { status: 400 });
    }

    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL}/api/oauth/google/callback`;

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      redirectUri
    );

    // Generate consent URL with offline access and consent prompt
    // TODO: In production, sign the state param to prevent CSRF
    const url = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent', // Force re-consent to ensure we get refresh_token
      scope: ['https://www.googleapis.com/auth/calendar'],
      state: uid, // Attach UID in state
    });

    return NextResponse.redirect(url);
  } catch (error) {
    console.error('OAuth redirect error:', error);
    return NextResponse.json({ error: 'Failed to generate consent URL' }, { status: 500 });
  }
}
