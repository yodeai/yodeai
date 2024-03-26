import { useEffect, useState } from "react";
import { Tables } from "app/_types/supabase";
import { useAppContext } from "@contexts/context";
import { useProgressRouter } from "app/_hooks/useProgressRouter";

export const useWidget = <K, L>(widgetData: Tables<"widget"> & {
    input: K;
    output: L;
}) => {
    const [data, setData] = useState(widgetData);
    const router = useProgressRouter();

    const { setLensId, setBreadcrumbActivePage } = useAppContext();

    useEffect(() => {
        setLensId(widgetData.lens_id?.toString())
        setBreadcrumbActivePage({
            title: widgetData.name,
            href: `/widget/${widgetData.widget_id}`
        });

        return () => {
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
            router.revalidate();
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
            setData({ ...data, ...newData } as Tables<"widget"> & { input: K; output: L });
            router.revalidate();
        })
    }

    const deleteWidget = async () => {
        return fetch(`/api/widget/${data.widget_id}`, {
            method: 'DELETE'
        }).then(res => {
            if (res.ok) {
                router.replace(`/lens/${data.lens_id}`)
            }
            return res;
        }).finally(() => {
            router.revalidate();
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