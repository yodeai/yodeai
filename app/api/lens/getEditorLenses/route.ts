import { ok, notOk } from "@lib/ok";
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { NextRequest } from "next/server";
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
    const supabase = createServerComponentClient({
        cookies,
    })
    try {
        const { data, error } = await supabase.rpc('get_editor_lens');
        // Check for errors
        if (error) {
            console.error("ERROR:", error);
            return notOk(error.message);
        } else {
            return ok(data);
        }
    } catch (error) {
        console.error("ERROR:", error);
        return notOk(error.message);
    }
  }
  