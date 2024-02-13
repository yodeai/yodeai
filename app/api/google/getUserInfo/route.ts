import axios from 'axios';
import { parse } from 'cookie';
import { NextResponse } from 'next/server';

export async function GET(req){
  try {
    const cookieHeader = req.headers.get('cookie');
    const cookies = parse(cookieHeader || "");
    const accessToken = cookies["googleAccessToken"];
    if (!accessToken) {
      return new NextResponse(
        JSON.stringify({ error: 'Invalid Access Token' }),
        { status: 401 }
      );
    }
    const response = await axios.get("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: {
            Authorization: `Bearer ${accessToken}`,
          },
    });
    return new NextResponse(JSON.stringify({data: response.data.sub}), {status : 200});
  } catch (error) {
    console.error("Error getting user info:", error.message);
    return new NextResponse(
        JSON.stringify({ error: 'Failed to get Google user info.' }),
        { status: 500 }
    );
  }
};

