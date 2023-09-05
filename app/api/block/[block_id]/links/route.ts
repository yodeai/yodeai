import { notOk, ok } from "@lib/ok";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';



export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createServerComponentClient({ cookies });
  const { id } = await request.json();
  
  try {
    await supabase.from('block').update({
      where: { id: Number(params.id) },
      data: {
        links: {
          connect: {
            id: Number(id),
          },
        },
      },
    });
    return ok();
  } catch (err) {
    console.log(err);
    return notOk("Internal Server Error");
  }
}