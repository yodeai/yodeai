import { NextRequest, NextResponse } from "next/server";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from 'next/headers';
import { Block } from "app/_types/block";
export const dynamic = 'force-dynamic';
import apiClient from '@utils/apiClient';

async function addBlockToInbox(supabase, block_id, user_id){
  type InboxRequestBody = {
    block_id: number;
    user_id: string;
  };

  const inboxRequestBody: InboxRequestBody = {
    block_id: block_id,
    user_id: user_id
  }

  const { error } =  await supabase
  .from('inbox')
  .insert(inboxRequestBody)
  .select();

  if (error) {
    console.log("error inserting block into inbox: ", error)
    throw error;
  }
}
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
    let delay = requestData.delay;
    console.log("saving: ", requestData);

    delete requestData["delay"]
    requestData.owner_id = user.id;
    requestData.status = "waiting to process";
    
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

    console.log("Request data: ", requestData)
    if (data && data[0]) {
      const newBlock: Block = data[0];
      addBlockToInbox(supabase, newBlock.block_id, user.id);
      console.log("processing block now");
      apiClient('/processBlock', 'POST', { block_id: newBlock.block_id, delay: delay })
        .then(result => {
          console.log('Block processed successfully', result);
        })
        .catch(error => {
          console.error('Error processing block', error);
    
          // Return a promise to handle the update in the outer then block
          return supabase
            .from('block')
            .update({ 'status': 'failure' })
            .eq('block_id', newBlock.block_id);
        })
        .then(() => {
          console.log('Block status updated to failure', newBlock.block_id);
        })
        .catch(updateError => {
          console.error('Error updating block status', updateError);
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
