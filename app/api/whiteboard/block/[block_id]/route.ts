import { NextRequest, NextResponse } from "next/server";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { ok, notOk } from "@lib/ok";
import { Database } from "app/_types/supabase";
export const dynamic = 'force-dynamic';


export async function GET(request: NextRequest, { params, }: { params: { block_id: string }; }) {
    const supabase = createServerComponentClient<Database>({ cookies });

    const block_id = Number(params.block_id);
    const { data: { user } } = await supabase.auth.getUser()

    // Validate the id  
    if (isNaN(block_id)) {
        return notOk("Invalid ID");
    }
    try {
        const { data: block, error: blockError } = await supabase
            .from('block')
            .select("block_id, block_type, is_file, owner_id, title, preview")
            .eq('block_id', block_id)
            .single();

        // Check for errors
        if (blockError) {
            throw blockError;
        }
        return ok(block);
    } catch (err) {
        return notOk(`${err}`);
    }
}