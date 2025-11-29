import { google } from 'googleapis';
import { db } from '@/lib/firebaseAdmin';
import { NextRequest, NextResponse } from 'next/server';

/**
 * OAuth callback handler
 * GET /api/oauth/google/callback?code=<auth_code>&state=<uid>
 *
 * Exchanges authorization code for tokens and stores refresh_token in Firestore
 */
export async function GET(request: NextRequest) {
  try {
    const code = request.nextUrl.searchParams.get('code');
    const state = request.nextUrl.searchParams.get('state'); // uid
    const errorCode = request.nextUrl.searchParams.get('error');

    // Handle user rejection
    if (errorCode) {
      return new NextResponse(
        `
        <html>
          <body>
            <h2>Calendar Access Denied</h2>
            <p>You declined calendar access. You can retry anytime from your prescriptions.</p>
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9002'}">← Back to App</a>
          </body>
        </html>
        `,
        { status: 403, headers: { 'content-type': 'text/html' } }
      );
    }

    if (!code || !state) {
      return NextResponse.json({ error: 'Missing code or state' }, { status: 400 });
    }

    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL}/api/oauth/google/callback`;

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      redirectUri
    );

    // Exchange authorization code for tokens
    const { tokens } = await oauth2Client.getToken(code);

    // Store refresh token in Firestore (uid from state)
    // TODO: Encrypt refresh_token at rest using KMS
    await db.collection('google_oauth_tokens').doc(state).set(
      {
        refresh_token: tokens.refresh_token || null,
        access_token: tokens.access_token || null,
        scopes: tokens.scope,
        updatedAt: new Date(),
      },
      { merge: true }
    );

    // Return success page
    return new NextResponse(`
      <html>
        <head>
          <title>Calendar Access Granted</title>
          <script>
            // Close window or redirect after 2 seconds
            setTimeout(() => {
              window.location.href = "${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9002'}/records";
            }, 2000);
          </script>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; background: #f5f5f5;">
          <div style="text-align: center; background: white; padding: 2rem; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            <h2>✓ Calendar Access Granted</h2>
            <p>Medicine reminders will be added to your Google Calendar.</p>
            <p style="color: #666; font-size: 0.9rem;">Redirecting in 2 seconds...</p>
          </div>
        </body>
      </html>
    `, { headers: { 'content-type': 'text/html' } });
  } catch (error) {
    console.error('OAuth callback error:', error);
    return new NextResponse(
      `
      <html>
        <body>
          <h2>⚠ Authorization Failed</h2>
          <p>Something went wrong during authorization. Please try again.</p>
          <pre>${(error as Error)?.message || 'Unknown error'}</pre>
          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9002'}">← Back to App</a>
        </body>
      </html>
      `,
      { status: 500, headers: { 'content-type': 'text/html' } }
    );
  }
}
