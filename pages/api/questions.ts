import { supabase } from "./supabaseClient"; 

type Question = {
  id: string,
  question_text: string,
  generated_answer: string,
  asked_on_whatsapp: boolean,
  whatsapp_message_id: string | null,
  whatsapp_phone_number: string | null,
  slug: string
};

export async function fetchQuestionBySlug(slug: string): Promise<Question | null> {
  const { data, error } = await supabase
    .from('questions')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) throw error;

  return data || null;
}
