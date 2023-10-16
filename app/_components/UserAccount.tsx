"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import LogoutButton from './LogoutButton';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { User } from '@supabase/supabase-js';
import { useRouter } from 'next/router';

const UserAccountHandler = () => {
  const [user, setUser] = useState<User | null>(null);

  const supabase = createClientComponentClient();
  
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

    fetchData();
  }, []);


  return (
    <nav className="w-full  ">
      <div className="flex w-full max-w-4xl justify-between p-3 text-sm text-foreground">

        {user && user.email ? (
          <div className="flex gap-4 items-center">
            Hey, {user.email}!
            <LogoutButton />
          </div>
        ) : (
          <Link href="/login" className="py-2 px-4 rounded-md bg-btn-background hover:bg-btn-background-hover">
            Login
          </Link>
        )}

      </div>
    </nav>
  );
};

export default UserAccountHandler;
