import { ok, notOk } from "@lib/ok";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { NextRequest } from "next/server";
import { cookies } from 'next/headers';

// Initialize Supabase client
const supabase = createServerComponentClient({ cookies });

export async function DELETE(
  _request: NextRequest,
  {
    params,
  }: {
    params: { id: string };
  }
) {
  const id = Number(params.id);

  // Validate the id
  if (isNaN(id)) {
    return notOk("Invalid ID");
  }

  try {
    const { error } = await supabase
      .from('block')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }

    return ok({ id });
  } catch (err) {
    return notOk(`${err}`);
  }
}

export async function PUT(
  request: NextRequest,
  {
    params,
  }: {
    params: { id: string };
  }
) {
  const id = Number(params.id);

  // Validate the id
  if (isNaN(id)) {
    return notOk("Invalid ID");
  }

  const data = await request.json();

  try {
    const { data: block, error } = await supabase
      .from('block')
      .update(data)
      .eq('id', id);

    if (error) {
      throw error;
    }

    return ok(block);
  } catch (err) {
    return notOk(`${err}`);
  }
}
