import { NextResponse, NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
    if (request.nextUrl.pathname === '/api/jira') {
        if (process.env.NEXT_PUBLIC_API_BASE_URL === "http://localhost:3000/api") {
            return NextResponse.redirect("https://auth.atlassian.com/authorize?audience=api.atlassian.com&client_id=VorSFdUOMKYp1BKRWhQLFGWKy5ZWYWBc&scope=read%3Ajira-work%20write%3Ajira-work%20manage%3Ajira-project%20read%3Ajira-user%20manage%3Ajira-configuration%20manage%3Ajira-webhook%20manage%3Ajira-data-provider&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fapi%2Fjira%2Fcallback&state=${YOUR_USER_BOUND_VALUE}&response_type=code&prompt=consent");
        } else {
            return NextResponse.redirect("https://auth.atlassian.com/authorize?audience=api.atlassian.com&client_id=ZD8JHgVYBgD2wAwkOzyu0sTMEpEl7A1z&scope=read%3Ajira-work%20manage%3Ajira-configuration%20read%3Ajira-user%20manage%3Ajira-project%20write%3Ajira-work%20manage%3Ajira-webhook%20manage%3Ajira-data-provider&redirect_uri=https%3A%2F%2Fyodeai.vercel.app%2Fapi%2Fjira%2Fcallback&state=${YOUR_USER_BOUND_VALUE}&response_type=code&prompt=consent");
        }
    }
}
