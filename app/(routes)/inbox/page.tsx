import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import Inbox from '@components/Pages/Inbox';

const supabase = createServerComponentClient({ cookies })

const getBlocks = async () => {
  try {
    const user = await supabase.auth.getUser()
    const user_metadata = user?.data?.user?.user_metadata;

    const { data: blocks, error } = await supabase
      .from('block')
      .select(`
    *,
    lens_blocks!fk_block (
        lens: lens!fk_lens (lens_id, name)
    )`)
      .in('google_user_id', [user_metadata?.google_user_id, 'global'])
      .eq('lens_blocks.direct_child', true)
      .order('updated_at', { ascending: false })

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
  } catch (err) {
    console.log("Error fetching blocks", err)
    return [];
  }
}

type InboxPageProps = {
  searchParams: { [key: string]: string | string[] | undefined }
}

export default async function InboxPage(props: InboxPageProps) {
  const blocks = await getBlocks();

  return <Inbox blocks={blocks} />
}