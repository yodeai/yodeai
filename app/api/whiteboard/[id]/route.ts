import { NextRequest, NextResponse } from 'next/server';
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from 'next/headers';
import { notOk, ok } from '@lib/ok';
import { removeNullValues } from '@lib/object';
import { Database } from 'app/_types/supabase'
import apiClient from '@utils/apiClient';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createServerComponentClient({ cookies });
  const user = await supabase.auth.getUser();

  if (!user.data.user.id) return notOk('User not found');
  if (Number.isNaN(Number(params.id))) return notOk('Invalid ID');

  try {
    const { name = null, nodes = null, edges = null, plugin = null } = await request.json();
    const payload = removeNullValues({ name, nodes, edges, plugin });

    const { data, error } = await supabase
      .from('whiteboard')
      .update(payload)
      .match({ whiteboard_id: params.id, owner_id: user.data.user.id });

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
    const {data, error: selectError} = await supabase.from('whiteboard').select('task_id').eq('whiteboard_id', whiteboard_id);
    const task_id = data[0]['task_id']
    const { error } = await supabase
      .from('whiteboard')
      .delete()
      .eq('whiteboard_id', whiteboard_id);

    // revoke celery task if still running
    if (task_id) {
      await apiClient('/revokeTask', 'POST', {"task_id": task_id})
        .then(result => {
          console.log('revoked task successfully', result);
        })
        .catch(error => {
          console.log('error revoking task: ' + error.message);
        });
    }

    if (error) {
      throw error;
    }

    return ok({ whiteboard_id });
  } catch (err) {
    return notOk(`${err}`);
  }
}

export async function GET(request: NextRequest, { params, }: { params: { id: string }; }) {
  const supabase = createServerComponentClient<Database>({ cookies });

  const whiteboard_id = Number(params.id);
  const { data: { user } } = await supabase.auth.getUser()

  // Validate the id  
  if (isNaN(whiteboard_id)) {
    return notOk("Invalid ID");
  }
  try {
    const { data, error } = await supabase
      .from("whiteboard")
      .select("whiteboard_id, name")
      .eq('whiteboard_id', whiteboard_id)
      .eq('owner_id', user.id)
      .single();

    // Check for errors
    if (error) {
      throw error.message;
    }
    return ok(data);
  } catch (err) {
    return notOk(`${err}`);
  }
}