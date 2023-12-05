import { ok, notOk } from "@lib/ok";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { NextRequest } from "next/server";
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
    const supabase = createServerComponentClient({ cookies });
  
    try {
      const { data: { user } } = await supabase.auth.getUser()
 
      const user_id = user.id;
      const { data: lenses, error: lensesError } = await supabase
      .rpc('get_navbar_lenses', { "user_id_param": user_id })
      .select('*')
      .order('updated_at', { ascending: false });
    
    if (lensesError) {
      console.error('Error fetching lenses:', lensesError);
      throw lensesError;
    }
    

    for (const lens of lenses) {
      lens.user_to_access_type = {};
      lens.user_to_access_type[user_id] = lens.access_type;
    }

      return ok(lenses);
    } catch (err) {
      return notOk(`${err}`);
    }
  }
  