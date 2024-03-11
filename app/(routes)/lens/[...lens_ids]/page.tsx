import { notOk } from "@lib/ok";
import Lens from "./lens";
import { SupabaseClient, createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Database } from "app/_types/supabase";

type LensPageProps = {
    params: { lens_ids: string[] }
    searchParams: { [key: string]: string | string[] | undefined }
}

const getLensData = async (supabase: SupabaseClient, lens_id: number) => {
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
            ),
            layout:lens_layout(
            * 
        )`)
        .eq('lens_id', lens_id)
        .eq('blocks.direct_child', true)

    if (error) {
        console.log(error);
        return redirect(`/notFound`)
    }

    if (lens.length === 0) {
        return redirect(`/notFound`)
    }

    lens[0].user_to_access_type = {}
    lens[0].lens_users.forEach(obj => {
        lens[0].user_to_access_type[obj.user_id] = obj.access_type;
    });

    lens[0].blocks = lens[0].blocks.map(block => {
        return block.block;
    })

    return lens[0];
}

export default async function LensPage({ params, searchParams }: LensPageProps) {
    const { lens_ids } = params;
    const supabase = createServerComponentClient<Database>({ cookies });

    let lens_id: number | string = lens_ids[lens_ids.length - 1];
    if (Number.isNaN(Number(lens_id))) return redirect(`/notFound`);
    else lens_id = Number(lens_id);

    const userData = await supabase.auth.getUser();
    if (userData.error || userData.data === null) return <p>Not logged in.</p>
    const user = userData.data.user;

    const lensData = await getLensData(supabase, lens_id);

    if (lensData.parents) {
        // parent control check if lens_ids on the route is different
        const lens_ids_from_route = lens_ids.slice(0, -1).join('/')
        const parent_ids_from_db = lensData.parents.slice(0, -1).filter(el => Number(el) > 0).reverse().join('/')

        if (lens_ids_from_route !== parent_ids_from_db) {
            return redirect(`/lens/${parent_ids_from_db}/${lens_id}`)
        }
    }

    return <Lens
        lensData={lensData}
        user={user}
        lens_id={lens_id}
    />
}