import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export const updateLensName = async (lens_id: number, newName: string) => {
  const supabase = createClientComponentClient();
  const { data, error } = await supabase
    .from('lens')
    .update({ name: newName })
    .eq('lens_id', lens_id);

  if (error) {
    throw new Error("Unable to update lens name");
  }

  return data;
};
