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
        const { data: lensBlocks, error } = await supabase
            .from('lens_blocks')
            .select(`
                *,
                block!fk_block (
                    *,
                    lens_blocks!fk_block (
                        lens: lens!fk_lens (lens_id, name)
                    )
                ) 
            `)
            .eq('lens_id', params.lens_id)
        if (error) {
            throw error;
        }

        // Extract the associated blocks from the lensBlocks data and add their lenses
        const blocksForLens = lensBlocks
            ? lensBlocks
                .map((lensBlock) => {
                    if (lensBlock.block && lensBlock.block.lens_blocks) {
                        return {
                            ...lensBlock.block,
                            inLenses: lensBlock.block.lens_blocks.map((lb: any) => ({
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
        console.error("Error retrieving lens's blocks:", error);
        return new NextResponse(
            JSON.stringify({ error: 'Failed to retrieve blocks for lens.' }),
            { status: 500 }
        );
    }
}
