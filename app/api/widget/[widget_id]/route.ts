import { NextRequest, NextResponse } from 'next/server';
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from 'next/headers';
import { notOk, ok } from '@lib/ok';
import { removeNullValues } from '@lib/object';
import { Database } from 'app/_types/supabase'

export async function POST(request: NextRequest, { params }: { params: { widget_id: string } }) {
  const supabase = createServerComponentClient({ cookies });
  const user = await supabase.auth.getUser();

  if (!user.data.user.id) return notOk('User not found');
  if (Number.isNaN(Number(params.widget_id))) return notOk('Invalid ID');

  try {
    const { title = null, input = null, output = null, type = null } = await request.json();
    const payload = removeNullValues({ title, input, output, type });

    const { data, error } = await supabase
      .from('widget')
      .insert(payload)
      .single();

    if (error) {
      console.log("error", error.message)
      throw error;
    }

    return ok(data);

  } catch (error) {
    return notOk("Error inserting widget", error.message);
  }
}

export async function PUT(request: NextRequest, { params }: { params: { widget_id: string } }) {
  const supabase = createServerComponentClient({ cookies });
  const user = await supabase.auth.getUser();

  if (!user.data.user.id) return notOk('User not found');
  if (Number.isNaN(Number(params.widget_id))) return notOk('Invalid ID');

  try {
    const { name = null, input = null, output = null, type = null } = await request.json();
    const payload = removeNullValues({ name, input, output, type });

    console.log(payload)

    const { data, error } = await supabase
      .from('widget')
      .update(payload)
      .match({ widget_id: params.widget_id });

    if (error) {
      console.log("error", error.message)
      throw error;
    }

    return ok(data);

  } catch (error) {
    return notOk("Error updating widget", 500);
  }
}

export async function DELETE(request: NextRequest, { params, }: { params: { widget_id: string }; }) {
  const supabase = createServerComponentClient({ cookies });
  const widget_id = Number(params.widget_id);

  // Validate the id
  if (isNaN(widget_id)) {
    return notOk("Invalid ID");
  }

  try {
    // const { data, error: selectError } = await supabase.from('widget_id').select('task_id').eq('widget_id', widget_id);

    // const task_id = data[0]['task_id']
    const { error } = await supabase
      .from('widget')
      .delete()
      .eq('widget_id', widget_id);

    // revoke celery task if still running
    // if (task_id) {
    //   await apiClient('/revokeTask', 'POST', { "task_id": task_id })
    //     .then(result => {
    //       console.log('revoked task successfully', result);
    //     })
    //     .catch(error => {
    //       console.log('error revoking task: ' + error.message);
    //     });
    // }

    // if (error) {
    //   throw error;
    // }

    return ok({ widget_id });
  } catch (err) {
    return notOk(`${err}`);
  }
}

export async function GET(request: NextRequest, { params, }: { params: { widget_id: string }; }) {
  const supabase = createServerComponentClient<Database>({ cookies });

  const widget_id = Number(params.widget_id);
  const { data: { user } } = await supabase.auth.getUser()

  // Validate the id  
  if (isNaN(widget_id)) {
    return notOk("Invalid ID");
  }
  try {
    const { data, error } = await supabase
      .from("widget")
      .select("widget_id, title, type")
      .eq('widget_id', widget_id)
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