import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse, NextRequest } from 'next/server';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';


export async function GET(request: NextRequest) {
    try {
        const supabase = createServerComponentClient({
            cookies,
        })
        const user = await supabase.auth.getUser()
        const user_metadata = user?.data?.user?.user_metadata;

        const requestUrl = new URL(request.url)
        const limit = requestUrl.searchParams.get('limit') || 30;
        const offset = requestUrl.searchParams.get('offset') || 0;

        const { data: blocks, error } = await supabase
            .from('block')
            .select(`
            *,
            lens_blocks!fk_block (
                lens: lens!fk_lens (lens_id, name)
            )
        `)
            .in('google_user_id', [user_metadata?.google_user_id, 'global'])
            .eq('lens_blocks.direct_child', true)
            .order('created_at', { ascending: false })
            .range(Number(offset), Number(offset) + Number(limit) - 1)

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
