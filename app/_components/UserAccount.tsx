"use client"
import React, { useEffect, useState } from 'react';
import { FaAngleDown } from '@react-icons/all-files/fa/FaAngleDown';
import Link from 'next/link';
import LogoutButton from './LogoutButton';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Button, Flex, Menu, Text } from '@mantine/core';
import { checkGoogleAccountConnected, clearCookies } from '@utils/googleUtils';
import { useAppContext } from '@contexts/context';
import { User } from '@supabase/auth-helpers-nextjs';

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
        {user && user.email
          ? <Menu>
            <Menu.Target>
              <Button variant="outline" color="gray" className="flex gap-3 text-center align-middle">
                <Text
                  size='sm'
                  c={"gray.8"}
                  fw={500}
                >
                  {user.email}
                </Text>
                <FaAngleDown size={18} className="ml-1 text-gray-500" />
              </Button>
            </Menu.Target>
            <Menu.Dropdown>
              {googleAccountConnected && <Menu.Item onClick={removeGoogleAccount} color="red" variant="light">
                Remove Google Account
              </Menu.Item>}
              {!googleAccountConnected &&
                <Menu.Item onClick={openGoogleAuthWindow} color="blue" variant="light">
                  Connect Google Account
                </Menu.Item>}
              <Menu.Item>
                <LogoutButton />
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
          : <Link href="/login">
            <Button type="submit" color="blue" size="xs" variant="light">
              Login
            </Button>
          </Link>}
      </Flex>
    </nav >
  );
};

export default UserAccountHandler;
