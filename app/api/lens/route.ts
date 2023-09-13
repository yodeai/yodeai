import { NextRequest, NextResponse } from 'next/server';
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';


export async function POST(request: NextRequest) {
  const supabase = createServerComponentClient({ cookies });
  try {
    const body = await request.json();
    console.log("body", body);
    const name = body.text;
    console.log("name", name);
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
          },
        ]);
    
    if (error) {
      throw error;
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
