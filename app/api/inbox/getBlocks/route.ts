import { createClientComponentClient, createRouteHandlerClient, createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse, NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { clearConsole } from 'debug/tools';

export const dynamic = 'force-dynamic';



export async function GET(request: NextRequest) {
    clearConsole("got to api");
    
    const supabase = createServerComponentClient({cookies});
    //const supabase = createRouteHandlerClient({ cookies });
            
    let { data, error } = await supabase.auth.getUser();
    if (error) {
        throw error;
    }
    clearConsole(data.user?.id);
    const userID = data.user?.id;
    
    try {

        const { data: inboxBlockIds, error: inboxError } = await supabase
        .from('inbox')
        .select('*')
        .eq('user_id', userID);
        console.log("inbox blocks:");
        clearConsole(inboxBlockIds);
        

        var inboxBlocks;
        if (inboxError) {
         throw error;
        } else {
            // Step 2: Use the retrieved block_id values to query the 'block' table
            const blockIds = inboxBlockIds.map((row) => row.block_id);

            const { data: blockRows, error: blockError } = await supabase
            .from('block')
            .select('*')
            .in('block_id', blockIds);

            if (blockError) 
                throw error;
            inboxBlocks = blockRows;
        }


        clearConsole(inboxBlocks);
        if (error) {
            throw error;
        }

        // Extract the associated blocks from the inboxBlocks data and add their lenses
        const blocksForLens = inboxBlocks
            ? inboxBlocks
                .map((lensBlock) => ({
                    ...lensBlock.block,
                    inLenses: lensBlock.block.lens_blocks.map((lb: any) => ({
                        lens_id: lb.lens.lens_id,
                        name: lb.lens.name,
                    }))
                }))
                .filter(block => block !== null) : [];

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
        console.error("Error retrieving inbox blocks:", error);
        return new NextResponse(
            JSON.stringify({ error: 'Failed to retrieve blocks for lens.' }),
            { status: 500 }
        );
    }
}
