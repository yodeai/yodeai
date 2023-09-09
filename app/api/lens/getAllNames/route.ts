import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse, NextRequest } from 'next/server';
import { cookies } from 'next/headers';


export const dynamic = 'force-dynamic';


export async function GET(request: NextRequest) {
    try {
        const supabase = createServerComponentClient({
            cookies,
        })

        const { data: lenses, error } = await supabase
            .from('lens')
            .select('lens_id, name');
        if (error) {
            throw error;
        }
        const lensNames = lenses.map(lens => ({
            lens_id: lens.lens_id,
            name: lens.name,
        }));

        return new NextResponse(
            JSON.stringify({ data: lensNames }),
            { status: 200 }
        );
    } catch (error) {
        console.error("Error retrieving blocks:", error);
        return new NextResponse(
            JSON.stringify({ error: 'Failed retrieve block.' }),
            { status: 500 }
        );
    }
}
