import { supabase } from "../supabaseClient";
import { NextResponse, NextRequest } from 'next/server'

type Question = {
    id: string,
    question_text: string,
    generated_answer: string,
    asked_on_whatsapp: boolean,
    whatsapp_message_id: string | null,
    whatsapp_phone_number: string | null,
    slug: string
};

/*
export async function fetchQuestionBySlug(slug: string): Promise<Question | null> {
  const { data, error } = await supabase
    .from('questions')
    .select('*')
    .eq('slug', slug)
    .single();
  console.log("found question");
  if (error) throw error;

  return data || null;
}
*/

export async function GET(request: NextRequest) {
    console.log("here");
    try {
        const slug = request.nextUrl.searchParams.get("slug");
        const { data, error } = await supabase
            .from('questions')
            .select('*')
            .eq('slug', slug)
            .single();
        if (error) throw error;
        return new NextResponse(
            JSON.stringify({ data: data }),
            { status: 200 }
        );
    } catch (error) {
        console.error("Error retrieving question:", error);
        return new NextResponse(
            JSON.stringify({ error: 'Failed retrieve question.' }),
            { status: 500 }
        );
    }

}