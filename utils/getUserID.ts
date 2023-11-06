import { ok, notOk } from "@lib/ok";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { NextRequest } from "next/server";
import { cookies } from 'next/headers';

export async function getUserID() {
    const supabase = createServerComponentClient({ cookies });

    let { data, error } = await supabase.auth.getUser();
    if (error) {
        throw error;
    }
    return data.user.id;
  }
  