import React from 'react';
import { useReactFlow, Node } from 'reactflow';

import { Tooltip } from "@mantine/core";

import { FaLayerGroup } from "@react-icons/all-files/fa/FaLayerGroup";
import { FaStickyNote } from "@react-icons/all-files/fa/FaStickyNote";
import { FaA } from "@react-icons/all-files/fa6/FaA";
import { FaFile } from "@react-icons/all-files/fa6/FaFile";


export default function WhiteboardDock() {
    const reactFlow = useReactFlow();

    const onDragStart = (event, nodeType) => {
        event.dataTransfer.setData('application/reactflow', nodeType);
        event.dataTransfer.effectAllowed = 'move';
    };

    const handleNodeGroup = () => {
        const selectedNodes = reactFlow.getNodes().filter((node) => node.selected);
        const selectedNodeIds = selectedNodes.map((node) => node.id);

        const minX = Math.min(...selectedNodes.map((node) => node.position.x)) - 50;
        const minY = Math.min(...selectedNodes.map((node) => node.position.y)) - 50;
        const maxX = Math.max(...selectedNodes.map((node) => node.position.x + node.width)) + 50;
        const maxY = Math.max(...selectedNodes.map((node) => node.position.y + node.height)) + 50;

        const newGroupNode: Node = {
            id: 'group-' + Date.now(),
            type: 'group',
            position: {
                x: minX,
                y: minY,
            },
            data: { label: 'Group' },
            style: {
                width: maxX - minX,
                height: maxY - minY,
                padding: 0,
                borderColor: '#ddd',
            },
        }

        reactFlow.setNodes((nodes) => [
            newGroupNode,
            ...nodes.map(node => {
                if (selectedNodeIds.includes(node.id)) {
                    return {
                        ...node,
                        parentNode: newGroupNode.id,
                        extent: "parent",
                        position: {
                            x: node.position.x - minX,
                            y: node.position.y - minY,
                        },
                    } as Node;
                }
                return node;
            }),
        ]);
    }

    return <aside className="absolute bottom-[75px] left-[50%] -translate-x-[50%] min-w-min overflow-hidden border border-gray-300 bg-white divide-gray-300 divide-x flex flex-row rounded-lg">
        <Tooltip label="Sticky Note" position="top">
            <div>
                <div className="default p-5 flex items-center cursor-pointer hover:bg-gray-100"
                    onDragStart={(event) => onDragStart(event, 'stickyNote')} draggable>
                    <FaStickyNote color="#ffd43b" size={24} />
                </div>
            </div>
        </Tooltip>
        <Tooltip label="Element" position="top">
            <div>
                <div className="default p-5 flex items-center cursor-pointer hover:bg-gray-100"
                    onDragStart={(event) => onDragStart(event, 'dynamicElement')} draggable>
                    <FaFile color="#333" size={24} />
                </div>
            </div>
        </Tooltip>
        <Tooltip label="Text" position="top">
            <div>
                <div className="default p-5 flex items-center cursor-pointer hover:bg-gray-100"
                    onDragStart={(event) => onDragStart(event, 'text')} draggable>
                    <FaA color="#333" size={24} />
                </div>
            </div>
        </Tooltip>
        <Tooltip label="Group" position="top">
            <div>
                <div className="default p-5 flex items-center cursor-pointer hover:bg-gray-100"
                    onClick={handleNodeGroup}>
                    <FaLayerGroup color="#333" size={24} />
                </div>
            </div>
        </Tooltip>
    </aside>
}