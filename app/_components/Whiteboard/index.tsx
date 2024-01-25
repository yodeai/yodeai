'use client';

import { uuid } from 'uuidv4';

import { useCallback, useEffect, useState, useRef } from "react";
import { Tables } from "app/_types/supabase"
import ReactFlow, {
    ReactFlowProvider,
    useNodesState, useEdgesState, addEdge,
    Controls, Background, Node, Edge, MiniMap
} from 'reactflow';
import WhiteboardDock from "./Dock";
import ContextMenu from './ContextMenu';

import 'reactflow/dist/style.css';
import { useDebouncedCallback } from "@utils/hooks";
import { ImSpinner8 } from "react-icons/im";
import { Text } from "@mantine/core";
import nodeTypes, { defaultValues } from './Nodes';
import WhiteboardHeader from './Header';
import { useRouter } from 'next/navigation';

type WhiteboardProps = {
    data: Tables<"whiteboard">
}

function Whiteboard({ data }: WhiteboardProps) {
    const [nodes, setNodes, onNodesChange] = useNodesState(data.nodes as any || []);
    const [edges, setEdges, onEdgesChange] = useEdgesState(data.edges as any || []);
    const [reactFlowInstance, setReactFlowInstance] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [menu, setMenu] = useState(null);
    const [whiteboard, setWhiteboard] = useState<Tables<"whiteboard">>(data);
    const $whiteboard = useRef(null);
    const router = useRouter();

    const onConnect = useCallback((params) => {
        setEdges((eds) => addEdge(params, eds))
    }, [setEdges]);

    const onDragOver = useCallback((event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    const onDrop = useCallback((event) => {
        event.preventDefault();
        const type = event.dataTransfer.getData('application/reactflow');
        if (typeof type === 'undefined' || !type) return;

        const position = reactFlowInstance.screenToFlowPosition({
            x: event.clientX,
            y: event.clientY,
        });

        const newNode: Node = {
            id: uuid(),
            type,
            position,
            height: 200,
            width: 200,
            data: defaultValues[type]
        };

        setNodes((nds) => nds.concat(newNode));
    }, [reactFlowInstance]);

    const onNodeContextMenu = useCallback(
        (event, node) => {
            event.preventDefault();

            const pane = $whiteboard.current.getBoundingClientRect();
            setMenu({
                id: node.id,
                top: (event.clientY - pane.top) + 10,
                left: (event.clientX - pane.left) + 10
            });
        },
        [setMenu],
    );

    const syncWhiteboard = useDebouncedCallback(async (nodes: Node[], edges: Edge[]) => {
        setIsSaving(true);
        fetch(`/api/whiteboard/${data.whiteboard_id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nodes, edges })
        })
            .then(res => res.json())
            .catch(err => console.error(err))
            .finally(() => setIsSaving(false));
    }, 1000, [nodes, edges, isSaving]);

    const onChangeWhiteboardName = useCallback((name: string) => {
        setIsSaving(true);
        return fetch(`/api/whiteboard/${data.whiteboard_id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name })
        })
            .then(res => res.json())
            .then(res => {
                if (res.ok) setWhiteboard(wb => ({ ...wb, name }));
                return res;
            })
            .finally(() => {
                setIsSaving(false);
            })
    }, []);

    const onDeleteWhiteboard = useCallback(() => {
        setIsSaving(true);
        return fetch(`/api/whiteboard/${data.whiteboard_id}`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" }
        })
            .then(res => res.json())
            .then(res => {
                if (res.ok) router.replace(`/lens/${data.lens_id}`);
                return res;
            })
    }, []);

    useEffect(() => {
        syncWhiteboard(nodes, edges);
    }, [nodes, edges])

    const onPaneClick = useCallback(() => setMenu(null), [setMenu]);

    return <div className="w-full h-full relative flex flex-col">
        <WhiteboardHeader title={whiteboard.name} onSave={onChangeWhiteboardName} onDelete={onDeleteWhiteboard} />
        {isSaving && <div className="absolute top-[70px] right-5 flex items-center gap-2 border border-gray-400 bg-gray-100 rounded-lg px-2 py-1">
            <ImSpinner8 size={10} className="animate-spin" />
            <Text size="sm" c="gray.7">Auto-save...</Text>
        </div>}
        <ReactFlow
            className="flex-1"
            minZoom={0.5}
            maxZoom={4}
            ref={$whiteboard}
            fitView
            fitViewOptions={{ padding: 0.5 }}
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            onNodeContextMenu={onNodeContextMenu}
            onPaneClick={onPaneClick}
            onInit={setReactFlowInstance}
            onDrop={onDrop}
            onDragOver={onDragOver}>
            <Controls />
            <Background gap={12} size={1} />
            {menu && <ContextMenu onClick={onPaneClick} {...menu} />}
            <MiniMap />
        </ReactFlow>
        <WhiteboardDock />
    </div>
}

export default function WhiteboardContainer(props: WhiteboardProps) {
    return <ReactFlowProvider>
        <Whiteboard {...props} />
    </ReactFlowProvider>

}