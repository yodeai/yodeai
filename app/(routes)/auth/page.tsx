// Your callback route (e.g., /auth/callback)
// This route should be specified as the redirectUri in your GoogleOAuth2Client configuration
"use client";
import { useEffect } from 'react';
import { checkGoogleAccountConnected } from '@utils/googleUtils';
import { useState } from 'react';
import { Container, Loader } from '@mantine/core';

const GoogleCallback = () => {
  const [accountConnected, setAccountConnected] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleGoogleAuth = async () => {
      try {
        // Extract the authorization code from the URL
        const urlParams = new URLSearchParams(window.location.search);
        const authorizationCode = urlParams.get('code');

        if (authorizationCode) {
          // Call the backend to exchange the authorization code for Google tokens
          try {
            const setCookieResponse = await fetch("/api/google/setCookie", {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                code: authorizationCode
              }),
            });

            if (setCookieResponse.ok) {
              setAccountConnected(true);
              await checkGoogleAccountConnected();
            } else {
              setAccountConnected(false);
              console.error("Failed to set Google cookie.");
            }
          } catch (error) {
            console.error('Error processing API response:', error.message);
          } finally {
            setLoading(false); // Set loading to false regardless of success or failure
          }
        }
      } catch (error) {
        console.error('Failed to handle Google authentication:', error.message);
        setLoading(false); // Set loading to false in case of an error
      }
    };

    // Call the function to handle Google authentication on component mount
    handleGoogleAuth();
  }, []);

  return (
    <Container className="max-w-3xl ">
      {loading ? (
        <Loader size="md" />
      ) : accountConnected === true ? (
        <div className="w-full flex flex-col p-8">
          <div className="flex items-start justify-between elevated-block p-8 rounded-md bg-white border border-gray-200 mb-4 mt-12">
            <p>Google Account connected! Please close this page.</p>
          </div>
        </div>
      ) : (
        <div className="w-full flex flex-col p-8">
          <div className="flex items-start justify-between elevated-block p-8 rounded-md bg-white border border-gray-200 mb-4 mt-12">
            <p>Google Account did not connect. Please retry again.</p>
          </div>
        </div>
      )}
    </Container>
  );
};

export default GoogleCallback;
