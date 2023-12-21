import { notOk } from "@lib/ok";
import Lens from "./lens";
import { SupabaseClient, createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

type LensPageProps = {
    params: { lens_ids: string[] }
    searchParams: { [key: string]: string | string[] | undefined }
}

const getLensData = async (supabase: SupabaseClient, lens_id: number) => {
    const { data: lens, error } = await supabase
        .from('lens').select('*, lens_users(user_id, access_type)')
        .eq('lens_id', lens_id);

    if (error) {
        console.log(error);
        return redirect(`/notFound`)
    }

    if (lens.length === 0){
        return redirect(`/notFound`)
    }

    lens[0].user_to_access_type = {}
    lens[0].lens_users.forEach(obj => {
        lens[0].user_to_access_type[obj.user_id] = obj.access_type;
    });

    return lens[0];
}

export default async function LensPage({ params, searchParams }: LensPageProps) {
    const { lens_ids } = params;
    const supabase = createServerComponentClient({ cookies });

    let lens_id: number | string = lens_ids[lens_ids.length - 1];
    if (Number.isNaN(Number(lens_id))) return <p>Invalid lens id</p>
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