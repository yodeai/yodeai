import supabase from '@utils/supabaseServerClient';
import { Block } from "app/_types/block";

export default async function getBlock(block_id: string): Promise< Block >  {
    const { data, error } = await supabase
        .from('block')
        .select('*')
        .eq('block_id', block_id)
        .single();
    if (error) throw error;

    

    const block: Block = {
        ...data,
        kids: data?.kids || [],
        links: data?.links || [],
        backlinks: data?.backlinks || [],
      };
    return block as Block;

}

export type BlockWithRelations = ThenArg<ReturnType<typeof getBlock>>;