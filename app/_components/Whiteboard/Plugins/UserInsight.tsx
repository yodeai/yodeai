import { WhiteboardPlugins } from "app/_types/whiteboard"
import { Node } from "reactflow"
import { createText, createStickyNote, createGroupNode } from './utils/renderer';
import { getNodesBounding } from "./utils";
import { create } from "domain";

export const render = (payload: WhiteboardPlugins["user-insight"]): Node<any>[] => {
    let groupNodes: Node<any>[] = [];
    const colors = ["#ffd43b", "#3e83f8", "#f05152", "#0c9f6e", "#c37801"];

    // rendering insights with title
    for (let [insightIndex, insight] of Object.entries(payload.insights)) {
        const groupBounding = getNodesBounding(groupNodes);
        const groupNodeColor = colors[Number(insightIndex) % colors.length];

        let nodes: Node<any>[] = [];
        // user title and bio description
        nodes = nodes.concat([
            createText({
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
        const groupTitleText = createText({
            data: { text: "User Insight", size: 48 },
            position: {
                x: groupBounding.right + 100 + bounding.left,
                y: bounding.top
            },
            width: 400, height: 100
        });
        const groupNode = createGroupNode({
            data: { color: groupNodeColor },
            width: bounding.right - bounding.left + (groupBoxPaddingLeft * 2),
            height: bounding.bottom - bounding.top + (groupBoxPaddingTop * 2),
            position: {
                x: groupBounding.right + 100 + bounding.left,
                y: bounding.top + 120
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

        groupNodes = groupNodes.concat([groupTitleText, groupNode, ...nodes])
    }

    // rendering summary of insights
    const groupBounding = getNodesBounding(groupNodes);

    const summaryNodes: Node<any>[] = [];
    const summaryTopicNodes: Node<any>[] = [];
    payload.summary.topics.forEach((topic, topicIndex) => {
        const summaryTopicBounding = getNodesBounding(summaryTopicNodes);

        summaryTopicNodes.push(createText({
            id: topic.key,
            data: { text: topic.name, size: 32 },
            position: { x: summaryTopicBounding.right + (topicIndex === 0 ? 150 : 50), y: summaryTopicBounding.top },
            width: 180, height: 50
        }));
    })

    payload.summary.users.forEach((user, userIndex) => {
        const summaryTopicBounding = getNodesBounding(summaryTopicNodes);

        const summaryUserTitle = createText({
            id: user.id,
            data: { text: user.name, size: 32 },
            position: { x: summaryTopicBounding.left, y: summaryTopicBounding.bottom + 50 },
            width: 150, height: 50
        })

        user.commentSummary.forEach((comment, commentIndex) => {
            summaryTopicNodes.push(createStickyNote({
                data: { text: comment.content || "―", color: "#ffd43b" },
                position: {
                    x: summaryTopicBounding.left + ((summaryTopicNodes[0].width + 60) * Number(commentIndex)) + summaryUserTitle.width,
                    y: summaryTopicBounding.bottom + 50
                },
                width: 180, height: 125
            }));

        })

        summaryTopicNodes.push(summaryUserTitle)
    })

    const summaryTopicBounding = getNodesBounding(summaryTopicNodes);
    const summaryGroupNode = createGroupNode({
        width: summaryTopicBounding.right - summaryTopicBounding.left + 100,
        height: summaryTopicBounding.bottom - summaryTopicBounding.top + 100,
        position: { x: groupBounding.right + 200 + summaryTopicBounding.left, y: summaryTopicBounding.top + 120 }
    });

    // summary group node title
    summaryNodes.push(createText({
        data: { text: "Summary", size: 48 },
        position: { x: groupBounding.right + 200 + summaryTopicBounding.left, y: summaryTopicBounding.top },
        width: 400, height: 100
    }));

    summaryNodes.push(
        // summary group node
        summaryGroupNode,

        // summary topic nodes
        ...summaryTopicNodes.map(node => ({
            ...node,
            parentNode: summaryGroupNode.id,
            position: {
                x: node.position.x + 50,
                y: node.position.y + 50
            }
        })));



    groupNodes = groupNodes.concat(summaryNodes);


    return groupNodes;
}