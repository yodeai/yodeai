import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse, NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { notOk, ok } from '@lib/ok';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest, { params }: { params: { lens_id: string }; }) {
    const { lens_id } = params;
    const supabase = createServerComponentClient({ cookies });

    try {
        if (isNaN(Number(lens_id))) return notOk("Invalid ID");

        const { data, error } = await supabase
            .from('lens_chats')
            .select(`*, users(*)`)
            .eq('lens_id', params.lens_id);

        if (error) throw error;



        const chats = data
        return ok(chats)

    } catch (err) {
        return notOk(`${err}`);
    }
}

export async function PUT(request: NextRequest, { params }: { params: { lens_id: string } }) {
    const { lens_id } = params;
    const supabase = createServerComponentClient({ cookies });
    const { data: { user: { id: user_id } } } = await supabase.auth.getUser();

    try {
        if (isNaN(Number(lens_id))) return notOk("Invalid ID");

        const body = await request.json()

        const { data: lens, error } = await supabase
            .from('lens_chats')
            .insert({ lens_id, user_id, message: body.message })
            .select(`*, users(*)`);

        if (error) throw error.message;
        return ok(lens);

    } catch (err) {
        return notOk(`${err}`);
    }
}