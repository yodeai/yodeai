import { ok, notOk } from "@lib/ok";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { NextRequest } from "next/server";
import { cookies } from 'next/headers';
import apiClient from '@utils/apiClient';

export const dynamic = 'force-dynamic';


export async function GET(request: NextRequest, { params, }: { params: { block_id: string }; }) {
    const supabase = createServerComponentClient({ cookies });
  
    const block_id = Number(params.block_id);
    // Validate the id  
    if (isNaN(block_id)) {
      return notOk("Invalid ID");
    }
    try {
      const { data: block, error: blockError } = await supabase
        .from('block_published')
        .select('*')
        .eq('block_id', block_id)
        .single();


        console.log("Hi im in here")
  
      // Check for errors
      if (blockError) {
        throw blockError;
      }
  

      block.readOnly = true;
      return ok(block);
    } catch (err) {
      return notOk(`${err}`);
    }
  }