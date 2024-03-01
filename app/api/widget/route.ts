import { NextRequest } from 'next/server';
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from 'next/headers';
import { notOk, ok } from '@lib/ok';
import { Database } from 'app/_types/supabase';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
    const supabase = createServerComponentClient<Database>({ cookies });
    const user = await supabase.auth.getUser();

    if (!user.data.user.id) return notOk('User not found');

    try {
        const { name, input, output, type, lens_id, state } = await request.json();
        if (!name) return notOk('Name is required');
        if(!input) return notOk('Input is required');

        const { data, error } = await supabase
            .from('widget')
            .insert([
                {
                    name,
                    input,
                    output,
                    owner_id: user.data.user.id,
                    type,
                    state,
                    lens_id
                }
            ]).select();

        if (error) {
            console.log("error", error.message)
            throw error;
        }

        return ok(data);

    } catch (error) {
        return notOk("Error inserting widget");
    }
}