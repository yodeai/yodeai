import { FaLayerGroup, FaStickyNote } from "react-icons/fa";
import { FaA, FaFile } from "react-icons/fa6";
import { Tooltip } from "@mantine/core";
import React from 'react';
import { useReactFlow, useNodeId, Node } from 'reactflow';

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

    return <aside className="absolute bottom-3 left-[50%] -translate-x-[50%] min-w-min border border-gray-400 bg-slate-100 flex flex-row rounded-lg px-2 py-3">
        <Tooltip label="Sticky Note" position="top">
            <div className="default p-3 rounded-full flex items-center cursor-pointer"
                onDragStart={(event) => onDragStart(event, 'stickyNote')} draggable>
                <FaStickyNote color="#ffd43b" size={24} />
            </div>
        </Tooltip>
        <Tooltip label="Element" position="top">
            <div className="default p-3 rounded-full flex items-center cursor-pointer"
                onDragStart={(event) => onDragStart(event, 'dynamicElement')} draggable>
                <FaFile color="#aaa" size={24} />
            </div>
        </Tooltip>
        <Tooltip label="Text" position="top">
            <div className="default p-3 rounded-full flex items-center cursor-pointer"
                onDragStart={(event) => onDragStart(event, 'text')} draggable>
                <FaA color="#aaa" size={24} />
            </div>
        </Tooltip>
        <Tooltip label="Group" position="top">
            <div className="default p-3 rounded-full flex items-center cursor-pointer"
                onClick={handleNodeGroup}>
                <FaLayerGroup color="#aaa" size={24} />
            </div>
        </Tooltip>
    </aside>
}