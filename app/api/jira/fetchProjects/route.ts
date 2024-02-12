// pages/api/jira/fetchProjects.ts
import { NextRequest, NextResponse } from 'next/server';
import cookie from 'cookie';

export async function GET(request: NextRequest) {
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

        // Fetching Jira Projects recursively
        const response = await fetch(`https://api.atlassian.com/ex/jira/${siteId}/rest/api/2/project/search`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });

        // Check for errors in response
        if (!response.ok) {
            const errorResponse = await response.text();
            console.error('Failed to fetch Jira projects:', errorResponse);
            return new Response("Error fetching Jira projects", { status: response.status });
        }

        // Return the projects
        const projects = await response.json();
        console.log(projects);
        return new Response(JSON.stringify(projects), {
            headers: {
                'Content-Type': 'application/json'
            }
        });
    } catch (error) {
        console.error('Error:', error);
        return new Response("Server error while fetching Jira issues", { status: 500 });
    }
}
