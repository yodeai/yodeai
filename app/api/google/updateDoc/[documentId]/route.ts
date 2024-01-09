import axios from 'axios';
import { NextRequest, NextResponse } from 'next/server';
import { parse } from 'cookie';

export async function PUT(req: NextRequest, { params, body }: { params: { documentId: string }; body: { content: string }; }) {
  try {
    const cookieHeader = req.headers.get('cookie');
    const cookies = parse(cookieHeader || "");
    const accessToken = cookies["googleAccessToken"];

    if (!accessToken) {
      console.log("Google cookie not found");
      return new NextResponse(
        JSON.stringify({ isValid: false, error: 'Invalid Access Token' }),
        { status: 401 }
      );
    }

    // Assuming you have a variable currentDocument containing the updated content
    const currentDocument = body.content;

    // Send the updated content back to Google Docs API
    const updateResponse = await axios.put(
      `https://docs.googleapis.com/v1/documents/${params.documentId}`,
      { body: { content: currentDocument } }, // Modify this payload according to Google Docs API
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (updateResponse.status === 200) {
      console.log('Google Doc content updated successfully');
      return new NextResponse(JSON.stringify({ success: true }), { status: 200 });
    } else {
      console.error('Failed to update content of Google Doc:', updateResponse.statusText);
      return new NextResponse(JSON.stringify({ success: false }), { status: 500 });
    }
  } catch (error) {
    console.error('Error updating content of Google Doc:', error.message);
    return new NextResponse(JSON.stringify({ success: false }), { status: 500 });
  }
}
