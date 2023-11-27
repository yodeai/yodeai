import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse, NextRequest } from 'next/server';
import { cookies } from 'next/headers';


export const dynamic = 'force-dynamic';

type ListofLensesforBlock = {
    lens: {
        lens_id: number;
        name: string;
    };
};

export async function GET(request: NextRequest) {
    console.log("getting all blocks");
    try {
        const supabase = createServerComponentClient({
            cookies,
        })

        const { data: blocks, error } = await supabase
            .from('block')
            .select(`
            *, 
            lens_blocks!fk_block (
                lens: lens!fk_lens (lens_id, name)
            )
        `).eq('lens_blocks.direct_child', true)
        .order('updated_at', { ascending: false });

        const blocksWithLenses = (blocks || []).map(block => ({
            ...block,
            inLenses: block.lens_blocks
                .filter(lb => lb.lens)  // This will filter out lens_blocks with lens set to null
                .map(lb => ({
                    lens_id: lb.lens.lens_id,
                    name: lb.lens.name
                }))
        }));
        
        

        return new NextResponse(
            JSON.stringify({ data: blocksWithLenses }),
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
