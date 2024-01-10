import axios from 'axios';
import { NextRequest, NextResponse} from 'next/server';
import { parse } from 'cookie';

export async function POST(req: NextRequest) {
  try {
    const {title} = await req.json()
    const cookieHeader = req.headers.get('cookie');
    const cookies = parse(cookieHeader || "");
    const accessToken = cookies["googleAccessToken"]; // Replace 'googleAccessToken' with your actual cookie name
    if (!accessToken) {
      console.log("Google cookie not found");
      return new NextResponse(
        JSON.stringify({ isValid: false, error: 'Invalid Access Token' }),
        { status: 401 }
      );
    }
    const response = await axios.post(
      'https://www.googleapis.com/drive/v3/files',
      {
        name: title, // Document title
        mimeType: 'application/vnd.google-apps.document',

      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.status === 200) {
      const { id } = response.data;
      console.log('New Google Doc created with ID:', id);
      return new NextResponse(
        JSON.stringify({ google_doc_id: id }),
        { status: 200 }
      );
    } else {
      console.error('Failed to create a new Google Doc:', response.statusText);
      return new NextResponse(
        JSON.stringify({ error: 'Failed to create a new google doc'}),
        { status: response.status }
      );
    }
  } catch (error) {
    console.error('Error creating a new Google Doc:', error.message);
    return new NextResponse(
        JSON.stringify({ error: 'Error creating a new google doc' }),
        { status: 500 }
      );
  }
};
