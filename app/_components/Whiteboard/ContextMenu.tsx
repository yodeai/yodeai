import React, { useCallback } from 'react';
import { useReactFlow } from 'reactflow';

export default function ContextMenu({
    id,
    top,
    left,
    right,
    bottom,
    ...props
}) {
    const { getNode, setNodes, addNodes, setEdges } = useReactFlow();
    const duplicateNode = useCallback(() => {
        const node = getNode(id);
        const position = {
            x: node.position.x + 50,
            y: node.position.y + 50,
        };

        addNodes({ ...node, id: `${node.id}-copy`, position });
    }, [id, getNode, addNodes]);

    const deleteNode = useCallback(() => {
        setNodes((nodes) => nodes.filter((node) => node.id !== id));
        setEdges((edges) => edges.filter((edge) => edge.source !== id));
    }, [id, setNodes, setEdges]);

    return (
        <div style={{ top, left, right, bottom }} className="bg-white border rounded-md shadow-md overflow-hidden absolute z-50 flex flex-col divide-y" {...props}>
            <span className="p-1 cursor-pointer hover:bg-gray-200" onClick={duplicateNode}>Duplicate</span>
            <span className="p-1 cursor-pointer hover:bg-gray-200" onClick={deleteNode}>Delete</span>
        </div>
    );
}
