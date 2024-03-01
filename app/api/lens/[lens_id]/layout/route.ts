import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse, NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { LensLayout } from '../../../../_types/lens';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest, { params }: { params: { lens_id: string }; }) {
    const supabase = createServerComponentClient({ cookies });

    const { data: lensLayout, error } = await supabase
        .from('lens_layout')
        .select('*')
        .eq('lens_id', params.lens_id)
        .single();
        
    if (error) {
        return new NextResponse(
            JSON.stringify({ error: 'Failed to retrieve pages for the space.' }),
            { status: 404 }
        );
    }

    return new NextResponse(
        JSON.stringify({ data: lensLayout }),
        { status: 200 }
    );
}

type POSTParams = {
    params: {
        lens_id: string,
        layoutName: keyof LensLayout
    };
}
export async function POST(request: NextRequest, { params }: POSTParams) {
    const supabase = createServerComponentClient({ cookies });

    const { lens_id } = params;
    const { layoutName, layoutValue } = await request.json();

    const { data, error } = await supabase
        .from('lens_layout')
        .upsert({ lens_id, [layoutName]: layoutValue }, {
            onConflict: 'lens_id'
        })
        .select("*");

    if (error) {
        return new NextResponse(
            JSON.stringify({ error: 'Failed to update layout.' }),
            { status: 404 }
        );
    }

    return new NextResponse(
        JSON.stringify({ data }),
        { status: 200 }
    );
}