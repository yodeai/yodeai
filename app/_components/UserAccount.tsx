"use client"
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import LogoutButton from './LogoutButton';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { User } from '@supabase/supabase-js';
import { useRouter } from 'next/router';
import { Button, Flex, Text } from '@mantine/core';

const UserAccountHandler = () => {
  const [user, setUser] = useState<User | null>(null);
  const supabase = createClientComponentClient();

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        const { data: { user }, error } = await supabase.auth.getUser();

        if (isMounted) {
          if (error && error.status === 401) {
            // No user logged in
            setUser(null);
          } else if (user) {
            // User is logged in
            setUser(user);
          }
        }
      }
    };

    fetchData();

    // Cleanup function to cancel ongoing tasks if the component unmounts
    return () => {
      isMounted = false;
    };
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
