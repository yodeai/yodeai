'use client';

import { v4 as uuidv4 } from 'uuid';
import { useCallback, useEffect, useState, useRef, useMemo } from "react";
import ReactFlow, {
    ReactFlowProvider,
    useNodesState, useEdgesState, addEdge,
    Controls, Background, Node, Edge, MiniMap
} from 'reactflow';
import WhiteboardDock from "./Helpers/Dock";
import NodeContextMenu from './Helpers/ContextMenu/Node';
import EdgeContextMenu from './Helpers/ContextMenu/Edge';

import 'reactflow/dist/style.css';
import { useDebouncedCallback } from "@utils/hooks";
import { Text } from "@mantine/core";
import { ImSpinner8 } from "@react-icons/all-files/im/ImSpinner8";
import nodeTypes, { defaultValues, defaultNodeProps } from './Nodes';
import edgeTypes from './Edges';
import { useRouter } from 'next/navigation';
import { WhiteboardComponentProps } from 'app/_types/whiteboard';
import whiteboardPluginRenderers from '@components/Whiteboard/Plugins'
import { useAppContext } from '@contexts/context';
import { FlowWrapper } from './Helpers/FlowWrapper';
import { PageHeader } from '@components/Layout/PageHeader';
import load from '@lib/load';
import { modals } from '@mantine/modals';
import { PageContent } from '@components/Layout/Content';

const getWhiteboardNodes = (whiteboard: WhiteboardComponentProps["data"]) => {
    if (!whiteboard?.plugin || whiteboard?.plugin?.rendered) return whiteboard.nodes as any || [];
    if (!whiteboardPluginRenderers[whiteboard.plugin.name]) return whiteboard.nodes as any || [];
    return whiteboardPluginRenderers[whiteboard.plugin.name]
        .render(whiteboard.nodes as any)
}

function Whiteboard({ data }: WhiteboardComponentProps) {
    const [nodes, setNodes, onNodesChange] = useNodesState(getWhiteboardNodes(data));
    const [edges, setEdges, onEdgesChange] = useEdgesState(data.edges as any || []);
    const [reactFlowInstance, setReactFlowInstance] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [nodeMenu, setNodeMenu] = useState(null);
    const [edgeMenu, setEdgeMenu] = useState(null);
    const [whiteboard, setWhiteboard] = useState(data);
    const [isEditing, setIsEditing] = useState(false);

    const { setLensId, setBreadcrumbActivePage, layoutRefs } = useAppContext();

    const getInitialLockState = () => {
        if (data.plugin) return true;
        if (["owner", "editor"].includes(data.accessType) === false) return true;
        return false;
    }
    const canBeUnlocked = useMemo(() => {
        if (["owner", "editor"].includes(data.accessType)) return true;
        return false;
    }, [data.accessType]);
    const [isLocked, setIsLocked] = useState(getInitialLockState());

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
            id: uuidv4(),
            type,
            position,
            height: defaultNodeProps[type].height || 200,
            width: defaultNodeProps[type].width || 200,
            data: defaultValues[type]
        };

        setNodes((nds) => nds.concat(newNode));
    }, [reactFlowInstance]);

    const onNodeContextMenu = useCallback(
        (event, node) => {
            event.preventDefault();

            const pane = $whiteboard.current.getBoundingClientRect();
            setNodeMenu({
                id: node.id,
                top: (event.clientY - pane.top) + 10,
                left: (event.clientX - pane.left) + 10
            });
        },
        [setNodeMenu],
    );

    const onEdgeContextMenu = useCallback(
        (event, edge) => {
            event.preventDefault();

            const pane = $whiteboard.current.getBoundingClientRect();
            setEdgeMenu({
                id: edge.id,
                top: (event.clientY - pane.top) + 10,
                left: (event.clientX - pane.left) + 10
            });
        },
        [setEdgeMenu],
    );

    const syncWhiteboard = useDebouncedCallback(async (nodes: Node[], edges: Edge[]) => {
        setIsSaving(true);
        fetch(`/api/whiteboard/${data.whiteboard_id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                nodes, edges, plugin: data.plugin ? { ...data.plugin as any, rendered: true } : null
            })
        })
            .then(res => res.json())
            .catch(err => console.error(err))
            .finally(() => setIsSaving(false));
    }, 1000, [nodes, edges, isSaving]);

    const onChangeWhiteboardName = useCallback((name: string) => {
        const savePromise = fetch(`/api/whiteboard/${data.whiteboard_id}`, {
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
                setIsEditing(false);
            })

        load(savePromise, {
            loading: "Saving title...",
            success: "Saved title.",
            error: "Failed to save title."
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

    const openDeleteModal = () => modals.openConfirmModal({
        title: 'Confirm whiteboard deletion',
        centered: true,
        confirmProps: { color: 'red' },
        children: (
            <Text size="sm">
                Are you sure you want to delete this whiteboard? This action cannot be undone.
            </Text>
        ),
        labels: { confirm: 'Delete whiteboard', cancel: "Cancel" },
        onCancel: () => console.log('Canceled deletion'),
        onConfirm: onDeleteWhiteboard
    });

    useEffect(() => {
        if (isLocked && (data.plugin ? data.plugin?.rendered === true : true)) return;
        syncWhiteboard(nodes, edges);
    }, [nodes, edges]);

    useEffect(() => {
        setLensId(whiteboard.lens_id.toString());
        setBreadcrumbActivePage({
            title: whiteboard.name,
            href: `/whiteboard/${whiteboard.whiteboard_id}`
        })

        return () => {
            setBreadcrumbActivePage(null);
        }
    }, [whiteboard.lens_id])

    const onPaneClick = useCallback(() => {
        setEdgeMenu(null);
        setNodeMenu(null);
    }, [setEdgeMenu, setNodeMenu]);

    useEffect(() => {
        const mainHeight = layoutRefs.main.current.getBoundingClientRect().height;
        $whiteboard.current.style.height = `${mainHeight - 180}px`;
    }, [])

    const headerActions = useMemo(() => {
        return <>
            {isSaving && <div className="flex items-center gap-2 px-2 py-1">
                <ImSpinner8 size={10} className="animate-spin" />
                <Text size="sm" c="gray.7">Auto-save...</Text>
            </div>}
        </>
    }, [isSaving])

    const headerDropdownItems = useMemo(() => {
        return [
            {
                label: "Rename",
                onClick: () => setIsEditing(true),
                disabled: !["owner", "editor"].includes(data.accessType)
            },
            {
                label: "Delete",
                onClick: openDeleteModal,
                disabled: !["owner", "editor"].includes(data.accessType),
                color: "red"
            }
        ]
    }, [isEditing])

    return <FlowWrapper
        whiteboard={whiteboard}
        isSaving={isSaving}
        isLocked={isLocked}>
        <PageHeader
            title={whiteboard.name}
            editMode={isEditing}
            onSaveTitle={onChangeWhiteboardName}
            dropdownItems={headerDropdownItems}
            actions={headerActions}
        />
        <PageContent>
            <ReactFlow
                nodesDraggable={!isLocked}
                nodesConnectable={!isLocked}
                elementsSelectable={!isLocked}
                minZoom={0.05}
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
                edgeTypes={edgeTypes}
                onNodeContextMenu={onNodeContextMenu}
                onEdgeContextMenu={onEdgeContextMenu}
                onPaneClick={onPaneClick}
                onInit={setReactFlowInstance}
                onDrop={onDrop}
                onDragOver={onDragOver}>
                <Controls onInteractiveChange={() => setIsLocked(!isLocked)} showInteractive={canBeUnlocked} />
                <Background gap={12} size={1} />
                {nodeMenu && <NodeContextMenu onClick={onPaneClick} {...nodeMenu} />}
                {edgeMenu && <EdgeContextMenu onClick={onPaneClick} {...edgeMenu} />}
                <MiniMap />
            </ReactFlow>
            {!isLocked && <WhiteboardDock />}
        </PageContent>
    </FlowWrapper>
}

export default function WhiteboardContainer(props: WhiteboardComponentProps) {
    return <ReactFlowProvider>
        <Whiteboard {...props} />
    </ReactFlowProvider>

}