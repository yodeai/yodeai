// Your callback route (e.g., /auth/callback)
// This route should be specified as the redirectUri in your GoogleOAuth2Client configuration
"use client";
import { useCallback, useEffect } from 'react';
import { checkGoogleAccountConnected, getUserInfo } from '@utils/googleUtils';
import { useState } from 'react';
import { Container, Loader } from '@mantine/core';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { readLocalStorageValue } from '@mantine/hooks';
import { Result } from '@components/Result';
import { FaCircleNotch } from '@react-icons/all-files/fa/FaCircleNotch';

const GoogleCallback = () => {
  const supabase = createClientComponentClient()
  const [accountConnected, setAccountConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const currentPageBeforeAuth: string = readLocalStorageValue({ key: "currentPageBeforeAuth" })

  const setUserToAppContext = useCallback(() => {
    return getUserInfo().then((googleUser) => {
      return supabase.auth.updateUser({
        data: {
          google_user_id: googleUser
        }
      })
    });
  }, [])

  const setCookie = useCallback(async (code) => {
    try {
      const setCookieResponse = await fetch("/api/google/setCookie", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code
        }),
      });

      if (setCookieResponse.ok) {
        await checkGoogleAccountConnected();
      } else {
        setAccountConnected(false);
        console.error("Failed to set Google cookie.");
      }
    } catch (error) {
      console.error('Error processing API response:', error.message);
    }
  }, [])

  useEffect(() => {
    const handleGoogleAuth = async () => {
      try {
        // Extract the authorization code from the URL
        const urlParams = new URLSearchParams(window.location.search);
        const authorizationCode = urlParams.get('code');

        if (authorizationCode) {
          await setCookie(authorizationCode);
          await setUserToAppContext();
          window.location.replace(currentPageBeforeAuth);
        } else {
          setAccountConnected(false);
        }
      } catch (error) {
        console.error('Failed to handle Google authentication:', error.message);
        setLoading(false); // Set loading to false in case of an error
      } finally {
        setAccountConnected(true);
        setLoading(false);
      }
    };

    // Call the function to handle Google authentication on component mount
    handleGoogleAuth();
  }, []);

  return (
    <Container className="max-w-3xl">
      {!loading && accountConnected === false
        && (
          <div className="w-full flex flex-col p-8">
            <div className="flex items-start justify-between elevated-block p-8 rounded-md bg-white border border-gray-200 mb-4 mt-12">
              <p>Google Account did not connect. Please retry again.</p>
            </div>
          </div>
        )
      }
      {/* 
        if account is connected, we redirect to the page before the user was redirected to the Google login page
        so we can keep showing the loader while the page is redirecting
      */}
      {(loading || accountConnected === true) && <Result
        title="Connecting..."
        description="Please wait while we connect your Google account."
        icon={<FaCircleNotch className="animate-spin" size={24} />} />
      }
    </Container>
  );
};

export default GoogleCallback;
