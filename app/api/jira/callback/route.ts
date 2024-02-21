import { NextResponse, NextRequest } from 'next/server';
import cookie from 'cookie';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const origin = request.nextUrl.origin;
  const code = request.nextUrl.searchParams.get('code');
  if (code) {
    // console.log("Authorization Code:", code);
    const tokenResponse = await exchangeAuthorizationCodeForToken(code, origin);
    // console.log("Access Token:", tokenResponse);
    const cloudID = await exchangeTokenForCloudID(tokenResponse.access_token);
    const firstSite = cloudID[0];
    // console.log("CloudID:", cloudID);

    if (firstSite) {
      const cookieLife = 60 * 60 * 24000; // 1 day

      const jiraAuthCookieExists = cookie.serialize('jiraAuthExists', JSON.stringify({
        accessTokenExists: true,
        siteId: firstSite.id,
        siteUrl: firstSite.url
      }), {
        path: '/',
        httpOnly: false,
        expires: new Date(Date.now() + cookieLife),
        sameSite: 'strict'
      });

      const jiraAuthCookie = cookie.serialize('jiraAuth', JSON.stringify({
        accessToken: tokenResponse.access_token,
        siteId: firstSite.id,
        siteUrl: firstSite.url
      }), {
        path: '/',
        httpOnly: true,
        expires: new Date(Date.now() + cookieLife),
        sameSite: 'strict'
      });

      const response = NextResponse.redirect(`${requestUrl.origin}/`);

      response.headers.append('Set-Cookie', jiraAuthCookieExists);
      response.headers.append('Set-Cookie', jiraAuthCookie);

      return response;

    } else {
      console.error('No sites available');
    }

    return NextResponse.redirect(`${requestUrl.origin}/`);
  } else {
    return new Response("Error authenticating with Jira", { status: 400 });
  }
}

async function exchangeAuthorizationCodeForToken(code: string, origin: string) {
  const tokenEndpoint = 'https://auth.atlassian.com/oauth/token';
  let client_id: string = process.env.JIRA_CLIENT_ID;
  let client_secret: string = process.env.JIRA_CLIENT_SECRET;

  const redirect_uri = process.env.VERCEL
    ? `https://${process.env.VERCEL_URL}/api/jira/callback`
    : `http://localhost:3000/api/jira/callback`;

  const response = await fetch(tokenEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      grant_type: 'authorization_code',
      client_id, client_secret,
      code, redirect_uri
    })
  });

  if (!response.ok) {
    const errorResponse = await response.text();
    console.error('Token exchange failed:', errorResponse);
    throw new Error('Failed to exchange authorization code for token');
  }

  return await response.json();
}

async function exchangeTokenForCloudID(token: string) {
  try {
    const response = await fetch('https://api.atlassian.com/oauth/token/accessible-resources', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      const errorResponse = await response.text();
      console.error('Token exchange failed:', errorResponse);
      throw new Error('Failed to fetch Cloud ID');
    }

    return await response.json();
  } catch (error) {
    console.error('Error:', error);
    throw new Error('Error fetching Cloud ID');
  }
}
