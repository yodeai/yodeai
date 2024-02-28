import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import Whiteboard from '@components/Whiteboard';
import { Database, Tables } from "app/_types/supabase";
import { redirect } from "next/navigation";
import { WhiteboardComponentProps } from "app/_types/whiteboard";
import { access } from "fs";
import { Result } from "@components/Result";
import { MdError } from "react-icons/md";
import { FaCircleNotch } from "react-icons/fa";

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
        .single();

    if (error) {
        redirect("/notFound");
    }
    let whiteboard = (data as WhiteboardComponentProps["data"])

    if (whiteboard?.plugin?.state && whiteboard?.plugin?.state?.status === 'error') {
        return <Result
            title="Error"
            description="The plugin has encountered an error, and the output is not available at this time. Please try again later."
            icon={<MdError color="#222" size={28} />} />
    }

    if (whiteboard?.plugin?.state && whiteboard?.plugin?.state?.status !== 'success') {
        return <Result
            refreshInvervally={true}
            title="Processing..."
            description="Spreadsheet is still processing, please check back later."
            icon={<FaCircleNotch className="animate-spin" size={24} />} />
    }

    const accessTypeResponse = await supabase.rpc('get_access_type_whiteboard', { "chosen_user_id": user.id, "chosen_whiteboard_id": whiteboard_id })
    if (accessTypeResponse.error) {
        console.log("message", accessTypeResponse.error.message);
        throw accessTypeResponse.error.message;
    }

    const whiteboardWithAccessType = data as Tables<"whiteboard"> & { accessType: string };
    whiteboardWithAccessType.accessType = accessTypeResponse.data ?? "owner"; // if the whiteboard is not part of a lens, then it is the user's own whiteboard.

    return <Whiteboard data={whiteboardWithAccessType as WhiteboardComponentProps["data"]} />
}