import axios from 'axios';
import { NextRequest, NextResponse } from 'next/server';
import { parse } from 'cookie';

export async function GET(req: NextRequest, { params }: { params: { documentId: string };}) {
    try {
  
      const cookieHeader = req.headers.get('cookie');
      const cookies = parse(cookieHeader || "");
      const accessToken = cookies["googleAccessToken"];
  
      if (!accessToken) {
        return new NextResponse(
          JSON.stringify({ isValid: false, error: 'Invalid Access Token' }),
          { status: 401 }
        );
      }

      const response = await axios.get(
        `https://docs.googleapis.com/v1/documents/${params.documentId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );
  
      if (response.status !== 200) {
        console.error('Failed to get end index', response.statusText);
        return new NextResponse(JSON.stringify({ error: 'Failed to get end index.' }), { status: 500 });
      }
      const content = response.data.body.content;
      const lastElement = content[content.length - 1];

      if (lastElement && lastElement.endIndex) {
          return new NextResponse(JSON.stringify({ data: parseInt(lastElement.endIndex) }), { status: 200 });
      } else {
          return new NextResponse(JSON.stringify({ error: 'End index not found in the last element.' }), { status: 500 });
      }

    } catch (error) {
        console.error("Error fetching end index:", error.message);
        return new NextResponse(
            JSON.stringify({ error: 'Failed to get Google Doc end index.' }),
            { status: 500 }
        );
    }
}
