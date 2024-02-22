import { NextResponse, NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    if (request.nextUrl.pathname === '/api/jira') {
        if (request.nextUrl.origin === "http://localhost:3000") {
            return NextResponse.redirect(process.env.JIRA_OAUTH_LOCAL_LINK);
        } else {
            return NextResponse.redirect(process.env.JIRA_OAUTH_PROD_LINK);
        }
    }
}
