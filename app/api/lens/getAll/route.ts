import { ok, notOk } from "@lib/ok";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { NextRequest } from "next/server";
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
    const supabase = createServerComponentClient({ cookies });
  
    try {
      const { data: lenses, error } = await supabase
        .from('lens')
        .select('*, lens_users(access_type)')
        .order('updated_at', { ascending: false });
  
      // Check for errors
      if (error) {
        throw error;
      }
      return ok(lenses);
    } catch (err) {
      return notOk(`${err}`);
    }
  }
  