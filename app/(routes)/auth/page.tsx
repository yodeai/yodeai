// Your callback route (e.g., /auth/callback)
// This route should be specified as the redirectUri in your GoogleOAuth2Client configuration
"use client"
import { useEffect } from 'react';
import { googleOAuth2Client } from '@components/UserAccount';
import apiClient from '@utils/apiClient';

const GoogleCallback = () => {
      
  useEffect(() => {
    // Extract the authorization code from the URL
    const urlParams = new URLSearchParams(window.location.search);
    const authorizationCode = urlParams.get('code');
    const callBackend = async() => {
        await apiClient('/googleAuth', 'POST', { code: authorizationCode })
        .then(result => {
          console.log('yay', result);
        })
        .catch(error => {
          console.error('failed :( ' + error.message);
        });
    }
    // Call getGoogleAccessToken with the authorization code
    if (authorizationCode) {
        callBackend();
    
    }
  }, []);

  return <div>Processing...</div>;
};

export default GoogleCallback;
