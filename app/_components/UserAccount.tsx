"use client"
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import LogoutButton from './LogoutButton';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { User } from '@supabase/supabase-js';
import { Button, Flex, Text, Menu } from '@mantine/core';
import { checkGoogleAccountConnected, clearCookies, getUserInfo } from '@utils/googleUtils';
import { getAtlassianCookie, clearAtlassianCookies } from '@utils/atlassianUtils';
import { FaAtlassian, FaGoogle } from 'react-icons/fa';

const UserAccountHandler = () => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const supabase = createClientComponentClient();
  const [googleAccountConnected, setGoogleAccountConnected] = useState(false);
  const [atlassianAccountConnected, setAtlassianAccountConnected] = useState(false);
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
      window.removeEventListener('beforeunload', () => {});
    });
  };

  const removeGoogleAccount = () => {
    clearCookies();
    setGoogleAccountConnected(false);
  }

  const handleAtlassianLogin = async () => {
    router.push('/api/jira/connect');
  };

  const handleAtlassianLogout = async () => {
    await clearAtlassianCookies();
    setAtlassianAccountConnected(false);
    window.location.reload();
  };

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        const { data: { user }, error } = await supabase.auth.getUser();

        if (isMounted) {
          if (error && error.status === 401) {
            setUser(null);
          } else if (user) {
            setUser(user);
          }
        }
      }
    };

    const fetchAndCheckGoogle = async () => {
      await fetchData();
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
  }, []);

  useEffect(() => {
    const jiraAuthCookie = getAtlassianCookie('jiraAuthExists');
    if (!jiraAuthCookie) {
      setAtlassianAccountConnected(false);
      console.log('No Jira Auth cookie found');
    } else {
      setAtlassianAccountConnected(true);
    }
  }, []);

  return (
    <nav className="w-full">
    <Flex justify={"flex-end"}>
      {user && user.email ? (
        <div className="flex gap-4 items-center">
          <Text
            size='sm'
            c={"gray.8"}
            fw={500}
          >
            Hey, {user.email}!
          </Text>
          <Menu shadow="md">
            <Menu.Target>
              <Button color="blue" size="xs" variant="light">
                Connect Accounts
              </Button>
            </Menu.Target>
            <Menu.Dropdown>
              { googleAccountConnected ?
                <Menu.Item
                  onClick={removeGoogleAccount}
                  leftSection={<FaGoogle color="red"/>} color="red" variant="light">
                  Remove Google
                </Menu.Item> :
                <Menu.Item
                  onClick={openGoogleAuthWindow}
                  leftSection={<FaGoogle color="red"/>} variant="light">
                  Connect Google
                </Menu.Item>
              }
              { atlassianAccountConnected ?
                <Menu.Item
                  onClick={handleAtlassianLogout}
                  leftSection={<FaAtlassian color="blue"/>} color="red" variant="light">
                  Remove Atlassian
                </Menu.Item> :
                <Menu.Item
                  onClick={handleAtlassianLogin}
                  leftSection={<FaAtlassian color="blue"/>} variant="light">
                  Connect Atlassian
                </Menu.Item>
              }
            </Menu.Dropdown>
          </Menu>
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
