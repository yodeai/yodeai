
export type PluginNames = "user-insight"
export type WhiteboardPluginParams = {
    name: PluginNames;
    rendered: boolean;
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

export type WhiteboardPlugins = {
    "user-insight": UserInsight
}