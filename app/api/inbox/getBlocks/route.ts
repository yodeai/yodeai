import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse, NextRequest } from 'next/server';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';



export async function GET(request: NextRequest) {

    try {
        const supabase = createServerComponentClient({
            cookies,
        });

        const user = await supabase.auth.getUser()
        const user_metadata = user?.data?.user?.user_metadata;

        // Fetch all blocks associated with the given lens_id, and their related lenses
        const { data: inboxBlocks, error } = await supabase
            .from('inbox')
            .select(`
            *,
            block!inbox_block_id_fkey (
                block_id, created_at, updated_at, block_type, is_file, parent_id, owner_id, title, status, preview, public,
                lens_blocks!fk_block (
                    lens: lens!fk_lens (lens_id, name)
                ) 
            )
        `).in('block.google_user_id', [user_metadata.google_user_id, 'global']).eq("block.lens_blocks.direct_child", true)
        if (error) {
            throw error;
        }



        // Extract the associated blocks from the lensBlocks data and add their lenses
        const blocksForLens = inboxBlocks
            ? inboxBlocks
                .map((inboxBlock) => {
                    if (inboxBlock.block && inboxBlock.block.lens_blocks) {
                        return {
                            ...inboxBlock.block,
                            inLenses: inboxBlock.block.lens_blocks.map((lb: any) => ({
                                lens_id: lb.lens.lens_id,
                                name: lb.lens.name,
                            }))
                        };
                    }
                    return null;
                })
                .filter(block => block !== null)
            : [];



        blocksForLens.sort((a, b) => {
            if (a.updated_at > b.updated_at) return -1;
            if (a.updated_at < b.updated_at) return 1;
            return 0;
        });

        return new NextResponse(
            JSON.stringify({ data: blocksForLens }),
            { status: 200 }
        );
    } catch (error) {
        console.error("Error retrieving the space's pages:", error);
        return new NextResponse(
            JSON.stringify({ error: 'Failed to retrieve pages for the space.' }),
            { status: 500 }
        );
    }
}
