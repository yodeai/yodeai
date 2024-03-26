import { SupabaseClient, createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import MyBlocks from '@components/Pages/MyBlocks';

const getBlocks = async (supabase: SupabaseClient) => {
  try {
    const user = await supabase.auth.getUser()
    const user_metadata = user?.data?.user?.user_metadata;

    // Fetch all blocks associated with the given lens_id, and their related lenses
    const { data: blocks, error } = await supabase
      .from('block')
      .select(`
        *,
        lens_blocks!fk_block (
            lens: lens!fk_lens (lens_id, name)
        )`)
      .in('google_user_id', [user_metadata?.google_user_id, 'global'])
      .eq('lens_blocks.direct_child', true)
      .order('created_at', { ascending: false })
      .limit(30);

    if (error) {
      throw error;
    }

    // Extract the associated blocks from the lensBlocks data and add their lenses
    const blocksWithLenses = (blocks || []).map(block => ({
      ...block,
      inLenses: block.lens_blocks
          .filter(lb => lb.lens)  // This will filter out lens_blocks with lens set to null
          .map(lb => ({
              lens_id: lb.lens.lens_id,
              name: lb.lens.name
          }))
  }));

    return blocksWithLenses;
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