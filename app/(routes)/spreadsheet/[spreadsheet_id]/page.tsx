
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import Spreadsheet from '@components/Spreadsheet';
import { Database, Tables } from "app/_types/supabase";
import { redirect } from "next/navigation";
import { SpreadsheetDataSource, SpreadsheetPluginParams } from "app/_types/spreadsheet";
import { convertDataSource } from "@components/Spreadsheet/utils";

type SpreadsheetProps = {
    params: { spreadsheet_id: number }
    searchParams: { [key: string]: string | string[] | undefined }
}

export default async function SpreadsheetPage({ params, searchParams }: SpreadsheetProps) {
    const { spreadsheet_id } = params;
    const supabase = createServerComponentClient<Database>({ cookies });

    if (Number.isNaN(Number(spreadsheet_id))) return <p>Spreadsheet not found.</p>

    const userData = await supabase.auth.getUser();
    const user = userData.data.user;
    if (!userData || !user) return redirect("/notFound");

    const { data, error } = await supabase
        .from("spreadsheet")
        .select("*")
        .eq("spreadsheet_id", spreadsheet_id)
        .single<Tables<"spreadsheet"> & {
            dataSource: SpreadsheetDataSource;
            plugin: SpreadsheetPluginParams;
        }>();

    if (error) {
        console.log(error)
        redirect("/notFound");
    }
    if (data?.plugin?.state && data?.plugin?.state?.status !== 'success') {
        return <p>Spreadsheet is still processing, please check back later.</p>;
    }

    const accessTypeResponse = await supabase.rpc('get_access_type_spreadsheet', { "chosen_user_id": user.id, "chosen_spreadsheet_id": spreadsheet_id })
    if (accessTypeResponse.error) {
        console.log("message", accessTypeResponse.error.message);
        throw accessTypeResponse.error.message;
    }

    const accessType = (accessTypeResponse.data as "owner" | "editor" | "reader") ?? "owner";
    return <Spreadsheet
        spreadsheet={data}
        access_type={accessType}
    />
}