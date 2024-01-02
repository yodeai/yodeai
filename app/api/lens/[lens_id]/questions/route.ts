import { ok, notOk } from "@lib/ok";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { NextRequest } from "next/server";
import { cookies } from 'next/headers';
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest, { params, }: { params: { lens_id: string }; }) {
    const supabase = createServerComponentClient({ cookies });

    const { data: { user: { id: user_id } } } = await supabase.auth.getUser();

    const lens_id = Number(params.lens_id);
    if (isNaN(lens_id)) {
        return notOk("Invalid ID");
    }

    if (!user_id) {
        return notOk("Not logged in");
    }
    try {
        let { data, error } = await supabase
            .from('questions')
            .select('id, user_id, question_text, answer_full, popularity, lens_id, created_at, updated_at, block_ids')
            .eq('lens_id', lens_id)
            .eq('user_id', user_id)

        data = await Promise.all(data.map(async (question) => {
            const { data: sources, error } = await supabase
                .from('block')
                .select('block_id, title')
                .in('block_id', question.block_ids || [])
            if (error) throw error.message;
            return { ...question, sources }
        }));

        if (error) throw error.message;

        return ok(data);
    } catch (err) {
        return notOk(`${err}`);
    }
}