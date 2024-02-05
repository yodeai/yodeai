import { WhiteboardPlugins } from "app/_types/whiteboard"
import { Node } from "reactflow"
import { createText, createStickyNote, createGroupNode } from './utils/renderer';
import { calculateStickyNoteBoxHeight, getNodesBounding } from "./utils";

export const render = (payload: WhiteboardPlugins["competitive-analysis"]): Node<any>[] => {
    let nodes: Node<any>[] = [];

    // Summary
    let summaryBoxNodes: Node<any>[] = [];
    const colors = ["#ffd43b", "#80caff", "#d9b8ff", "#f07576", "#55e0b2"];

    nodes.push(createText({
        data: { text: "Companies", size: 32 },
        position: { x: 0, y: 0, }, width: 360, height: 60
    }));


    let summaryBoxBounding = getNodesBounding(summaryBoxNodes);
    const companyInfoTitle = createText({
        data: { text: "Company Info", size: 24 },
        position: { x: 0, y: summaryBoxBounding.bottom + 10 }, width: 250, height: 60
    })
    const companySummaryTitle = createText({
        data: { text: "Summary", size: 24 },
        position: {
            x: companyInfoTitle.position.x + companyInfoTitle.width,
            y: summaryBoxBounding.bottom + 10
        }, width: 300, height: 60
    });

    summaryBoxNodes.push(companyInfoTitle, companySummaryTitle);

    // company summary
    payload.forEach((company, index) => {
        summaryBoxBounding = getNodesBounding(summaryBoxNodes);
        summaryBoxNodes.push(
            createText({
                data: { text: "" + (index + 1), size: 16 },
                position: {
                    x: 0,
                    y: summaryBoxBounding.bottom + 10,
                }, width: 50, height: 60
            }),
            createText({
                data: { text: company.company_url, size: 16 },
                position: {
                    x: 0,
                    y: summaryBoxBounding.bottom + 50,
                }, width: 250, height: 60
            }),
            createText({
                data: { text: company.company, size: 20 },
                position: {
                    x: 50,
                    y: summaryBoxBounding.bottom + 10,
                }, width: 360, height: 60
            }),
            createText({
                data: { text: company.data[0].content, size: 16 },
                position: {
                    x: companySummaryTitle.position.x,
                    y: summaryBoxBounding.bottom + 10,
                }, width: 660, height: "auto"
            })
        )
    })

    summaryBoxBounding = getNodesBounding(summaryBoxNodes);
    let companyGroup = createGroupNode({
        position: { x: 0, y: 70 },
        width: summaryBoxBounding.right - summaryBoxBounding.left + 60,
        height: summaryBoxBounding.bottom - summaryBoxBounding.top + 60,
    });

    let analysisNodes: Node<any>[] = [];

    analysisNodes.push(createText({
        data: { text: "Analysis", size: 32 },
        position: { x: summaryBoxBounding.right + 200, y: 0, }, width: 500, height: 60
    }));

    payload.forEach((company, index) => {
        let companyColor = colors[index % colors.length];
        let companyNodes: Node<any>[] = [];

        // appending user info
        let companyTitleAndSources = [
            createText({
                data: { text: company.company, size: 24 },
                position: {
                    x: 0,
                    y: 0,
                }, width: 200, height: 60
            }),
            createText({
                data: { text: company.company_url, size: 16 },
                position: {
                    x: 0,
                    y: 70,
                }, width: 250, height: 60
            })
        ];

        let companyNodesBounding = getNodesBounding(analysisNodes);

        const analysisGroup = createGroupNode({
            id: `analysis_group_${index}`,
            data: { color: companyColor },
            position: {
                x: summaryBoxBounding.right + 200,
                y: companyNodesBounding.bottom - 20
            },
            width: 300,
            height: 280
        });

        companyNodes.push(
            analysisGroup,
            ...companyTitleAndSources.map(node => ({
                ...node,
                extent: "parent" as Node["extent"],
                parentNode: analysisGroup.id,
                position: {
                    x: node.position.x + 30,
                    y: node.position.y + 30
                }

            }))
        );

        companyNodesBounding = getNodesBounding(analysisNodes);
        
        // appending analysis content
        let companyContentNodes: Node<any>[] = [];
        company.data.slice(1).forEach((content, index) => {
            const stickyNoteBoxHeight = calculateStickyNoteBoxHeight(content.content, 150);
            companyContentNodes.push(
                createText({
                    data: { text: content.title, size: 12 },
                    position: {
                        x: (200 * index),
                        y: 0,
                    }, width: 150, height: 40
                }),
                createStickyNote({
                    data: { text: content.content, color: companyColor },
                    position: {
                        x: (200 * index),
                        y: 50,
                    }, width: 150, height: stickyNoteBoxHeight
                })
            )
        });

        const companyContentNodesBounding = getNodesBounding(companyContentNodes);
        const companyContentGroup = createGroupNode({
            data: { color: companyColor },
            position: {
                x: summaryBoxBounding.right + 200 + analysisGroup.width,
                y: companyNodesBounding.bottom
            },
            width: companyContentNodesBounding.right - companyContentNodesBounding.left + 80,
            height: companyContentNodesBounding.bottom - companyContentNodesBounding.top + 80,
        });

        companyNodes = companyNodes.map(node => node.id !== `analysis_group_${index}` ? node : {
            ...node,
            height: companyContentGroup.height,
            position: {
                ...node.position,
                y: node.position.y + 20,
            },
            style: {
                ...node.style,
                height: companyContentGroup.height
            }
        });

        companyNodes.push(
            companyContentGroup,
            ...companyContentNodes.map(node => ({
                ...node,
                extent: "parent" as Node["extent"],
                parentNode: companyContentGroup.id,
                position: {
                    x: node.position.x + 30,
                    y: node.position.y + 30
                }

            }))
        );

        analysisNodes.push(...companyNodes);
    })


    nodes.push(
        ...summaryBoxNodes.map(node => ({
            ...node,
            extent: "parent" as Node["extent"],
            parentNode: companyGroup.id,
            position: {
                x: node.position.x + 30,
                y: node.position.y + 30
            }
        })),
        ...analysisNodes,
        companyGroup);

    return nodes;
}