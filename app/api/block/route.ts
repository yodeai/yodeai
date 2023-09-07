
import { NextRequest, NextResponse } from "next/server";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from 'next/headers';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const supabase = createServerComponentClient({ cookies });
  try {
    const requestData = await request.json();
    const {
      data: { user },
    } = await supabase.auth.getUser()
    // Ensure there is a logged-in user
    if (!user) {
      return new NextResponse(
        JSON.stringify({ error: 'Not authenticated' }),
        { status: 401 }
      );
    }

    // Add the user_id to the requestData
    requestData.user_id = user.id;

    // Insert the new block into the database
    const { data, error } = await supabase
      .from('block')
      .insert([requestData]);

    // Check for errors
    if (error) {
      throw error;
    }

    // Respond with success
    return new NextResponse(
      JSON.stringify({ data: data }),
      { status: 201 }
    );

  } catch (error) {
    console.error("Error inserting block:", error);
    return new NextResponse(
      JSON.stringify({ error: 'Failed to insert block.' }),
      { status: 500 }
    );
  }
}


