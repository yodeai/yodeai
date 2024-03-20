import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse, NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { notOk, ok } from '@lib/ok';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest, { params }: { params: { lens_id: string }; }) {
    const { lens_id } = params;
    const searchParams = request.nextUrl.searchParams
    const limit = Number(searchParams.get('limit')) || 25;
    const offset = Number(searchParams.get('offset')) || 0;

    const supabase = createServerComponentClient({ cookies });

    try {
        if (isNaN(Number(lens_id))) return notOk("Invalid ID");

        const { data, error, count } = await supabase
            .from('lens_chats')
            .select(`*, users(*)`, { count: 'exact' })
            .eq('lens_id', params.lens_id)
            .order('created_at', { ascending: false })
            .range(offset, limit + offset - 1);

        if (error) throw error;

        return ok({
            messages: data,
            hasMore: count > limit + offset,
        })

    } catch (err) {
        return notOk(`${err.message}`);
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