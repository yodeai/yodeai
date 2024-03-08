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
    const { getEdge, setNodes, setEdges } = useReactFlow();

    const edge = getEdge(id);

    const addLabel = useCallback(() => {
        setEdges((edges) =>
            edges.map((edge) => {
                if (edge.id === id) return { ...edge, label: edge.label?.toString().trim() ? `${edge.label} ` : "Text" };
                return edge;
            })
        );
    }, []);

    const deleteEdge = useCallback(() => {
        const currentEdge = getEdge(id);
        if (!currentEdge) return;
        setEdges((edges) => edges.filter((edge) => edge.id !== id));
    }, [id, setNodes, setEdges]);

    return (
        <div style={{ top, left, right, bottom }} className="bg-white border rounded-md shadow-md overflow-hidden absolute z-50 flex flex-col divide-y" {...props}>
            <span className="p-1 cursor-pointer hover:bg-gray-200" onClick={addLabel}>
                {edge?.label?.toString().trim() ? "Edit" : "Add"} Label
            </span>
            <span className="p-1 cursor-pointer hover:bg-gray-200" onClick={deleteEdge}>Delete</span>
        </div>
    );
}
