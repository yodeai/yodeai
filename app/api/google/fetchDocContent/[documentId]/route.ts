import axios from 'axios';
import { parse } from 'cookie';
import { NextResponse } from 'next/server';

export async function GET(req, { params }: { params: { documentId: string }; }){
  try {
    const cookieHeader = req.headers.get('cookie');
    const cookies = parse(cookieHeader || "");
    const accessToken = cookies["googleAccessToken"]; // Replace 'googleAccessToken' with your actual cookie name
    if (!accessToken) {
      return new NextResponse(
        JSON.stringify({ isValid: false, error: 'Invalid Access Token' }),
        { status: 401 }
      );
    }
    const response = await axios.get(`https://www.googleapis.com/drive/v3/files/${params.documentId}/export?mimeType=text/plain`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return new NextResponse(JSON.stringify({data: response.data}), {status : 200});

  } catch (error) {
    console.error("Error fetching doc content:", error.message);
    return new NextResponse(
        JSON.stringify({ error: 'Failed to get Google Doc Content.' }),
        { status: 500 }
    );
  }
};
