"use client"
import React, { useEffect, useMemo, useState } from 'react';
import { FaAngleDown } from '@react-icons/all-files/fa/FaAngleDown';
import Link from 'next/link';
import LogoutButton from './LogoutButton';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Button, Flex, Menu, Text } from '@mantine/core';
import { checkGoogleAccountConnected, clearCookies } from '@utils/googleUtils';
import { useAppContext } from '@contexts/context';
import { User } from '@supabase/auth-helpers-nextjs';
import toast from 'react-hot-toast';
import { ImSpinner8 } from '@react-icons/all-files/im/ImSpinner8';

import { useLocalStorage } from '@mantine/hooks';
import { usePathname } from 'next/navigation';

type UserAccountHandlerProps = {
  user: User | null;
}
const UserAccountHandler = ({ user }: UserAccountHandlerProps) => {
  const [googleAccountConnected, setGoogleAccountConnected] = useState(false);
  const [redirectUri, setRedirectUri] = useState("")
  const supabase = createClientComponentClient();
  const [loading, setLoading] = useState(false);
  const pathname = usePathname();
  const [currentPageBeforeAuth, setCurrentPageBeforeAuth] = useLocalStorage({ key: 'currentPageBeforeAuth', defaultValue: '/', });

  const isGoogleAccountConnected = useMemo(() => {
    return user?.user_metadata?.google_user_id || false;
  }, [user])

  const openGoogleAuthWindow = async () => {
    setLoading(true);
    let authWindow: Window | null = null;

    const response = await fetch(`/api/google/redirectURI`);
    if (response.ok) {
      const content = await response.json();
      setCurrentPageBeforeAuth(pathname)
      window.location.replace(content.uri);
      // authWindow.onbeforeunload = async (event) => {

      //   alert('closed');
      //   try {
      //     const connected = await checkGoogleAccountConnected();
      //     if (connected) {
      //       window.location.reload();
      //     } else {
      //       setLoading(false);
      //       toast.error("Failed to connect Google account")
      //     }
      //   } catch (error) {
      //     console.error('Error checking Google account connection:', error);
      //     setLoading(false);
      //     toast.error("Failed to connect Google account")
      //   }
      //   return false;
      // }
    } else {
      console.error("Failed to fetch Google redirect uri", response.statusText);
      toast.error("Failed to fetch Google redirect uri")
    }
  };

  const removeGoogleAccount = async () => {
    setLoading(true);
    await clearCookies();
    await supabase.auth.updateUser({ data: { google_user_id: null } })
    setTimeout(() => {
      window.location.reload();
    }, 1000)
  }

  useEffect(() => {
    if(["/login", "/landing"].includes(pathname)) return;

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
  }, [user, pathname]);

  const onClickSignOut = async () => {
    // redirect window to sign out page with POST
    fetch('/api/auth/sign-out', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'same-origin',
    }).then(res => {
      if (res.ok) window.location.href = '/login';
    })
  }

  return (
    <nav className="w-full">
      <Flex align={"center"} justify={"flex-end"}>
        {user && user.email
          ? <Menu>
            <Menu.Target>
              <Button variant="outline" color="gray" className="flex gap-3 text-center align-middle" data-cy="user-account">
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
              <Menu.Item onClick={onClickSignOut} data-cy="logout">
                Logout
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
          : <Link href="/login">
            <Button type="submit" color="blue" size="xs" variant="light" data-cy="submit">
              Login
            </Button>
          </Link>}
      </Flex>
    </nav >
  );
};

export default UserAccountHandler;
