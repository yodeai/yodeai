// Your callback route (e.g., /auth/callback)
// This route should be specified as the redirectUri in your GoogleOAuth2Client configuration
"use client"
import { useEffect } from 'react';
import { googleOAuth2Client } from '@components/UserAccount';
import apiClient from '@utils/apiClient';
import Cookies from 'js-cookie';

const GoogleCallback = () => {
      
  useEffect(() => {
    // Extract the authorization code from the URL
    const urlParams = new URLSearchParams(window.location.search);
    const authorizationCode = urlParams.get('code');
    const callBackend = async() => {
        await apiClient('/googleAuth', 'POST', { code: authorizationCode })
        .then(result => {
            let google_tokens = result["google_tokens"]
            console.log("result", google_tokens["access_token"], google_tokens["expires_in"])
            Cookies.set("google", google_tokens["access_token"], {
                expires: new Date(new Date().getTime() + google_tokens["expires_in"] * 1000)
              });

              const google = Cookies.get("google");
console.log("access", google);
        })
        .catch(error => {
          console.error('failed :( ' + error.message);
        });
    }
    // Call getgoogle with the authorization code
    if (authorizationCode) {
        callBackend();
    
    }
  }, []);

  return <div>Google Account Connected!</div>;
};

export default GoogleCallback;
