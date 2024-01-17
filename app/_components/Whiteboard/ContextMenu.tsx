import React, { useCallback } from 'react';
import { useReactFlow } from 'reactflow';
import { uuid } from 'uuidv4';

export default function ContextMenu({
    id,
    top,
    left,
    right,
    bottom,
    ...props
}) {
    const { getNode, getNodes, setNodes, addNodes, setEdges } = useReactFlow();
    const duplicateNode = useCallback(() => {
        let selectedNodes = getNodes().filter((node) => node.selected);
        const nodesToDuplicate = selectedNodes.length ? selectedNodes : [getNode(id)];

        const minX = Math.min(...selectedNodes.map((node) => node.position.x)) - 50;
        const maxX = Math.max(...selectedNodes.map((node) => node.position.x + node.width)) + 50;

        addNodes(nodesToDuplicate.map((node) => ({
            ...node,
            id: node.type === "group" ? 'group-' + Date.now() : uuid(),
            position: {
                x: node.position.x + (maxX - minX) + 50,
                y: node.position.y
            }
        })))
    }, [id, getNode, addNodes]);

    const deleteNode = useCallback(() => {
        const currentNode = getNode(id);
        const childrenNodeIds = currentNode.type === "group"
            ? getNodes().filter(node => node.parentNode === currentNode.id).map(node => node.id)
            : [];
        setNodes((nodes) =>
            nodes
                .filter(node => node.id !== id)
                .map((node) => {
                    if (childrenNodeIds.includes(node.id)) {
                        return {
                            ...node,
                            parentNode: null
                        };
                    }
                    return node;
                })
        );
        setEdges((edges) => edges.filter((edge) => edge.source !== id));
    }, [id, setNodes, setEdges]);

    return (
        <div style={{ top, left, right, bottom }} className="bg-white border rounded-md shadow-md overflow-hidden absolute z-50 flex flex-col divide-y" {...props}>
            <span className="p-1 cursor-pointer hover:bg-gray-200" onClick={duplicateNode}>Duplicate</span>
            <span className="p-1 cursor-pointer hover:bg-gray-200" onClick={deleteNode}>Delete</span>
        </div>
    );
}
