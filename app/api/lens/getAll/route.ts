import { ok, notOk } from "@lib/ok";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { NextRequest } from "next/server";
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
    const supabase = createServerComponentClient({ cookies });
  
    try {
      const { data: lenses, error:lensesError } = await supabase
        .from('lens')
        .select('*, lens_users(user_id, access_type)')
        .order('updated_at', { ascending: false });
        if (lensesError) {
          throw lensesError;
        }

        for (const lens of lenses) {
          lens.user_to_access_type = {};
          lens.lens_users.forEach(obj => {
            lens.user_to_access_type[obj.user_id] = obj.access_type;
          });
        }

      return ok(lenses);
    } catch (err) {
      return notOk(`${err}`);
    }
  }
  