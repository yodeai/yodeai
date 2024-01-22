import { WhiteboardPlugins } from "app/_types/whiteboard"
import { Node } from "reactflow"
import { createText, createStickyNote, createGroupNode } from './utils/renderer';
import { getNodesBounding } from "./utils";

export const render = (payload: WhiteboardPlugins["user-insight"]): Node<any>[] => {
    let groupNodes: Node<any>[] = [];
    const colors = ["#ffd43b", "#3e83f8", "#f05152", "#0c9f6e", "#c37801"];

    for (let [insightIndex, insight] of Object.entries(payload.insights)) {
        const groupBounding = getNodesBounding(groupNodes);
        const groupNodeColor = colors[Number(insightIndex) % colors.length];

        let nodes: Node<any>[] = [];
        // user title and bio description
        nodes = nodes.concat([
            createText({
                id: insight.user.id,
                data: {
                    text: insight.user.name,
                    size: 32
                },
                position: { x: 0, y: 0 },
                width: 500, height: 60
            }),
            createStickyNote({
                data: { text: insight.user.info, color: groupNodeColor },
                position: { x: 580, y: 10 },
                width: 300, height: 50
            })
        ])

        for (let topic of insight.data) {
            let bounding = getNodesBounding(nodes);

            // topic title
            nodes = nodes.concat([
                createText({
                    data: { text: topic.topicName, size: 24 },
                    position: { x: 0, y: bounding.bottom + 50 },
                    width: 500, height: 50
                })
            ])

            for (let [commentIndex, comment] of Object.entries(topic.comments)) {
                const commentBoxWidth = 160;
                const commentBoxHeight = 125;

                bounding = getNodesBounding(nodes);

                const commentX = ((commentBoxWidth + 20) * (Number(commentIndex) % 5))
                const commentY = Number(commentIndex) % 5 === 0
                    ? bounding.bottom + 20
                    : bounding.bottom - commentBoxHeight;

                // comments
                nodes = nodes.concat([
                    createStickyNote({
                        data: { text: comment.comment, color: groupNodeColor },
                        position: { x: commentX, y: commentY },
                        width: commentBoxWidth, height: commentBoxHeight
                    })
                ])
            }
        }

        const groupBoxPaddingLeft = 50;
        const groupBoxPaddingTop = 75;

        const bounding = getNodesBounding(nodes);
        const groupNode = createGroupNode({
            data: { color: groupNodeColor },
            width: bounding.right - bounding.left + (groupBoxPaddingLeft * 2),
            height: bounding.bottom - bounding.top + (groupBoxPaddingTop * 2),
            position: {
                x: groupBounding.right + 100 + bounding.left,
                y: bounding.top
            }
        });

        nodes = nodes.map(node => ({
            ...node,
            extent: "parent",
            parentNode: groupNode.id,
            position: {
                x: node.position.x + groupBoxPaddingLeft,
                y: node.position.y + groupBoxPaddingTop
            }
        }));

        groupNodes = groupNodes.concat([groupNode, ...nodes])
    }

    return groupNodes;
}