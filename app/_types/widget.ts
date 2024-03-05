export type WidgetData = {
    name: string;
    input: {};
    output: {};
    state?: {
        status: "waiting" | "queued" | "processing" | "success" | "error";
        message?: string;
        progress?: number;
    }
};