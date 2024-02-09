
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import Spreadsheet from '@components/Spreadsheet';
import { Database, Tables } from "app/_types/supabase";
import { redirect } from "next/navigation";

type SpreadsheetProps = {
    params: { spreadsheet_id: number }
    searchParams: { [key: string]: string | string[] | undefined }
}

export default async function SpreadsheetPage({ params, searchParams }: SpreadsheetProps) {
    const { spreadsheet_id } = params;
    const supabase = createServerComponentClient<Database>({ cookies });

    // if (Number.isNaN(Number(spreadsheet_id))) return <p>Spreadsheet not found.</p>

    // const userData = await supabase.auth.getUser();
    // if (userData.error || userData.data === null) return <p>Not logged in.</p>
    // const user = userData.data.user;

    // const { data, error } = await supabase
    //     .from("spreadsheet")
    //     .select("*")
    //     .eq("spreadsheet_id", spreadsheet_id)
    //     .single();

    // if (error) {
    //     redirect("/notFound");
    // }
    // let whiteboard = (data as WhiteboardComponentProps["data"])
    // if (whiteboard?.plugin?.state && whiteboard?.plugin?.state?.status !== 'success') {
    //     return <p>Whiteboard is still processing, please check back later.</p>;
    // }

    // const accessTypeResponse = await supabase.rpc('get_access_type_whiteboard', { "chosen_user_id": user.id, "chosen_whiteboard_id": whiteboard_id })
    // if (accessTypeResponse.error) {
    //     console.log("message", accessTypeResponse.error.message);
    //     throw accessTypeResponse.error.message;
    // }

    // const whiteboardWithAccessType = data as Tables<"whiteboard"> & { accessType: string };
    // whiteboardWithAccessType.accessType = accessTypeResponse.data ?? "owner"; // if the whiteboard is not part of a lens, then it is the user's own whiteboard.

    return <Spreadsheet />
}