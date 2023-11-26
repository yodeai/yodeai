import { NextRequest, NextResponse } from 'next/server';
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';


export async function POST(request: NextRequest) {
  
  try {
    const body = await request.json();
    const name = body.text;
    const parentId = body.parentId ? body.parentId : -1
    const rootId = body.root? body.root : -1
    if (!name) {
      return new NextResponse(
        JSON.stringify({ error: 'Name is required' }),
        { status: 400 }
      );
    }

    
    const supabase = createServerComponentClient({ cookies });
    const { data, error } = await supabase
        .from('lens')
        .insert([
          {
            name: name,
            parent_id: parentId,
            root: rootId
          },
        ]).select();
    
    if (error) {
      console.log("error", error)
      throw error;
    } 
    const lensUsersObj = await supabase
    .from('lens_users')
    .insert(
      {
        "lens_id": data[0]["lens_id"],
        "user_id": data[0]["owner_id"],
        "access_type": "owner",
      },
    );
    if (lensUsersObj.error) {
      throw lensUsersObj.error;
    } 

    return new NextResponse(
      JSON.stringify({ data: data }),
      { status: 201 }
    );

  } catch (error) {
    console.error("Error inserting lens:", error);
    return new NextResponse(
      JSON.stringify({ error: 'Failed to insert lens.' }),
      { status: 500 }
    );
  }
}
