// pages/api/jira/logout.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const response = new NextResponse();
    response.cookies.delete('jiraAuthExists');
    response.cookies.delete('jiraAuth');
    return response;
  } catch (error) {
    console.error('Error removing cookie:', error.message);
    return new NextResponse(
      JSON.stringify({ error: 'Internal Server Error' }),
      { status: 500 }
    );
  }
}
