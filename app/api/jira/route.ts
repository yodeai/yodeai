import { NextResponse, NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
    if (request.nextUrl.pathname === '/api/jira') {
        if (process.env.NEXT_PUBLIC_API_BASE_URL === "http://localhost:3000/api") {
            return NextResponse.redirect(process.env.JIRA_OAUTH_LOCAL_LINK);
        } else {
            return NextResponse.redirect(process.env.JIRA_OAUTH_PROD_LINK);
        }
    }
}
