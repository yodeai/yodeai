import PRDTicketPlugin from './prd-to-tickets'
import { Tables } from 'app/_types/supabase'


export type WidgetComponentProps<T, K> = {
    widget_id: number;
    lens_id: number;
    name: string;
    input: T;
    output: K;
    state?: {
        status: "waiting" | "queued" | "processing" | "success" | "error";
        message?: string;
        progress?: number;
    }
    access_type: "owner" | "editor" | "reader";
}
export type WidgetProps<T, K> = Tables<"widget"> & WidgetComponentProps<T, K>
export type WidgetType<T, K> = (props: WidgetProps<T, K>) => JSX.Element
export type WidgetComponentType<T, K> = (props: WidgetComponentProps<T, K>) => JSX.Element

export default {
    "prd-to-tickets": PRDTicketPlugin
}