import { createServerComponentClient, SupabaseClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import Block from '@components/Pages/Block';
import { notFound } from 'next/navigation';

const getBlock = async (supabase: SupabaseClient, id: string) => {
  const block_id = Number(id);
  const { data: { user } } = await supabase.auth.getUser()

  // Validate the id  
  if (isNaN(block_id)) {
    return notFound();
  }
  try {
    const { data: block, error: blockError } = await supabase
      .from('block')
      .select('*')
      .eq('block_id', block_id)
      .single();

    // Check for errors
    if (blockError) {
      throw blockError;
    }

    const { data: accessLevel, error: accessLevelError } = await supabase.rpc('get_access_type_block', { "chosen_block_id": block_id, "chosen_user_id": user.id })
    if (accessLevelError) {
      console.log("message", accessLevelError.message)
      throw accessLevelError;
    }
    block.accessLevel = accessLevel ? accessLevel : "owner"; // if the block is not part of a lens, then it is the user's own block

    return block;
  } catch (err) {
    console.log("error", err.message)
    return notFound();
  }
}

type BlockPageProps = {
  params: { id: string }
  searchParams: { [key: string]: string | string[] | undefined }
}

export default async function BlockPage(props: BlockPageProps) {
  const supabase = createServerComponentClient({ cookies });
  const { id } = props.params;
  const block = await getBlock(supabase, id);

  return <Block block={block} />
}