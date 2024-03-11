import { ok, notOk } from "@lib/ok";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { NextRequest } from "next/server";
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest, { params, }: { params: { lens_id: string }; }) {
    const supabase = createServerComponentClient({ cookies });

    const lens_id = Number(params.lens_id);
    // Validate the id  
    if (isNaN(lens_id)) {
        return notOk("Invalid ID");
    }
    try {

        const { data: lens, error } = await supabase
            .from('lens')
            .select(`
            *,
            blocks:lens_blocks!fk_lens(
                *,
                block!fk_block(
                    block_id, created_at, updated_at, block_type, is_file, parent_id, owner_id, title, status, preview, public
                )
            ),
            lens_users(user_id, access_type),
            subspaces:lens!parent_id(*),
            spreadsheets:spreadsheet(
                spreadsheet_id, created_at, owner_id, lens_id, name, plugin 
            ),
            whiteboards:whiteboard(
                whiteboard_id, created_at, updated_at, owner_id, lens_id, name, plugin
            ),
            widgets:widget(
                widget_id, created_at, owner_id, lens_id, name, state
            )
        `)
            .eq('lens_id', lens_id)
            .eq('blocks.direct_child', true)
            .single();

        // Check for errors
        if (error) {
            throw error.message;
        }

        lens.blocks = lens.blocks.map((block: any) => {
            return block.block;
        });


        return ok(lens);
    } catch (err) {
        return notOk(`${err}`);
    }
}