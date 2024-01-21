import { Tables } from "app/_types/supabase"
import { WhiteboardPlugins } from "app/_types/whiteboard"
import { Node } from "reactflow"

type UserInsightMeta = {
    type: "user-insight"
}

export const render = (payload: WhiteboardPlugins["user-insight"]): Node[] => {
    return payload.insights.map((insight, index) => {
        return {
            id: `user-insight-${index}`,
            data: {
                text: insight.user.name
            },
            type: "text",
            position: {
                x: 0,
                y: 0
            },
            style: {
                width: 150,
                height: 50,
            },
            width: 150,
            height: 50,
            dataMeta: {
                type: "user-insight"
            }
        }
    })
}