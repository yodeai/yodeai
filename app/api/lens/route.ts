import supabase from '@utils/supabaseServerClient';
import { NextRequest, NextResponse } from 'next/server';

// Utility function to generate a slug from a string (name)
function generateSlug(name: string, iteration: number = 0) {
  let slug = name
    .toLowerCase()
    .replace(/ /g, '-')
    .replace(/[^\w-]+/g, '');

  if (iteration > 0) {
    slug = `${slug}-${iteration}`;
  }

  return slug;
}

export async function POST(request: NextRequest) {
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

    let slug = generateSlug(name);
    let iteration = 0;
    let data, error;

    do {
      if (iteration > 0) {
        slug = generateSlug(name, iteration);
      }

      ({ data, error } = await supabase
        .from('lens')
        .insert([
          {
            name: name,
            slug: slug,
          },
        ]));

      iteration++;
    } while (error && error.message.includes('duplicate key value violates unique constraint'));

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
