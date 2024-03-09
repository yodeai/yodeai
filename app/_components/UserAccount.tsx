"use client"
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import LogoutButton from './LogoutButton';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { User } from '@supabase/supabase-js';
import { Button, Flex, Text } from '@mantine/core';
import { checkGoogleAccountConnected, clearCookies } from '@utils/googleUtils';


type UserAccountHandlerProps = {
  user: User | null;
}
const UserAccountHandler = ({user}: UserAccountHandlerProps) => {
  const supabase = createClientComponentClient();
  const [googleAccountConnected, setGoogleAccountConnected] = useState(false);
  const [redirectUri, setRedirectUri] = useState("")

  const openGoogleAuthWindow = () => {
    const authWindow = window.open(redirectUri);

    // Add event listener for beforeunload when the window is closed
    window.addEventListener('beforeunload', async () => {
      try {
        const connected = await checkGoogleAccountConnected();
        setGoogleAccountConnected(connected);
        console.log("Set connected", connected)
      } catch (error) {
        console.error('Error checking Google account connection:', error);
      }

      // Clean up event listener
      window.removeEventListener('beforeunload', () => { });
    });
  };

  const removeGoogleAccount = () => {
    clearCookies();
    setGoogleAccountConnected(false);
  }

  useEffect(() => {
    let isMounted = true;

    const fetchAndCheckGoogle = async () => {
      const connected = await checkGoogleAccountConnected();
      setGoogleAccountConnected(connected);
      const response = await fetch(`/api/google/redirectURI`)
      if (response.ok) {
        // Assuming the document content is in plain text
        const content = await response.json();
        setRedirectUri(content.uri)
      } else {
        console.error("Failed to fetch Google redirect uri", response.statusText);
      }
    };

    fetchAndCheckGoogle();

    return () => {
      isMounted = false;
    };
  }, [user]);

  return (
    <nav className="w-full">
      <Flex align={"center"} justify={"flex-end"}>
        {user && user.email ? (
          <div className="flex gap-4 items-center">
            <Text
              size='sm'
              c={"gray.8"}
              fw={500}
            >
              Hey, {user.email}!
            </Text>
            {googleAccountConnected ?
              <Button onClick={removeGoogleAccount} color="red" size="xs" variant="light">
                Remove Google Account
              </Button> :
              <Button onClick={openGoogleAuthWindow} color="blue" size="xs" variant="light">
                Connect Google Account
              </Button>
            }
            <LogoutButton />
          </div>
        ) : (
          <Link href="/login">
            <Button type="submit" color="blue" size="xs" variant="light">
              Login
            </Button>
          </Link>
        )}

      </Flex>
    </nav>
  );
};

export default UserAccountHandler;
