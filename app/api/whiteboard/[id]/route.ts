import { NextRequest, NextResponse } from 'next/server';
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from 'next/headers';
import { notOk, ok } from '@lib/ok';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
    const supabase = createServerComponentClient({ cookies });
    const user = await supabase.auth.getUser();

    if (!user.data.user.id) return notOk('User not found');

    if (Number.isNaN(Number(params.id))) return notOk('Invalid ID');

    try {
        const { nodes, edges } = await request.json();

        const { data, error } = await supabase
            .from('whiteboard')
            .update({
                nodes: nodes,
                edges: edges
            }).match({ whiteboard_id: params.id });

        if (error) {
            console.log("error", error.message)
            throw error;
        }

        return ok(data);

    } catch (error) {
        return notOk("Error inserting lens", error.message);
    }
}