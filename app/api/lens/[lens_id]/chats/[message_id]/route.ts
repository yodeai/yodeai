import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse, NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { notOk, ok } from '@lib/ok';

type LensChatProps = {
    params: {
        lens_id: string;
        message_id: string;
    }
}

export async function GET(request: NextRequest, { params }: LensChatProps) {
    const { lens_id } = params;

    const supabase = createServerComponentClient({ cookies });

    try {
        if (isNaN(Number(lens_id))) return notOk("Invalid ID");

        const { data, error } = await supabase
            .from('lens_chats')
            .select(`*, users(*)`)
            .eq('id', params.message_id)
            .eq('lens_id', params.lens_id)
            .single();

        if (error) throw error;

        return ok(data)

    } catch (err) {
        return notOk(`${err.message}`);
    }
}