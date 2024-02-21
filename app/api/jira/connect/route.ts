import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4, v4 } from 'uuid';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    const redirect_uri = process.env.VERCEL
        ? `https://${process.env.VERCEL_URL}/api/jira/callback`
        : `http://localhost:3000/api/jira/callback`;

    const url_params = new URLSearchParams({
        audience: "api.atlassian.com",
        client_id: process.env.JIRA_CLIENT_ID,
        scope: "read:jira-work read:jira-user",
        redirect_uri,
        state: v4(),
        response_type: "code",
        prompt: "consent"
    });
    const url = `https://auth.atlassian.com/authorize?${url_params.toString()}`;
    return NextResponse.redirect(url)
}
