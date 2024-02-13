import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { notOk, ok } from "@lib/ok";
import { cookies } from 'next/headers';
import { Database } from "app/_types/supabase";

export async function GET(request: Request): Promise<Response> {
  const supabase = createServerComponentClient<Database>({ cookies });
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");

  if (!query) {
    return new Response(JSON.stringify({ ok: false, error: "Missing query parameter" }), { status: 422 });
  }

  const [
    blockSearch,
    lensSearch,
    whiteboardSearch
  ] = await Promise.all([
    supabase
      .from('block')
      .select('*')
      .textSearch('title', query),
    supabase
      .from('lens')
      .select('*')
      .textSearch('name', query),
    supabase
      .from('whiteboard')
      .select('*')
      .textSearch('name', query)
  ]);


  const error = blockSearch.error || lensSearch.error || whiteboardSearch.error;
  if(error) {
    console.error("Error fetching data: ", error);
    return new Response(JSON.stringify({ ok: false, error }), { status: 500 });
  }
  const data = {
    blocks: blockSearch.data,
    lenses: lensSearch.data,
    whiteboards: whiteboardSearch.data
  };

  return new Response(JSON.stringify({ ok: true, data }), { status: 200 });
}

// import { notOk, ok } from "@lib/ok";
// import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
// import { cookies } from 'next/headers';

// export const dynamic = 'force-dynamic';

// export async function GET(request: Request) {
//   const supabase = createServerComponentClient({ cookies });
//   const { searchParams } = new URL(request.url);
//   const query = searchParams.get("q");

//   if (!query) {
//     return notOk("Missing query parameter", 422);
//   }

//   const { data, error } = await supabase
//     .from('block')
//     .select('*')
//     .filter('content', 'ilike', `%${query}%`);

//   if (error) {
//     console.error("Error fetching data: ", error);
//   }

//   return data;

// }