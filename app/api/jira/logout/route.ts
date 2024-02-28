// pages/api/jira/logout.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Replace 'cookieName' with the name of the cookie you want to remove
    const cookieName = 'jiraAuthExists';
    // Set the cookie in the response headers
    const response = new NextResponse();
    response.cookies.delete(cookieName)
    return response;
  } catch (error) {
    console.error('Error removing cookie:', error.message);
    return new NextResponse(
      JSON.stringify({ error: 'Internal Server Error' }),
      { status: 500 }
    );
  }
}
