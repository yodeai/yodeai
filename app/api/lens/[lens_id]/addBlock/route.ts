import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse, NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import apiClient from '@utils/apiClient';

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

    // Check if a row with the specified lens_id and block_id already exists
    const { data: existingRows, error: selectError } = await supabase
        .from('lens_blocks')
        .select('*')
        .eq('lens_id', lens_id)
        .eq('block_id', block_id);

    if (selectError) {
        console.log("select error", selectError)
        throw selectError;
    }

    if (existingRows.length > 0) {
        // If a row exists, update it
        const existingRow = existingRows[0];
        const updatedCount = (existingRow.count || 0) + 1;

        const { error: updateError } = await supabase
            .from('lens_blocks')
            .update({ direct_child: true, count: updatedCount })
            .eq('lens_id', existingRow.lens_id).eq('block_id', existingRow.block_id)

        if (updateError) {
            console.log("update error", updateError)
            throw updateError;
        }
    } else {
        // If no row exists, insert a new one
        const { error: insertError } = await supabase
            .from('lens_blocks')
            .insert([{ lens_id, block_id, direct_child: true, count: 1 }]);

        if (insertError) {
            console.log("insert error", insertError)
            throw insertError;
        }
    }

        // Traverse up the hierarchy to add the block to the ancestors (an async call as to not block)
        await apiClient('/processAncestors', 'POST', { block_id, lens_id, "remove": false })
        .then(result => {
          console.log('Submitted task to process ancestors', result);
        })
        .catch(error => {
          console.error('Error adding block to ancestors: ' + error.message);
        });



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
            .from('block')
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
