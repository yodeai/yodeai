
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { Database, Tables } from "app/_types/supabase";
import { redirect } from "next/navigation";

import widgets, { WidgetType } from '@components/Widgets';
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

    console.log({ widget_id, widget_type })

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

    const Widget: WidgetType<WidgetData> = widgets[widget_type];

    return <Widget
        name={data.name}
        input={data.input}
        output={data.output}
        state={data.state as WidgetData["state"]}
    />
}