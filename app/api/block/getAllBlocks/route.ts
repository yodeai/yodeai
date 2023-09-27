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

export async function GET(request: NextRequest) {
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
        `)
            .order('updated_at', { ascending: false });

        const blocksWithLenses = (blocks || []).map(block => ({
            ...block,
            inLenses: block.lens_blocks.map((lb: LensBlock) =>
                lb.lens
                    ? { lens_id: lb.lens.lens_id, name: lb.lens.name }
                    : { lens_id: null, name: null }
            )
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
