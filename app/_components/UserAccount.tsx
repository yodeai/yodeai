"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import LogoutButton from './LogoutButton';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { User } from '@supabase/supabase-js';
import { Button, Flex, Text } from '@mantine/core';
import ClientOAuth2 from 'client-oauth2';
import { checkGoogleAccountConnected } from '@utils/googleUtils';

export const googleOAuth2Client = new ClientOAuth2({
  clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
  clientSecret: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_SECRET,
  accessTokenUri: 'https://accounts.google.com/o/oauth2/token',
  authorizationUri: 'https://accounts.google.com/o/oauth2/auth',
  redirectUri: 'http://localhost:3000/auth', // Replace with your redirect URI
  scopes: ['https://www.googleapis.com/auth/drive', 'https://www.googleapis.com/auth/userinfo.profile', 'https://www.googleapis.com/auth/documents'],
});

const UserAccountHandler = () => {
  const [user, setUser] = useState<User | null>(null);
  const supabase = createClientComponentClient();
  const [googleAccountConnected, setGoogleAccountConnected] = useState(false);



  useEffect(() => {

    const fetchData = async () => {

      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error && error.status === 401) {
          // No user logged in
          setUser(null);
        } else if (user) {
          // User is logged in
          setUser(user)
        }
      }
    }
    const fetchAndCheckGoogle = async () => {
      await fetchData();
      const connected = await checkGoogleAccountConnected();
      if (connected) {
        setGoogleAccountConnected(true)
      } else {
        setGoogleAccountConnected(false)
      }
    };
  
    fetchAndCheckGoogle();
  }, []);


  return (
    <nav className="w-full">
      <Flex justify={"flex-end"}>

        {user && user.email ? (
          <div className="flex gap-4 items-center">
            <Text
              size='sm'
              c={"gray.8"}
              // variant='gradient'
              fw={500}
              // gradient={{ from: 'red', to: 'yellow', deg: 90 }}
            >
              Hey, {user.email}!
            </Text>
            { googleAccountConnected ? <Text size='sm'
              c={"gray.8"}
              fw={500}> Google Account Connected </Text> :
            <a href={googleOAuth2Client.code.getUri()}>
            <Button color="blue" size="xs" variant="light">
              Connect Google Account
            </Button>
            </a>}
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
