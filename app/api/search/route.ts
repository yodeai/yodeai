import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { notOk, ok } from "@lib/ok";
import { cookies } from 'next/headers';

export async function GET(request: Request): Promise<Response> {
  const supabase = createServerComponentClient({ cookies });
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");

  if (!query) {
    return new Response(JSON.stringify({ ok: false, error: "Missing query parameter" }), { status: 422 });
  }

  const { data, error } = await supabase
    .from('block')
    .select('*')
    .filter('content', 'ilike', `%${query}%`);

  if (error) {
    console.error("Error fetching data: ", error);
    return new Response(JSON.stringify({ ok: false, error: error.message }), { status: 500 });
  }

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