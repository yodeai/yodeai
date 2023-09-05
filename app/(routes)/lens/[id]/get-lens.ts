
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Lens } from "app/_types/lens";

const supabase = createClientComponentClient();

export default async function getLens(lens_id: string): Promise<Lens> {
    const { data, error } = await supabase
      .from('lens')
      .select('*')
      .eq('lens_id', lens_id)
      .single();
  
    if (error) {
      throw new Error("Unable to fetch lens");
    }
  
    const lens: Lens = data;
  
    // Fetch child lenses
    const { data: childLenses, error: childLensesError } = await supabase
      .from('lens')
      .select('*')
      .eq('parent_id', lens_id);
    
    if (childLensesError) {
      throw new Error("Unable to fetch child lenses");
    }
    
    lens.children = childLenses;
  
    // Fetch associated blocks
    const { data: lensBlocks, error: lensBlocksError } = await supabase
      .from('lens_blocks')
      .select('block_id')
      .eq('lens_id', lens_id);
    
    if (lensBlocksError) {
      throw new Error("Unable to fetch lens blocks");
    }
    
    const blockIds = lensBlocks.map(lb => lb.block_id);
  
    // Fetch blocks by their ids
    const { data: blocks, error: blocksError } = await supabase
      .from('block')
      .select('*')
      .in('block_id', blockIds);
    
    if (blocksError) {
      throw new Error("Unable to fetch blocks");
    }
  
    lens.blocks = blocks;
  
    return lens;
  }