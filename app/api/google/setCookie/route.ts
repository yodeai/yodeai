// pages/api/googleAuth.js
import axios from 'axios';
import { NextResponse, NextRequest } from 'next/server';
import { CookieSerializeOptions, serialize } from 'cookie';

export async function POST(req: NextRequest) {
  try {
    const {code} = await req.json();

    const response = await axios.post(
      'https://oauth2.googleapis.com/token',
      {
        code: code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: process.env.REDIRECT_URI,
        grant_type: 'authorization_code',
      }
    );
    if (response.status != 200) {
        return new NextResponse(
            JSON.stringify({ error: 'Invalid request parameters' }),
            { status: 400 }
        )
    }

        const body = response.data;

        // Replace 'yourCookieName' and 'yourCookieValue' with your desired cookie name and value
        const cookieName = 'googleAccessToken';
        const cookieValue = body["access_token"];
        const expire_seconds = body["expires_in"];
        if (!cookieValue || isNaN(expire_seconds)) {
            return new NextResponse(
                JSON.stringify({ error: 'Invalid request parameters' }),
                { status: 400 }
            )
        }
        // Set the cookie options, including httpOnly: true
        const cookieOptions: CookieSerializeOptions = {
          httpOnly: true,
          secure: process.env.NODE_ENV == 'production', // Set to true in production for secure (HTTPS) connections
          sameSite: 'strict', 
          maxAge: expire_seconds, 
          path: '/'
        };
    
        // Serialize the cookie
        const serializedGoogleCookie = serialize(cookieName, cookieValue, cookieOptions);
    
        // Set the cookie in the response headers
        const newResponse = new NextResponse();
        newResponse.headers.append('Set-Cookie', serializedGoogleCookie);
    
        // Respond with a message or data as needed
        return newResponse


  }  catch (error) {
    console.error('Error setting HTTP-only cookie:', error.message);
    return new NextResponse(
        JSON.stringify({ error: 'Invalid request parameters' }),
        { status: 500 }
    )
  }
}
