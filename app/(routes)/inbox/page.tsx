import { SupabaseClient, createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import Inbox from '@components/Pages/Inbox';


const getBlocks = async (supabase: SupabaseClient) => {
  try {
    const user = await supabase.auth.getUser()
    const user_metadata = user?.data?.user?.user_metadata;

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
  `).
      in('block.google_user_id', [user_metadata?.google_user_id, 'global'])
      .eq("block.lens_blocks.direct_child", true)
      .limit(30);

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


    return blocksForLens;
  } catch (err) {
    console.log("Error fetching blocks", err)
    return [];
  }
}

type InboxPageProps = {
  searchParams: { [key: string]: string | string[] | undefined }
}

export default async function InboxPage(props: InboxPageProps) {
  const supabase = createServerComponentClient({ cookies })
  const blocks = await getBlocks(supabase);

  return <Inbox blocks={blocks} />
}