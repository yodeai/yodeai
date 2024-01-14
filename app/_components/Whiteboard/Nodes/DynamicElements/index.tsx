import React, { memo, useEffect, useRef, useState } from 'react'
import { WrappedComponentType } from '../../NodeWrapper'
import { NodeProps, Handle, Position } from 'reactflow'
import { cn } from '@utils/style'
import { Tables } from 'app/_types/supabase';
import { useExplorer } from '@contexts/explorer'
import { FaPlus } from 'react-icons/fa';

import { BlockElement } from './Block';
import { WhiteboardElement } from './Whiteboard';
import { LensElement } from './Lens';

type DynamicElementProps = WrappedComponentType<NodeProps<{
    item_id: Tables<"block">["block_id"] | Tables<"lens">["lens_id"] | Tables<"whiteboard">["whiteboard_id"]
    type: "block" | "lens" | "whiteboard"
}>>

export const defaultValues: DynamicElementProps["data"] = undefined;
export const Component = memo(({ data, node, selected, updateNode }: DynamicElementProps) => {
    const $nodeRef = useRef<string>(node.id);
    const { modal, selectedItems } = useExplorer();

    useEffect(() => {
        if (!modal.opened && selectedItems && modal.sourceRef.current === $nodeRef.current) {
            const [item] = selectedItems;
            updateNode({ ...data, item_id: item.selectedItem, type: item.type });
        }
    }, [modal.opened]);

    const openExlorer = () => modal.openWithConfiguration({ multiple: false, sourceRef: $nodeRef });

    return <div className={
        cn("border border-gray-200 rounded-md shadow-sm overflow-hidden bg-white hover:cursor-pointer hover:bg-gray-100",
            selected && "border-blue-500" || "")
    }>
        <Handle type="target" position={Position.Left} />

        {data?.type === "block" && <BlockElement block_id={data.item_id} />}
        {data?.type === "whiteboard" && <WhiteboardElement whiteboard_id={data.item_id} />}
        {data?.type === "lens" && <LensElement lens_id={data.item_id} />}
        {!data &&
            <div className="h-48 w-64 flex">
                <div className="w-full h-full flex items-center justify-center" onClick={openExlorer} >
                    <FaPlus className="m-auto text-gray-400 hover:text-gray-600" size={32} />
                </div>
            </div>
        }
        <Handle type="source" position={Position.Right} />
    </div>
});