import { NextRequest, NextResponse } from 'next/server';
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from 'next/headers';
import { notOk, ok } from '@lib/ok';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
    const supabase = createServerComponentClient({ cookies });
    const user = await supabase.auth.getUser();

    if (!user.data.user.id) return notOk('User not found');

    try {
        const { name, lens_id, payload, plugin } = await request.json();
        if (!name) return notOk('Name is required');
        if (!payload) return notOk('Payload is required');

        const { data, error } = await supabase
            .from('whiteboard')
            .insert([
                {
                    name: name,
                    lens_id: lens_id,
                    owner_id: user.data.user.id,
                    plugin,
                    nodes: payload
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