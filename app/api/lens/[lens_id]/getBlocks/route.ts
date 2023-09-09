import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse, NextRequest } from 'next/server';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

type LensBlock = {
    block: {
        [key: string]: any; // To represent that block can have any number of properties
    };
};

export async function GET(request: NextRequest, { params }: { params: { lens_id: string }; }) {
    try {
        const supabase = createServerComponentClient({
            cookies,
        });

        // Fetch all blocks associated with the given lens_id
        const { data: lensBlocks, error } = await supabase
            .from('lens_blocks')
            .select(`
                *,
                block!fk_block (*) 
            `)
            .eq('lens_id', params.lens_id);

        if (error) {
            throw error;
        }
        

        // Extract the associated blocks from the lensBlocks data
        const blocksForLens = lensBlocks 
    ? lensBlocks
          .map((lensBlock: LensBlock) => lensBlock.block)
          .filter(block => block !== null )  : [];

        //console.log("blocks: ", blocksForLens);
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
