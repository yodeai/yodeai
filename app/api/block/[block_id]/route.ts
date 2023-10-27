import { ok, notOk } from "@lib/ok";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { NextRequest } from "next/server";
import { cookies } from 'next/headers';
import apiClient from '@utils/apiClient';

export const dynamic = 'force-dynamic';

export async function DELETE(request: NextRequest, { params, }: { params: { block_id: string }; }) {
  const supabase = createServerComponentClient({ cookies });
  const block_id = Number(params.block_id);

  // Validate the id
  if (isNaN(block_id)) {
    return notOk("Invalid ID");
  }

  try {
    const { error } = await supabase
      .from('block')
      .delete()
      .eq('block_id', block_id);

    if (error) {
      throw error;
    }

    /* // commenting this out for now because gets called with every auto save :-s
    // Initiate the processBlock call without awaiting it.
    apiClient('/processBlock', 'POST', { block_id: block_id })
      .then(result => {
        // You can handle the result or error here if needed.
        console.log('Block processed successfully', result);
      })
      .catch(error => {
        console.error('Error processing block', error);
      });
      */

    return ok({ block_id });
  } catch (err) {
    return notOk(`${err}`);
  }
}

export async function PUT(request: NextRequest, { params, }: { params: { block_id: string }; }) {

  const supabase = createServerComponentClient({ cookies });
  const block_id = Number(params.block_id);

  if (isNaN(block_id)) {
    return notOk("Invalid ID");
  }
  const data = await request.json();

   // Extract lens_id and delete it from requestData
   const lensId = data.lens_id;
   delete data.lens_id;

  console.log("data: ", data, "block_id: ", block_id);
  try {
    const { data: block, error } = await supabase
      .from('block')
      .update(data)
      .eq('block_id', block_id);

    if (error) {
      throw error;
    }

    return ok(block);
  } catch (err) {
    return notOk(`${err}`);
  }
}


export async function GET(request: NextRequest, { params, }: { params: { block_id: string }; }) {
  const supabase = createServerComponentClient({ cookies });

  const block_id = Number(params.block_id);
  // Validate the id  
  if (isNaN(block_id)) {
    return notOk("Invalid ID");
  }
  try {
    const { data: block, error: blockError } = await supabase
      .from('block')
      .select('*')
      .eq('block_id', block_id)
      .single();

    // Check for errors
    if (blockError) {
      throw blockError;
    }

    const {data: accessLevel, error: accessLevelError} = await supabase.rpc('get_access_type_block', {"chosen_block_id": block_id})
    if (accessLevelError) {
      throw accessLevelError;
    }
    block.readOnly = accessLevel == 'reader';
    return ok(block);
  } catch (err) {
    return notOk(`${err}`);
  }
}
