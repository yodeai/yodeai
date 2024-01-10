import axios from 'axios';
import { NextRequest, NextResponse } from 'next/server';
import { parse } from 'cookie';

async function replaceContent(googleDocId, content, oldContent, accessToken, title) {
  try {
    console.log("OLD CONTENT", oldContent, "new content", content);

    let requests = [];

    if (oldContent !== null && oldContent !== "") {
      // Replace existing text
      requests.push({
        replaceAllText: {
          replaceText: content,
          containsText: {
            text: oldContent,
            matchCase: true,
          },
        },
      });
    } else {
      // Insert new text
      requests.push({
        insertText: {
          text: content,
          location: {
            index: 1, // Adjust the index based on where you want to insert the text
          },
        },
      });
    }

    const batchUpdateRequest = {
      requests: requests,
    };

    // Batch update request
    const replaceResponse = await axios.post(
      `https://docs.googleapis.com/v1/documents/${googleDocId}:batchUpdate`,
      batchUpdateRequest,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (replaceResponse.status !== 200) {
      console.error('Failed to replace/insert content in Google Doc:', replaceResponse.statusText);
      return false;
    }

    // Update the title
    const updateResponse = await axios.patch(
      `https://www.googleapis.com/drive/v3/files/${googleDocId}`,
      {
        name: title, // Replace with the desired new title
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (updateResponse.status === 200) {
      console.log('Google Doc content and title updated successfully');
      return true;
    } else {
      console.error('Failed to update title of Google Doc:', updateResponse.statusText);
      return false;
    }
  } catch (error) {
    console.error('Error replacing/inserting content and updating title of Google Doc:', error.message);
    return false;
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { google_doc_id, content, oldContent, title } = await req.json();
    console.log("KATE", google_doc_id, "content", content);

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

    // Replace/insert content and update title
    const success = await replaceContent(google_doc_id, content, oldContent, accessToken, title);

    if (success) {
      return new NextResponse(JSON.stringify({ success: true }), { status: 200 });
    } else {
      return new NextResponse(JSON.stringify({ success: false }), { status: 500 });
    }
  } catch (error) {
    console.error('Error updating/replacing/inserting content and title of Google Doc:', error.message);
    return new NextResponse(JSON.stringify({ success: false }), { status: 500 });
  }
}
