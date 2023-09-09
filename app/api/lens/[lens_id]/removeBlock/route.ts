import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse, NextRequest } from 'next/server';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest, { params,}: {params: { lens_id: string };}) {
    
    try {
        const supabase = createServerComponentClient({ cookies, });
        const { block_id } = await request.json();
        const lens_id = params.lens_id;
        console.log("removing block from lens", block_id, lens_id);

        if (!lens_id || !block_id) {
            throw new Error('Missing lens_id or block_id.');
        }

        // Delete the specific relationship using lens_id and block_id from the lens_blocks table
        const { error } = await supabase
            .from('lens_blocks')
            .delete()
            .eq('lens_id', lens_id)
            .eq('block_id', block_id);

        if (error) {
            throw error;
        }

        return new NextResponse(
            JSON.stringify({ message: 'Successfully removed block from lens.' }),
            { status: 200 }
        );
    } catch (error) {
        console.error("Error removing block from lens:", error);
        return new NextResponse(
            JSON.stringify({ error: 'Failed to remove block from lens.' }),
            { status: 500 }
        );
    }
}
