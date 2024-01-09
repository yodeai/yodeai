import axios from 'axios';
import { parse } from 'cookie';
import { NextResponse, NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const cookieHeader = req.headers.get('cookie');
    const cookies = parse(cookieHeader || "");
    const accessToken = cookies["googleAccessToken"]; // Replace 'googleAccessToken' with your actual cookie name
    if (!accessToken) {
      console.log("Google cookie not found");
      return new NextResponse(
        JSON.stringify({ isValid: false, error: 'Invalid Access Token' }),
        { status: 200 }
      );
    }

    const response = await axios.get(`https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=${accessToken}`, {
      headers: {
        Cookie: `httpOnlyCookie=${accessToken}`,
      },
    });

    const isValid = response.status === 200;

    return new NextResponse(
      JSON.stringify({ isValid }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error checking access token validity:", error.message);
    return new NextResponse(
      JSON.stringify({ isValid: false, error: 'Internal Server Error' }),
      { status: 500 }
    );
  }
}
