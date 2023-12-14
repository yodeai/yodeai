import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse, NextRequest } from 'next/server';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest, { params }: { params: { lens_id: string }; }) {
    try {
        const supabase = createServerComponentClient({ cookies });

        const lensResponse = await supabase
            .from('lens').select('parents')
            .eq('lens_id', params.lens_id)
            .single();
        if (lensResponse.error) throw lensResponse.error.message;

        const parentIds: number[] = [...lensResponse.data.parents.slice(0, -1), params.lens_id];

        const parentLenses = await supabase
            .from('lens').select('lens_id, name')
            .in('lens_id', parentIds);
        if (parentLenses.error) throw parentLenses.error.message;

        return new NextResponse(
            JSON.stringify({ data: parentLenses.data }),
            { status: 200 }
        );
    } catch (error) {
        console.error("Error retrieving lens's parents:", error.message);
        return new NextResponse(
            JSON.stringify({ error: 'Failed to retrieve parents for lens.' }),
            { status: 500 }
        );
    }
}
