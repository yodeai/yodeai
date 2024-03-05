import { useEffect, useState } from "react";
import { Tables } from "app/_types/supabase";
import { useAppContext } from "@contexts/context";

export const useWidget = <K, L>(widgetData: Tables<"widget"> & {
    input: K;
    output: L;
}) => {
    const [data, setData] = useState(widgetData);

    const { setLensId, setBreadcrumbActivePage } = useAppContext();

    useEffect(() => {
        console.log(widgetData)

        setLensId(widgetData.lens_id?.toString())
        setBreadcrumbActivePage({
            title: widgetData.name,
            href: `/widget/${widgetData.widget_id}`
        });

        return () => {
            setLensId(null);
            setBreadcrumbActivePage(null);
        }
    }, [widgetData.lens_id])

    const updateTitle = async (newTitle: string) => {
        return fetch(`/api/widget/${data.widget_id}`, {
            method: 'PUT',
            body: JSON.stringify({ name: newTitle }),
            headers: {
                'Content-Type': 'application/json'
            }
        }).finally(() => {
            setData({ ...data, name: newTitle })
        })
    }

    const updateWidget = async (newData: Partial<Tables<"widget">>) => {
        return fetch(`/api/widget/${data.widget_id}`, {
            method: 'PUT',
            body: JSON.stringify(newData),
            headers: {
                'Content-Type': 'application/json'
            }
        }).finally(() => {
            return setData({ ...data, ...newData } as Tables<"widget"> & { input: K; output: L });
        })
    }

    const deleteWidget = async () => {
        return fetch(`/api/widget/${data.widget_id}`, {
            method: 'DELETE'
        })
    }

    return {
        name: data.name,
        input: data.input,
        output: data.output,
        state: data.state,
        updateTitle,
        updateWidget,
        deleteWidget
    }
}