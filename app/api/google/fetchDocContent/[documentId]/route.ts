import axios from 'axios';
import { parse } from 'cookie';
import { NextResponse, NextRequest } from 'next/server';

export async function GET(req, { params }: { params: { documentId: string }; }){
  try {
    const cookieHeader = req.headers.cookie || '';
    const cookies = parse(cookieHeader);
    const httpOnlyValue = cookies.httpOnlyCookie; // Replace 'httpOnlyCookie' with your actual HTTP-only cookie name

    if (!httpOnlyValue) {
      console.log("Google cookie not found");
      return false;
    }

    const response = await axios.get(`https://www.googleapis.com/drive/v3/files/${params.documentId}/export?mimeType=text/plain`, {
      headers: {
        Cookie: `httpOnlyCookie=${httpOnlyValue}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error checking access token validity:", error.message);
    return new NextResponse(
        JSON.stringify({ error: 'Failed to get Google Doc Content.' }),
        { status: 500 }
    );
  }
};
