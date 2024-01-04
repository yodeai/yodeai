import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse, NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { ok, notOk } from "@lib/ok";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest, { params }: { params: { lens_id: string }; }) {
    const lens_id = Number(params.lens_id)
    if (isNaN(lens_id)) {
        return notOk("Invalid ID");
    }

    try {
        const supabase = createServerComponentClient({ cookies });

        const lensResponse = await supabase
            .from('lens').select('parents')
            .eq('lens_id', lens_id)
            .single();
        if (lensResponse.error) throw lensResponse.error.message;

        if (!lensResponse.data?.parents) {
            return new NextResponse(
                JSON.stringify({ data: null }),
                { status: 200 }
            );
        }

        const parentIds: number[] = [...lensResponse.data.parents.slice(0, -1), lens_id];

        const parentLenses = await supabase
            .from('lens').select('lens_id, name')
            .in('lens_id', parentIds);
        if (parentLenses.error) throw parentLenses.error.message;

        return new NextResponse(
            JSON.stringify({ data: parentLenses.data }),
            { status: 200 }
        );
    } catch (error) {
        console.error("Error retrieving lens's parents:", error);
        return new NextResponse(
            JSON.stringify({ error: 'Failed to retrieve parents for lens.' }),
            { status: 500 }
        );
    }
}
