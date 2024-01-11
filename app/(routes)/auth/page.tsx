// Your callback route (e.g., /auth/callback)
// This route should be specified as the redirectUri in your GoogleOAuth2Client configuration
"use client";
import { useEffect } from 'react';
import apiClient from '@utils/apiClient';
import { checkGoogleAccountConnected } from '@utils/googleUtils';

const GoogleCallback = () => {
  useEffect(() => {
    const handleGoogleAuth = async () => {
      try {
        // Extract the authorization code from the URL
        const urlParams = new URLSearchParams(window.location.search);
        const authorizationCode = urlParams.get('code');

        if (authorizationCode) {
          // Call the backend to exchange the authorization code for Google tokens
          try {
            const result = await apiClient('/googleAuth', 'POST', { code: authorizationCode });
              const google_tokens = result.google_tokens;

              // Set cookie with the Google access token and expiration seconds
              const setCookieResponse = await fetch("/api/google/signIn", {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  accessToken: google_tokens.access_token,
                  expireSeconds: google_tokens.expires_in,
                }),
              });

              if (setCookieResponse.ok) {
                console.log("Google Account Connected!");
                await checkGoogleAccountConnected();

              } else {
                console.error("Failed to set Google cookie.");
              }
          } catch (error) {
            console.error('Error processing API response:', error.message);
          }
        }
      } catch (error) {
        console.error('Failed to handle Google authentication:', error.message);
      }
    };

    // Call the function to handle Google authentication on component mount
    handleGoogleAuth();
  }, []);

  return <div>Google Account Connected! Please close this page.</div>;
};

export default GoogleCallback;
