
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { Database } from "app/_types/supabase";
import { redirect } from "next/navigation";

import widgets, { WidgetComponentType } from '@components/Widgets/Widget';
import { Result } from "@components/Result";
import { MdError } from "@react-icons/all-files/md/MdError";
import { WidgetData } from "app/_types/widget";

type PageProps = {
    params: { widget_id: number }
    searchParams: { [key: string]: string | string[] | undefined }
}

export default async function Page({ params, searchParams }: PageProps) {
    const { widget_id } = params;
    const supabase = createServerComponentClient<Database>({ cookies });

    if (Number.isNaN(Number(widget_id)))
        return <Result title="Error" description="Widget not found." icon={<MdError color="#222" size={28} />} />

    const userData = await supabase.auth.getUser();
    const user = userData.data.user;
    if (!userData || !user) return redirect("/notFound");

    const { data, error } = await supabase
        .from('widget')
        .select('*')
        .eq('widget_id', widget_id)
        .single();

    if (error) {
        console.log(error)
        return redirect("/notFound");
    }

    if (data.type in widgets === false)
        return <Result
            title="Error"
            description="Widget path couldn't be found. Please try again later."
            icon={<MdError color="#222" size={28} />} />

    const Widget: WidgetComponentType<{}, {}> = widgets[data.type];
    const accessTypeResponse = await supabase.rpc('get_access_type_widget', { "chosen_user_id": user.id, "chosen_widget_id": widget_id })
    if (accessTypeResponse.error) {
        console.log("message", accessTypeResponse.error.message);
        throw accessTypeResponse.error.message;
    }

    const accessType = accessTypeResponse.data as "owner" | "editor" | "reader";
    return <Widget
        widget_id={widget_id}
        lens_id={data.lens_id}
        name={data.name}
        input={data.input}
        output={data.output}
        state={data.state as WidgetData["state"]}
        access_type={accessType}
    />
}