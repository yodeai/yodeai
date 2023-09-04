import supabase from '@utils/supabaseServerClient';

export const updateLensName = async (lens_id: number, newName: string) => {
  const { data, error } = await supabase
    .from('lens')
    .update({ name: newName })
    .eq('lens_id', lens_id);

  if (error) {
    throw new Error("Unable to update lens name");
  }

  return data;
};
