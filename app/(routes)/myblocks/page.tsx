import { SupabaseClient, createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import MyBlocks from '@components/Pages/MyBlocks';

const getBlocks = async (supabase: SupabaseClient) => {
  try {

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

    return blocksForLens;
  } catch (error) {
    console.error("Error retrieving the inbox's pages:", error);
    return []
  }
}

type MyBlockPageProps = {
  searchParams: { [key: string]: string | string[] | undefined }
}

export default async function MyBlocksPage(props: MyBlockPageProps) {
  const supabase = createServerComponentClient({ cookies });
  const blocks = await getBlocks(supabase);

  return <MyBlocks blocks={blocks} />
}