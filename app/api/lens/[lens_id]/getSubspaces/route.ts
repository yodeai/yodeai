import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse, NextRequest } from 'next/server';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';



export async function GET(request: NextRequest, { params }: { params: { lens_id: string }; }) {
    try {
        const supabase = createServerComponentClient({
            cookies,
        });

        // Fetch all blocks associated with the given lens_id, and their related lenses
        const { data: subspaces, error } = await supabase
            .from('lens')
            .select('*')
            .eq('parent_id', params.lens_id)
        if (error) {
            console.log(error);
            throw error;
        }


        return new NextResponse(
            JSON.stringify({ data: subspaces }),
            { status: 200 }
        );
    } catch (error) {
        console.error("Error retrieving lens's subspaces:", error);
        return new NextResponse(
            JSON.stringify({ error: 'Failed to retrieve subpsaces for lens.' }),
            { status: 500 }
        );
    }
}
