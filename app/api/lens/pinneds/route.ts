import { ok, notOk } from "@lib/ok";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { NextRequest } from "next/server";
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
    const supabase = createServerComponentClient({ cookies });

    const { data: { user } } = await supabase.auth.getUser();
    if(!user) return notOk('Session not found. Please log in.');

    try {
        const { data: lenses, error: lensesError } = await supabase
            .from('lens')
            .select('*, lens_users(user_id, access_type, pinned)')
            .order('updated_at', { ascending: false });

        if (lensesError) {
            console.error('Error fetching lenses:', lensesError);
            throw lensesError.message;
        }

        const filteredLenses = lenses
            .filter(lens => lens.lens_users.some(lens_user => lens_user.pinned && lens_user.user_id === user?.id));

        for (const lens of filteredLenses) {
            lens.user_to_access_type = {};
            lens.lens_users.forEach(obj => {
                lens.user_to_access_type[obj.user_id] = obj.access_type;
            });
        }

        return ok(filteredLenses);
    } catch (err) {
        return notOk(`${err}`);
    }
}
