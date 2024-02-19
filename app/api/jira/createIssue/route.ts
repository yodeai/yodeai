// pages/api/jira/createIssue.ts
import { NextRequest, NextResponse } from 'next/server';
import cookie from 'cookie';

export async function POST(request: NextRequest) {
    const cookies = request.headers.get('cookie');
    const parsedCookies = cookie.parse(cookies || '');

    const jiraAuthCookie = parsedCookies['jiraAuth'];
    if (!jiraAuthCookie) {
        return new Response("Missing jiraAuth cookie", { status: 400 });
    }

    const jiraAuthData = JSON.parse(decodeURIComponent(jiraAuthCookie));

    if (!jiraAuthData) {
        return new Response("Missing jiraAuth data", { status: 400 });
    }

    try {
        const accessToken = jiraAuthData.accessToken;
        const siteId = jiraAuthData.siteId;
        if (!accessToken || !siteId) {
            return new Response("Missing accessToken or siteId", { status: 400 });
        }

        const issueBody = await readRequestBody(request.body);

        // Create a Jira issue
        const response = await fetch(`https://api.atlassian.com/ex/jira/${siteId}/rest/api/2/issue`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: issueBody
        });

        // Check for errors in response
        if (!response.ok) {
            const errorResponse = await response.text();
            console.error('Failed to fetch Jira issues:', errorResponse);
            return new Response("Error fetching Jira issues", { status: response.status, statusText: errorResponse });
        }

        return response;
    } catch (error) {
        console.error('Error:', error);
        return new Response("Server error while fetching Jira issues", { status: 500 });
    }
}

async function readRequestBody(body: ReadableStream<Uint8Array>): Promise<string> {
    const reader = body.getReader();
    let result = '';
    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        result += new TextDecoder().decode(value);
    }
    return result;
}
