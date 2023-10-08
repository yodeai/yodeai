import { NextRequest, NextResponse } from "next/server";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from 'next/headers';
import { Block } from "app/_types/block";
export const dynamic = 'force-dynamic';
import apiClient from '@utils/apiClient';

export async function POST(request: NextRequest) {
  const supabase = createServerComponentClient({ cookies });
  try {
    const requestData = await request.json();
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return new NextResponse(
        JSON.stringify({ error: 'Not authenticated' }),
        { status: 401 }
      );
    }

    requestData.owner_id = user.id;
    console.log("saving: ", requestData);
    requestData.status = "processing";
    // Extract lens_id and delete it from requestData
    const lensId = requestData.lens_id;
    delete requestData.lens_id;

    const { data, error } = await supabase
      .from('block')
      .insert([requestData])
      .select();

    if (error) {
      console.log("error")
      console.log(error)
      throw error;
    }
    if (data && data[0]) {
      const newBlock: Block = data[0];
      console.log("processing block now")
      await apiClient('/processBlock', 'POST', { block_id: newBlock.block_id })
        .then(result => {
          console.log('Block processed successfully', result);
        })
        .catch(error => {
          console.error('Error processing block', error);
        });
    }
    
    // If lens_id exists and is not null, assign the block to the lens
    if (data && data[0] && lensId) {
      const newBlock: Block = data[0];
      const { error: lensBlockError } = await supabase
        .from('lens_blocks')
        .insert([{ block_id: newBlock.block_id, lens_id: lensId}]);

      if (lensBlockError) {
        throw lensBlockError;
      }
      // Update the lens's updated_at to the current timestamp
      const { error: lensUpdateError } = await supabase
        .from('lens')
        .update({ updated_at: new Date() })
        .eq('lens_id', lensId);

      if (lensUpdateError) {
        throw lensUpdateError;
      }
    }



    return new NextResponse(
      JSON.stringify({ data: data }),
      { status: 201 }
    );

  } catch (error) {
    console.error("Error:", error);
    return new NextResponse(
      JSON.stringify({ error: 'Failed to process request.' }),
      { status: 500 }
    );
  }
}
