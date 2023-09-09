import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse, NextRequest } from 'next/server';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest, { params, }: { params: { lens_id: string }; }) {
    try {
        const supabase = createServerComponentClient({ cookies, })
        const { block_id } = await request.json();
        const lens_id = params.lens_id;
        console.log("adding block to lens", block_id, lens_id);

        if (!lens_id || !block_id) {
            throw new Error('Missing lens_id or block_id.');
        }

        // Insert the lens_id and block_id into the lens_blocks table
        const { error: insertError } = await supabase
            .from('lens_blocks')
            .insert([{ lens_id, block_id }]);

        if (insertError) {
            throw insertError;
        }

        // Update the updated_at column of the lens to the current time
        const { error: updateLensError } = await supabase
            .from('lens')
            .update({ updated_at: new Date() })
            .eq('lens_id', lens_id);

        if (updateLensError) {
            throw updateLensError;
        }

        // Update the updated_at column of the block to the current time
        const { error: updateBlockError } = await supabase
            .from('blocks')
            .update({ updated_at: new Date() })
            .eq('block_id', block_id);

        if (updateBlockError) {
            throw updateBlockError;
        }

        return new NextResponse(
            JSON.stringify({ message: 'Successfully added block to lens.' }),
            { status: 200 }
        );
    } catch (error) {
        console.error("Error adding block to lens:", error);
        return new NextResponse(
            JSON.stringify({ error: 'Failed to add block to lens.' }),
            { status: 500 }
        );
    }
}
