import { parse } from 'cookie';
import { NextResponse } from 'next/server';

export async function GET(req) {
  try {
    const cookieHeader = req.headers.get('cookie');
    const cookies = parse(cookieHeader || "");
    const accessToken = cookies["googleAccessToken"]; // Replace 'googleAccessToken' with your actual cookie name

    // Extract the value associated with googleAccessToken

    if (!accessToken) {
      return new NextResponse(
        JSON.stringify({ error: 'Google access token not found in response data.' }),
        { status: 500 }
      );
    }

    // Return only the value associated with googleAccessToken
    return new NextResponse(
      JSON.stringify({ accessToken: accessToken }),
      { status: 200 }
  );
  } catch (error) {
    console.error("Error checking access token validity:", error.message);
    return new NextResponse(
      JSON.stringify({ error: 'Failed to get accessToken info.' }),
      { status: 500 }
    );
  }
}
