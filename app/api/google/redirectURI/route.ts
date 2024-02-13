// pages/api/auth/google.js
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    // Your server-side authentication logic here
    // Use req.body to pass any necessary data from the client

    // Example: Return Google OAuth URI
    const googleOAuth2Config = {
      clientId: process.env.GOOGLE_CLIENT_ID,
      redirectUri: process.env.REDIRECT_URI, // Replace with your redirect URI
      scopes: ['https://www.googleapis.com/auth/drive', 'https://www.googleapis.com/auth/userinfo.profile', 'https://www.googleapis.com/auth/documents'],
    };

    const authUri = `https://accounts.google.com/o/oauth2/auth?client_id=${googleOAuth2Config.clientId}&redirect_uri=${encodeURIComponent(googleOAuth2Config.redirectUri)}&scope=${googleOAuth2Config.scopes.join('%20')}&response_type=code&access_type=offline&prompt=consent`;

    return new NextResponse(
        JSON.stringify({ uri: authUri }),
        { status: 200 }
    );
  } catch (error) {
    console.error('Error during authentication:', error);
    return new NextResponse(
        JSON.stringify({ error: 'Failed to retrieve auth URI' }),
        { status: 500 }
    );
  }
}
