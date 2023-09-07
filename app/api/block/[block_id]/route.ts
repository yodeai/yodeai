import { ok, notOk } from "@lib/ok";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { NextRequest } from "next/server";
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function DELETE(request: NextRequest, { params,}: {params: { block_id: string };}) {
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

    return ok({ block_id });
  } catch (err) {
    return notOk(`${err}`);
  }
}

export async function PUT(request: NextRequest,{params,}: {params: { block_id: string };} ) {

  const supabase = createServerComponentClient({ cookies });
  const block_id = Number(params.block_id);
  console.log("PUT", block_id);
  // Validate the id
  if (isNaN(block_id)) {
    return notOk("Invalid ID");
  }
  const data = await request.json();
  console.log("PUT", data);
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


export async function GET(request: NextRequest, { params,}: {params: { block_id: string };}) {
  const supabase = createServerComponentClient({ cookies });
  
  const block_id = Number(params.block_id);
  // Validate the id  
  if (isNaN(block_id)) {
    return notOk("Invalid ID");
  }
  try {
    const { data: block, error } = await supabase
      .from('block')
      .select('*')
      .eq('block_id', block_id)
      .single();

    // Check for errors
    if (error) {
      throw error;
    }
    return ok(block);
  } catch (err) {
    return notOk(`${err}`);
  }
}
