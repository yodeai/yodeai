import { ok, notOk } from "@lib/ok";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { NextRequest } from "next/server";
import { cookies } from 'next/headers';

var myUserID = "";
export async function getUserID() {
    const supabase = createServerComponentClient({ cookies });
    if (myUserID.length>0)
      return myUserID;

    let { data, error } = await supabase.auth.getUser();
    if (error) {
        throw error;
    }
    return data.user?.id;
  }
  