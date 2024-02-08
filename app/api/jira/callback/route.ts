import { NextResponse, NextRequest } from 'next/server';
import cookie from 'cookie';

export async function GET(request: NextRequest) {
  if (request.nextUrl.pathname === '/api/jira/callback') {
    const requestUrl = new URL(request.url);

    const code = request.nextUrl.searchParams.get('code');
    if (code) {
      console.log("Authorization Code:", code);
      const tokenResponse = await exchangeAuthorizationCodeForToken(code);
      console.log("Access Token:", tokenResponse);
      const cloudID = await exchangeTokenForCloudID(tokenResponse.access_token);
      const firstSite = cloudID[0];
      console.log("CloudID:", cloudID);

      if (firstSite) {
        const cookieLife = 60 * 60 * 24000 * 30; // 30 days

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
}

async function exchangeAuthorizationCodeForToken(code: string) {
  const tokenEndpoint = 'https://auth.atlassian.com/oauth/token';
  const client_id = process.env.JIRA_CLIENT_ID;
  const client_secret = process.env.JIRA_CLIENT_SECRET;
  const redirect_uri = `${process.env.NEXT_PUBLIC_API_BASE_URL}/jira/callback`;

  const response = await fetch(tokenEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      grant_type: 'authorization_code',
      client_id: client_id,
      client_secret: client_secret,
      code: code,
      redirect_uri: redirect_uri
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
