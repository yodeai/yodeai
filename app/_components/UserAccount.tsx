"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import LogoutButton from './LogoutButton';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { User } from '@supabase/supabase-js';

const UserAccountHandler = () => {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
      const fetchData = async () => {
        const supabase = createClientComponentClient();
        const { data } = await supabase.auth.getUser();
        setUser(data?.user || null);
        
      };
  
      fetchData();
    }, []);
    

  return (
    <nav className="w-full   h-16">
      <div className="w-full max-w-4xl  justify-between p-3 text-sm text-foreground">
          {user ? (
            <div className=" gap-4">
              Hey, {user.email}!
              <LogoutButton />
            </div>
          ) : (
            <Link href="/login"  className="py-2 px-4 rounded-md bg-btn-background hover:bg-btn-background-hover">   
                Login
            </Link>
          )}
        </div>
    </nav>
  );
};

export default UserAccountHandler;
