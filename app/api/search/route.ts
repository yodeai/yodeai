
import { notOk, ok } from "@lib/ok";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const supabase = createServerComponentClient({ cookies });
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");

  if (!query) {
    return notOk("Missing query parameter", 422);
  }

  const { data, error } = await supabase
    .from('block')
    .select('*')
    .filter('content', 'ilike', `%${query}%`);

  if (error) {
    console.error("Error fetching data: ", error);
  }

  return data;

}