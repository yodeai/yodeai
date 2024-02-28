
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { Database, Tables } from "app/_types/supabase";
import { redirect } from "next/navigation";

import widgets, { WidgetComponentProps, WidgetComponentType, WidgetType } from '@components/Widgets';
import { Result } from "@components/Result";
import { MdError } from "react-icons/md";
import { WidgetData } from "app/_types/widget";

type PageProps = {
    params: { widget_id: number, widget_type: string }
    searchParams: { [key: string]: string | string[] | undefined }
}

export default async function Page({ params, searchParams }: PageProps) {
    const { widget_id, widget_type } = params;
    if (widget_type in widgets === false)
        return <Result
            title="Error"
            description="Widget path couldn't be found. Please try again later."
            icon={<MdError color="#222" size={28} />} />

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
        .eq('type', widget_type)
        .single();


    if (error) {
        console.log(error)
        return redirect("/notFound");
    }

    const Widget: WidgetComponentType<{}, {}> = widgets[widget_type];

    const accessTypeResponse = await supabase.rpc('get_access_type_widget', { "chosen_user_id": user.id, "chosen_widget_id": widget_id })
    if (accessTypeResponse.error) {
        console.log("message", accessTypeResponse.error.message);
        throw accessTypeResponse.error.message;
    }

    const accessType = accessTypeResponse.data as "owner" | "editor" | "reader";
    return <Widget
        widget_id={widget_id}
        name={data.name}
        input={data.input}
        output={data.output}
        state={data.state as WidgetData["state"]}
        access_type={accessType}
    />
}