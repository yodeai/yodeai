import { useState } from "react";
import { Tables } from "app/_types/supabase";

export const useWidget = <K, L>(widgetData: Tables<"widget"> & {
    input: K;
    output: L;
}) => {
    const [data, setData] = useState(widgetData);

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