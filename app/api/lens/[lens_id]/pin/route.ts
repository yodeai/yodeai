import { ok, notOk } from "@lib/ok";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { NextRequest } from "next/server";
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic'

export async function PUT(request: NextRequest, { params }: { params: { lens_id: string } }) {
    const { lens_id } = params;
    const supabase = createServerComponentClient({ cookies });
    const { data: { user: { id: user_id } } } = await supabase.auth.getUser();

    try {
        if (isNaN(Number(lens_id))) return notOk("Invalid ID");
        const { data: lens, error } = await supabase
            .from('lens_users')
            .update({ pinned: true })
            .eq('lens_id', lens_id)
            .eq('user_id', user_id)
            .single();

        console.log(error)
        if (error) throw error.message;
        return ok(lens);

    } catch (err) {
        return notOk(`${err}`);
    }
}

export async function DELETE(request: NextRequest, { params }: { params: { lens_id: string } }) {
    const { lens_id } = params;
    const supabase = createServerComponentClient({ cookies });
    const { data: { user: { id: user_id } } } = await supabase.auth.getUser();

    try {
        if (isNaN(Number(lens_id))) return notOk("Invalid ID");
        const { data: lens, error } = await supabase
            .from('lens_users')
            .update({ pinned: false })
            .eq('lens_id', lens_id)
            .eq('user_id', user_id)
            .single();

        console.log(error)
        if (error) throw error.message;
        return ok(lens);

    } catch (err) {
        return notOk(`${err}`);
    }
}