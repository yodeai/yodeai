import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse, NextRequest } from 'next/server';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

type LensBlock = {
    lens: {
        lens_id: number;
        name: string;
    };
};

export async function GET(request: NextRequest, { params }: { params: { block_id: string }; }) {
    try {
        const supabase = createServerComponentClient({
            cookies,
        });

        // Fetch the specific block based on the block_id
        const { data: block, error } = await supabase
            .from('block')
            .select(`
                *, 
                lens_blocks!fk_block (
                    lens: lens!fk_lens (lens_id, name)
                )
            `)
            .eq('block_id', params.block_id)
            .single();
        
        if (error) {
            throw error;
        }
        
        // Extract the inLenses data from the specific block
        const inLenses = block ? block.lens_blocks.map( (lensBlock: LensBlock) => lensBlock.lens) : [];

        return new NextResponse(
            JSON.stringify({ data: inLenses }),
            { status: 200 }
        );
    } catch (error) {
        console.error("Error retrieving block's lenses:", error);
        return new NextResponse(
            JSON.stringify({ error: 'Failed to retrieve lenses for block.' }),
            { status: 500 }
        );
    }
}
