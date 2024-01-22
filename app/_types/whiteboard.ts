import { Tables } from "app/_types/supabase"

export type PluginNames = "user-insight"
export type WhiteboardPluginParams = {
    name: PluginNames;
    data: {
        text: string;
    }
    rendered: boolean;
    state: {
        status: "queued" | "processing" | "success" | "error";
        message?: string;
        progress?: number;
    }
}

type UserInsight = {
    insights: Array<{
        data: Array<{
            comments: Array<{
                id: string
                comment: string
            }>
            topicKey: string
            topicName: string
        }>
        user: {
            id: string;
            info: string
            name: string
        }
    }>,
    summary: {
        topics: Array<{
            key: string
            name: string
        }>
        users: Array<{
            name: string
            id: string;
            topicSummary: {
                topicKey: string
                summary: string;
            }
        }>
    }
}

type CompetitiveAnalysis = Array<{
    company: string;
    data: Array<{
        title: string;
        content: string;
        sources: Array<string>;
    }>
}>

export type WhiteboardPlugins = {
    "user-insight": UserInsight;
    "competitive-analysis": CompetitiveAnalysis;
}

export type WhiteboardComponentProps = {
    data: Tables<"whiteboard"> & {
        plugin?: WhiteboardPluginParams
    }
}