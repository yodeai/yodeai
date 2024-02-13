// pages/api/logout.js
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    // Replace 'yourCookieName' with the name of the cookie you want to remove
    const cookieName = 'googleAccessToken';
    // // Set the cookie in the response headers
    const response = new NextResponse();
    response.cookies.delete(cookieName)

    // Respond with a message or data as needed
    return response;
  } catch (error) {
    console.error('Error removing cookie:', error.message);
    return new NextResponse(
      JSON.stringify({ error: 'Internal Server Error' }),
      { status: 500 }
    );
  }
}
