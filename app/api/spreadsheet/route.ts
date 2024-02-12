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
        const { name, plugin, dataSource, lens_id } = await request.json();
        if (!name) return notOk('Name is required');
        if(!dataSource) return notOk('DataSource is required');

        const { data, error } = await supabase
            .from('spreadsheet')
            .insert([
                {
                    name,
                    lens_id,
                    owner_id: user.data.user.id,
                    dataSource,
                    plugin,
                }
            ]).select();

        if (error) {
            console.log("error", error.message)
            throw error;
        }

        return ok(data);

    } catch (error) {
        return notOk("Error inserting lens");
    }
}