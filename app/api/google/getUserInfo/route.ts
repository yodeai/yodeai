import axios from 'axios';
import { parse } from 'cookie';
import { NextResponse } from 'next/server';

export async function GET(req){
  try {
    const cookieHeader = req.headers.cookie || '';
    const cookies = parse(cookieHeader);
    const httpOnlyValue = cookies.httpOnlyCookie; // Replace 'httpOnlyCookie' with your actual HTTP-only cookie name

    if (!httpOnlyValue) {
      console.log("Google cookie not found");
      return false;
    }

    const response = await axios.get("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: {
        Cookie: `httpOnlyCookie=${httpOnlyValue}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error checking access token validity:", error.message);
    return new NextResponse(
        JSON.stringify({ error: 'Failed to get Google user info.' }),
        { status: 500 }
    );
  }
};

