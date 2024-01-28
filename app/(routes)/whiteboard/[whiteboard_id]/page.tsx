import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import Whiteboard from '@components/Whiteboard';
import { Database } from "app/_types/supabase";
import { redirect } from "next/navigation";
import { WhiteboardComponentProps } from "app/_types/whiteboard";

type WhiteboardPageProps = {
    params: { whiteboard_id: number }
    searchParams: { [key: string]: string | string[] | undefined }
}


export default async function WhiteboardPage({ params, searchParams }: WhiteboardPageProps) {
    const { whiteboard_id } = params;
    const supabase = createServerComponentClient<Database>({ cookies });

    if (Number.isNaN(Number(whiteboard_id))) return <p>Whiteboard not found.</p>

    const userData = await supabase.auth.getUser();
    if (userData.error || userData.data === null) return <p>Not logged in.</p>
    const user = userData.data.user;

    const { data, error } = await supabase
        .from("whiteboard")
        .select("*")
        .eq("whiteboard_id", whiteboard_id)
        .eq("owner_id", user.id)
        .single();

    if (error) {
        redirect("/notFound");
    }
    if ((data as WhiteboardComponentProps["data"])?.plugin?.state?.status !== 'success') {
        return <p>Whiteboard is still processing, please check back later.</p>;
    }  

    return <Whiteboard data={data as WhiteboardComponentProps["data"]} />
}