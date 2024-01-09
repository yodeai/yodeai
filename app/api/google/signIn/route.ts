import { serialize } from 'cookie';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    // Replace 'yourCookieName' and 'yourCookieValue' with your desired cookie name and value
    const body = await req.json();
    const cookieName = 'googleAccessToken';
    const cookieValue = body.accessToken;
    const expire_seconds = body.expireSeconds;
    if (!cookieValue || isNaN(expire_seconds)) {
    console.log('Request body:', body);

    return new NextResponse(
        JSON.stringify({ error: 'Invalid request parameters' }),
        { status: 400 }
    )
    }
    // Set the cookie options, including httpOnly: true
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NEXT_PUBLIC_NODE_ENV == 'production', // Set to true in production for secure (HTTPS) connections
      sameSite: 'Strict', 
      maxAge: expire_seconds, 
      path: '/',

    };

    // Serialize the cookie
    const serializedGoogleCookie = serialize(cookieName, cookieValue, cookieOptions);

    // Set the cookie in the response headers
    const response = new NextResponse();
    response.headers.append('Set-Cookie', serializedGoogleCookie);

    // Respond with a message or data as needed
    return response
  } catch (error) {
    console.error('Error setting HTTP-only cookie:', error.message);
    return new NextResponse(
        JSON.stringify({ error: 'Invalid request parameters' }),
        { status: 500 }
    )
  }
};
