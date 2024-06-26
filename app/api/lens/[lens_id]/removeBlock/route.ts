import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse, NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import apiClient from '@utils/apiClient';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest, { params,}: {params: { lens_id: string };}) {
    
    try {
        const supabase = createServerComponentClient({ cookies, });
        const { block_id } = await request.json();
        const lens_id = params.lens_id;
        console.log("removing page from space", block_id, lens_id);

        if (!lens_id || !block_id) {
            throw new Error('Missing lens_id or block_id.');
        }

        // Delete the specific relationship using lens_id and block_id from the lens_blocks table
        const { data: existingRows, error: selectError } = await supabase
            .from('lens_blocks')
            .select('*')
            .eq('lens_id', lens_id)
            .eq('block_id', block_id);

        if (selectError) {
            console.error('Select error', selectError);
            throw selectError;
        }

        if (existingRows.length > 0) {
            const existingRow = existingRows[0];

            // Check conditions: count is 1 and direct_child is true
            if (existingRow.count === 1 && existingRow.direct_child) {
                // If conditions apply, delete the row
                const { error: deleteError } = await supabase
                    .from('lens_blocks')
                    .delete()
                    .eq('lens_id', lens_id)
                    .eq('block_id', block_id);

                if (deleteError) {
                    console.error('Delete error', deleteError);
                    throw deleteError;
                }
            } else {
                // If conditions don't apply, update the row
                const updatedCount = existingRow.count - 1;

                const { error: updateError } = await supabase
                    .from('lens_blocks')
                    .update({ direct_child: false, count: updatedCount })
                    .eq('lens_id', lens_id)
                    .eq('block_id', block_id);

                if (updateError) {
                    console.error('Update error', updateError);
                    throw updateError;
                }
            }
        }

    // Traverse up the hierarchy to add the block to the ancestors (an async call as to not block)
      await apiClient('/processAncestors', 'POST', { "block_id": block_id, "lens_id": lens_id, "remove": true })
      .then(result => {
        console.log('Submitted task to process ancestors', result);
      })
      .catch(error => {
        console.error('Error adding page to ancestors: ' + error.message);
      });

        return new NextResponse(
            JSON.stringify({ message: 'Successfully removed page from space.' }),
            { status: 200 }
        );
    } catch (error) {
        console.error("Error removing page from space:", error);
        return new NextResponse(
            JSON.stringify({ error: 'Failed to remove page from space.' }),
            { status: 500 }
        );
    }
}
