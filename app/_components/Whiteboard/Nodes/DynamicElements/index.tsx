import React, { memo, useEffect, useRef, useState } from 'react'
import { NodeProps, Handle, Position } from 'reactflow'
import { cn } from '@utils/style'
import { Tables } from 'app/_types/supabase';
import { useExplorer } from '@contexts/explorer'
import { FaPlus } from '@react-icons/all-files/fa/FaPlus';

import { WrappedComponentType } from '@components/Whiteboard/Helpers/NodeWrapper'
import ResizableNode from '@components/Whiteboard/Helpers/Resizer'

import { BlockElement } from './Block';
import { WhiteboardElement } from './Whiteboard';
import { LensElement } from './Lens';

type DynamicElementProps = WrappedComponentType<NodeProps<{
    item_id: Tables<"block">["block_id"] | Tables<"lens">["lens_id"] | Tables<"whiteboard">["whiteboard_id"]
    type: "block" | "lens" | "whiteboard"
}>>


export const defaultValues: DynamicElementProps["data"] = undefined;
export const defaultNodeProps: { height: number; width: number } = {
    height: 200,
    width: 200
}
export const Component = memo(({ data, node, selected, updateNode }: DynamicElementProps) => {
    const $nodeRef = useRef<string>(node.id);
    const { modal, selectedItems } = useExplorer();

    useEffect(() => {
        if (!modal.opened && selectedItems && modal.sourceRef.current === $nodeRef.current) {
            const [item] = selectedItems;
            updateNode({ ...data, item_id: item.selectedItem, type: item.type });
        }
    }, [modal.opened]);

    const openExlorer = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        if (event.shiftKey || event.ctrlKey || event.metaKey) return;

        modal.openWithConfiguration({ multiple: false, sourceRef: $nodeRef });
    }

    return <ResizableNode selected={selected}>
        <div
            style={{
                height: node.height || 200,
                width: node.width || 300
            }}
            className={
                cn("border border-gray-200 rounded-md shadow-sm overflow-hidden bg-white hover:cursor-pointer hover:bg-gray-100 z-50",
                    selected && "border-blue-500" || "")
            }>
            <Handle type="target" position={Position.Left} />

            {data?.type === "block" && <BlockElement node={node} block_id={data.item_id} />}
            {data?.type === "whiteboard" && <WhiteboardElement node={node} whiteboard_id={data.item_id} />}
            {data?.type === "lens" && <LensElement node={node} lens_id={data.item_id} />}
            {!data &&
                <div className="h-full flex">
                    <div className="w-full h-full flex items-center justify-center" onClick={openExlorer} >
                        <FaPlus className="m-auto text-gray-400 hover:text-gray-600" size={32} />
                    </div>
                </div>
            }
            <Handle type="source" position={Position.Right} />
        </div>

    </ResizableNode>
});