import { ok, notOk } from "@lib/ok";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { NextRequest } from "next/server";
import { cookies } from 'next/headers';
import { Database } from "app/_types/supabase";
export const dynamic = 'force-dynamic'

export async function PUT(request: NextRequest, { params, }: { params: { lens_id: string }; }) {
  const supabase = createServerComponentClient({ cookies });
  const { name } = await request.json();
  const lens_id = Number(params.lens_id);
  // Validate the id
  if (isNaN(lens_id)) {
    return notOk("Invalid ID");
  }
  try {
    const { data: lens, error } = await supabase
      .from('lens')
      .update({ name: name })
      .eq('lens_id', lens_id)
      .single();

    // Check for errors
    if (error) {
      throw error;
    }
    return ok(lens);
  }
  catch (err) {
    return notOk(`${err}`);
  }
}

export async function GET(request: NextRequest, { params, }: { params: { lens_id: string }; }) {
  const supabase = createServerComponentClient({ cookies });

  const lens_id = Number(params.lens_id);
  // Validate the id  
  if (isNaN(lens_id)) {
    return notOk("Invalid ID");
  }
  try {

    const { data: lens, error } = await supabase
      .from('lens')
      .select('*, lens_users(user_id, access_type)')
      .eq('lens_id', lens_id)
      .single();

    // Check for errors
    if (error) {
      throw error;
    }


    lens.user_to_access_type = {}
    lens.lens_users.forEach(obj => {
      lens.user_to_access_type[obj.user_id] = obj.access_type;
    });
    return ok(lens);
  } catch (err) {
    return notOk(`${err}`);
  }
}

export async function DELETE(request: NextRequest, { params, }: { params: { lens_id: string }; }) {
  const supabase = createServerComponentClient<Database>({ cookies });
  const lens_id = Number(params.lens_id);

  const { data: { user } } = await supabase.auth.getUser()

  // Validate the id
  if (isNaN(lens_id)) return notOk("Invalid ID");

  // Validate access level
  const lensUserResponse = await supabase.from('lens_users')
    .select('access_type').eq('lens_id', lens_id).eq('user_id', user.id)
  const lensResponse = await supabase.from('lens').select('owner_id').eq('lens_id', lens_id)

  if (lensUserResponse.error || lensResponse.error.message) {
    console.log("error", lensUserResponse.error.message || lensResponse.error.message);
    throw lensUserResponse.error || lensResponse.error.message;
  }

  if (lensUserResponse.data.length === 0 && lensResponse.data[0].owner_id !== user.id) {
    return notOk("You do not have access for this action.");
  }

  if (lensUserResponse.data.length === 1 && lensUserResponse.data[0].access_type === 'reader') {
    return notOk("You do not have access for this action.");
  }

  try {
    const { error } = await supabase
      .from('lens')
      .delete()
      .eq('lens_id', lens_id);

    if (error) {
      throw error;
    }

    return ok({ lens_id });
  } catch (err) {
    return notOk(`${err}`);
  }
}