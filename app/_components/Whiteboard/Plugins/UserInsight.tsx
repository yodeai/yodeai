import { WhiteboardPlugins } from "app/_types/whiteboard"
import { Node } from "reactflow"
import { createText, createStickyNote, createGroupNode } from './utils/renderer';
import { calculateStickyNoteBoxHeight, getNodesBounding } from "./utils";

const stickyNoteFontSize = 24;

export const render = (payload: WhiteboardPlugins["user-insight"]): Node<any>[] => {
    let groupNodes: Node<any>[] = [];
    const colors = ["#ffd43b", "#80caff", "#d9b8ff", "#f07576", "#55e0b2"];

    if(!payload) return groupNodes;

    const commentBoxWidth = 300;
    const commentBoxPadding = 20;
    const boxCountPerRow = 5;

    let insightBoxes: Node<any>[] = [];
    insightBoxes.push(createText({
        data: { text: "User Insights", size: 64 },
        position: { x: 0, y: 0 },
        width: 400, height: 130
    }));

    // rendering insights with title
    payload.insights.forEach((insight, insightIndex) => {
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
                width: 400, height: "auto"
            }),
            createStickyNote({
                data: { text: insight.user.info, color: groupNodeColor, fontSize: stickyNoteFontSize },
                position: { x: ((commentBoxWidth + commentBoxPadding) * boxCountPerRow) - 800, y: 0 },
                width: 800, height: "auto"
            })
        ])

        // user comments on topics
        insight.data.forEach(topic => {
            let bounding = getNodesBounding(nodes);

            // topic title
            nodes = nodes.concat([
                createText({
                    data: { text: topic.topicName, size: 24 },
                    position: { x: -10, y: bounding.bottom + 80 },
                    width: 900, height: "auto"
                })
            ]);

            bounding = getNodesBounding(nodes);


            let commentNodes: Node<any>[] = [];
            topic.comments.forEach((comment, commentIndex) => {
                const commentBoxHeight = calculateStickyNoteBoxHeight(comment.comment, commentBoxWidth, stickyNoteFontSize);

                const commentX = ((commentBoxWidth + commentBoxPadding) * (commentIndex % boxCountPerRow))
                const aboveCommentBoxesTotalHeight = commentNodes
                    .filter((_, ind) => (ind % boxCountPerRow) === (commentIndex % boxCountPerRow))
                    .reduce((acc, curr) => acc + curr.height + commentBoxPadding, 0)
                const commentY = aboveCommentBoxesTotalHeight + bounding.bottom;

                // comments
                commentNodes = commentNodes.concat([
                    createStickyNote({
                        data: { text: comment.comment, color: groupNodeColor, fontSize: stickyNoteFontSize },
                        position: { x: commentX, y: commentY },
                        width: commentBoxWidth, height: commentBoxHeight
                    })
                ])

            });

            if (topic.comments.length < boxCountPerRow) {
                Array.from({ length: boxCountPerRow - topic.comments.length }).forEach((_, index) => {
                    commentNodes = commentNodes.concat([
                        createStickyNote({
                            data: { text: "", color: groupNodeColor, fontSize: stickyNoteFontSize },
                            position: { x: ((commentBoxWidth + commentBoxPadding) * (topic.comments.length + index)), y: bounding.bottom },
                            width: commentBoxWidth, height: 100
                        })
                    ])
                })
            }

            nodes = nodes.concat(commentNodes);
        })

        const groupBoxPaddingLeft = 50;
        const groupBoxPaddingTop = 75;

        const bounding = getNodesBounding(nodes);

        const groupNodeHeight = bounding.bottom - bounding.top + (groupBoxPaddingTop * 2);
        const groupNodeWidth = bounding.right - bounding.left + (groupBoxPaddingLeft * 2);

        const sqrtN = Math.ceil(Math.sqrt(payload.insights.length));

        const nthRow = Math.floor(Number(insightIndex) / sqrtN);
        const nthCol = Number(insightIndex) % sqrtN;

        const insightBoxX = nthCol * (groupNodeWidth + 100)
        const aboveInsightBoxesTotalHeight = insightBoxes
            .filter(_ => _.type === "group")
            .filter((_, ind) => (ind % sqrtN) === (nthCol % sqrtN))
            .reduce((acc, curr) => acc + curr.height + 100, 20)
        const insightBoxY = aboveInsightBoxesTotalHeight + 100;

        const groupNode = createGroupNode({
            data: { color: groupNodeColor },
            width: groupNodeWidth,
            height: groupNodeHeight,
            position: { x: insightBoxX, y: insightBoxY }
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

        insightBoxes = insightBoxes.concat([
            groupNode,
            ...nodes
        ]);
    })

    groupNodes = groupNodes.concat(insightBoxes);

    // rendering summary of insights
    const groupBounding = getNodesBounding(groupNodes);

    const summaryNodes: Node<any>[] = [];
    const summaryTopicNodes: Node<any>[] = [];

    const summaryTopicWidth = 400;
    const summaryTopicPadding = 50;

    payload.summary.topics.forEach((topic, topicIndex) => {
        const summaryTopicBounding = getNodesBounding(summaryTopicNodes);

        summaryTopicNodes.push(createText({
            id: `topic_${topicIndex}`,
            data: { text: topic.name, size: 24 },
            position: { x: summaryTopicBounding.right + (topicIndex === 0 ? summaryTopicWidth : summaryTopicPadding), y: summaryTopicBounding.top },
            width: summaryTopicWidth - summaryTopicPadding, height: "auto"
        }));
    })

    payload.summary.users.forEach((user, userIndex) => {
        const summaryTopicBounding = getNodesBounding(summaryTopicNodes);

        const summaryUserTitle = createText({
            id: `user_${userIndex}`,
            data: { text: user.name, size: 32 },
            position: { x: summaryTopicBounding.left, y: summaryTopicBounding.bottom + 50 },
            width: summaryTopicWidth, height: "auto"
        })

        Array.from({ length: payload.summary.topics.length }).forEach((_, index) => {
            const commentSummary = user.commentSummary.find(comment => comment.topicKey === payload.summary.topics[index].key);
            const positionX = summaryTopicBounding.left + ((summaryTopicNodes[0].width + summaryTopicPadding) * index) + summaryUserTitle.width;
            const positionY = summaryTopicBounding.bottom + 50;

            if (commentSummary) {
                summaryTopicNodes.push(createStickyNote({
                    data: { text: commentSummary.content || "―", color: colors[userIndex % colors.length], fontSize: stickyNoteFontSize },
                    position: { x: positionX, y: positionY },
                    width: summaryTopicWidth - summaryTopicPadding, height: "auto"
                }));
            } else {
                summaryTopicNodes.push(createStickyNote({
                    data: { text: "", color: colors[userIndex % colors.length], fontSize: stickyNoteFontSize },
                    position: { x: positionX, y: positionY },
                    width: summaryTopicWidth - summaryTopicPadding, height: 120
                }));
            }
        })

        // user.commentSummary.forEach((comment, commentIndex) => {
        //     const topicIndex = payload.summary.topics.findIndex(topic => topic.key === comment.topicKey);
        //     const positionX = summaryTopicBounding.left + ((summaryTopicNodes[0].width + summaryTopicPadding) * topicIndex) + summaryUserTitle.width;
        //     const positionY = summaryTopicBounding.bottom + 50;
        //     summaryTopicNodes.push(createStickyNote({
        //         data: { text: comment.content || "―", color: colors[userIndex % colors.length] },
        //         position: { x: positionX, y: positionY },
        //         width: summaryTopicWidth - summaryTopicPadding, height: "auto"
        //     }));

        // })

        summaryTopicNodes.push(summaryUserTitle)
    })

    // TODOA: fix the issue with group node position

    const summaryTopicBounding = getNodesBounding(summaryTopicNodes);
    const summaryGroupNode = createGroupNode({
        width: summaryTopicBounding.right - summaryTopicBounding.left + 100,
        height: summaryTopicBounding.bottom - summaryTopicBounding.top + 100,
        position: { x: groupBounding.right + 200 + summaryTopicBounding.left, y: summaryTopicBounding.top + 120 }
    });

    // summary group node title
    summaryNodes.push(createText({
        data: { text: "Summary", size: 64 },
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