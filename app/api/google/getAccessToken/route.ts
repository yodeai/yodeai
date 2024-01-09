import axios from 'axios';
import { parse } from 'cookie';
import { NextResponse } from 'next/server';

export async function GET(req) {
  try {
    const cookieHeader = req.headers.cookie || '';
    const cookies = parse(cookieHeader);
    const googleAccessToken = cookies.googleAccessToken; // Replace 'httpOnlyCookie' with your actual HTTP-only cookie name

    if (!googleAccessToken) {
      console.log("Google cookie not found");
      return new NextResponse(
        JSON.stringify({ error: 'Google cookie not found.' }),
        { status: 401 }
      );
    }

    const response = await axios.get("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: {
        Cookie: `httpOnlyCookie=${googleAccessToken}`,
      },
    });

    // Extract the value associated with googleAccessToken

    if (!googleAccessToken) {
      console.log("Google access token not found in response data");
      return new NextResponse(
        JSON.stringify({ error: 'Google access token not found in response data.' }),
        { status: 500 }
      );
    }

    // Return only the value associated with googleAccessToken
    return googleAccessToken;
  } catch (error) {
    console.error("Error checking access token validity:", error.message);
    return new NextResponse(
      JSON.stringify({ error: 'Failed to get Google user info.' }),
      { status: 500 }
    );
  }
}
