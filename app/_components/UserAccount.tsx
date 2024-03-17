"use client"
import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import LogoutButton from './LogoutButton';
import { User } from '@supabase/supabase-js';
import { Button, Flex, Text } from '@mantine/core';
import { checkGoogleAccountConnected, clearCookies } from '@utils/googleUtils';
import toast from 'react-hot-toast';
import { ImSpinner8 } from '@react-icons/all-files/im/ImSpinner8';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

import { useLocalStorage } from '@mantine/hooks';
import { usePathname } from 'next/navigation';

type UserAccountHandlerProps = {
  user: User | null;
}
const UserAccountHandler = ({ user }: UserAccountHandlerProps) => {
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

  // useEffect(() => {
  //   let isMounted = true;

  //   const fetchAndCheckGoogle = async () => {
  //     const connected = await checkGoogleAccountConnected();
  //     setGoogleAccountConnected(connected);
  //     const response = await fetch(`/api/google/redirectURI`)
  //     if (response.ok) {
  //       // Assuming the document content is in plain text
  //       const content = await response.json();
  //       setRedirectUri(content.uri)
  //     } else {
  //       console.error("Failed to fetch Google redirect uri", response.statusText);
  //     }
  //   };

  //   fetchAndCheckGoogle();

  //   return () => {
  //     isMounted = false;
  //   };
  // }, [user]);

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
            {isGoogleAccountConnected ?
              <Button disabled={loading} onClick={removeGoogleAccount} color="red" size="xs" variant="light"
                className="flex justify-center align-middle gap-2">
                {loading && <ImSpinner8 size={12} className="animate-spin mr-2" />}
                <Text size="sm">Remove Google Account</Text>
              </Button> :
              <Button disabled={loading} onClick={openGoogleAuthWindow} color="blue" size="xs" variant="light">
                {loading && <ImSpinner8 size={12} className="animate-spin mr-2" />}
                <Text size="sm">Connect Google Account</Text>
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
