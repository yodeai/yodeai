import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse, NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { LensLayout } from 'app/_types/lens';
import { ok, notOk } from '@lib/ok';

export const dynamic = 'force-dynamic';

type POSTParams = {
    params: {
        lens_id: string,
        layoutName: keyof LensLayout
    };
}
export async function POST(request: NextRequest, { params }: POSTParams) {
    const supabase = createServerComponentClient({ cookies });
    const { data: { user: { id: user_id } } } = await supabase.auth.getUser();

    if (!user_id) return notOk('User not found.');

    const { lens_id } = params;
    const { item_icons } = await request.json();

    const { data, error } = await supabase
        .from('lens_layout')
        .update({ item_icons })
        .match({ lens_id });

    if (error) return notOk('Failed to update lens layout.');

    return ok(data);
}