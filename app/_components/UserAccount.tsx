"use client"
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import LogoutButton from './LogoutButton';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { User } from '@supabase/supabase-js';
import { useRouter } from 'next/router';
import { Button, Flex, Text } from '@mantine/core';
import { DEFAULT_WELCOME_CONTENT, DEFAULT_WELCOME_TITLE } from '@api/constants';
import { RequestBodyType } from '@api/types';

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

            const { data: userData, error: userError } = await supabase
              .from('users')
              .select()
              .eq('id', user?.id)
              .single();

            if (userError) {
              console.error('Error getting user', userError);
            }
            if (userData.first_sign_in) {
              // automatically create a new welcome block for this user
              const requestBody: RequestBodyType = {
                block_type: 'note',
                content: DEFAULT_WELCOME_CONTENT,
                title: DEFAULT_WELCOME_TITLE,
                delay: 0,
              };
              let method = 'POST';
              let endpoint = `/api/block`;
              try {
                const response = await fetch(endpoint, {
                  method: method,
                  body: JSON.stringify(requestBody),
                });

                // Check if the block creation was successful before updating the user
                if (response.ok) {
                  // Update the user's first_sign_in field
                  await supabase.from('users').update({ first_sign_in: false }).eq('id', user.id);
                } else {
                  console.error('Error creating welcome block:', response.status, response.statusText);
                }
              } catch (error) {
                console.error('Error creating welcome block:', error.message);
              }
            }
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
