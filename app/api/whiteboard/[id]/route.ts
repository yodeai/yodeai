import { NextRequest, NextResponse } from 'next/server';
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from 'next/headers';
import { notOk, ok } from '@lib/ok';
import { removeNullValues } from '@lib/object';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createServerComponentClient({ cookies });
  const user = await supabase.auth.getUser();

  if (!user.data.user.id) return notOk('User not found');

  if (Number.isNaN(Number(params.id))) return notOk('Invalid ID');

  try {
    const { name = null, nodes = null, edges = null } = await request.json();
    const payload = removeNullValues({ name, nodes, edges });

    const { data, error } = await supabase
      .from('whiteboard')
      .update(payload)
      .match({ whiteboard_id: params.id });

    if (error) {
      console.log("error", error.message)
      throw error;
    }

    return ok(data);

  } catch (error) {
    return notOk("Error inserting lens", error.message);
  }
}

export async function DELETE(request: NextRequest, { params, }: { params: { id: string }; }) {
  const supabase = createServerComponentClient({ cookies });
  const whiteboard_id = Number(params.id);

  // Validate the id
  if (isNaN(whiteboard_id)) {
    return notOk("Invalid ID");
  }

  try {
    const { error } = await supabase
      .from('whiteboard')
      .delete()
      .eq('whiteboard_id', whiteboard_id);

    if (error) {
      throw error;
    }

    return ok({ whiteboard_id });
  } catch (err) {
    return notOk(`${err}`);
  }
}