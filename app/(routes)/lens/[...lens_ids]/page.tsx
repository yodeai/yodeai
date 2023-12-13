import Lens from "./lens";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

type LensPageProps = {
    params: { lens_ids: string[] }
    searchParams: { [key: string]: string | string[] | undefined }
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

    return <Lens user={user} lens_id={lens_id} />
}