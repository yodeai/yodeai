import React, { memo, useState, useRef, useEffect, useCallback } from 'react'
import { NodeProps, Handle, Position } from 'reactflow'
import { WrappedComponentType } from '@components/Whiteboard/Helpers/NodeWrapper'
import ResizableNode from '@components/Whiteboard/Helpers/Resizer'
import { cn } from '@utils/style'
import { FaA } from '@react-icons/all-files/fa6/FaA'
import { Handles } from '@components/Whiteboard/Helpers/Handles'
import { useFlow } from '@components/Whiteboard/Helpers/FlowWrapper'

type StickyNoteProps = WrappedComponentType<NodeProps>

export type TextValueType = {
    text: string;
    size: 8 | 12 | 16 | 20 | 24 | 28 | 32 | 48 | 64
}

export const defaultValues: StickyNoteProps["data"] = {
    text: "Text",
    size: 16

}
export const defaultNodeProps: { height: number; width: number } = {
    height: 40,
    width: 60
}

export const Component = memo(({ data, node, selected, updateNode, updateNodeSelf }: StickyNoteProps) => {
    const [text, setText] = useState(data.text);
    const { isLocked } = useFlow();
    const $inialText = useRef(data.text);

    const handleChange = (event) => {
        setText(event.target.value);
    };

    const handleBlur = useCallback(() => {
        if ($inialText.current === text) return;
        updateNode({ text });
        $inialText.current = text;
    }, [text]);

    return <ResizableNode selected={selected}>
        <TextSizer value={node.data.size} selected={selected} handleTextSizeChange={(size) => updateNode({ size })} />
        <Handles>
            <div className={cn("rounded-lg border border-transparent", !isLocked && "border-gray-200 box-content" || "")}>
                <textarea
                    style={{
                        height: node.height || 50,
                        width: node.width || 100,
                        fontSize: node.data.size,
                        lineHeight: 1.5
                    }}
                    className="border-none m-0 resize-none block w-full bg-transparent"
                    value={text}
                    onChange={handleChange}
                    onBlur={handleBlur}
                />
            </div>
        </Handles>
    </ResizableNode>
});

type TextSizerProps = {
    value: number;
    selected: boolean
    handleTextSizeChange: (value: number) => void
}
export const TextSizer = ({ value, selected, handleTextSizeChange }: TextSizerProps) => {
    const sizes = [
        { value: 8 },
        { value: 12 },
        { value: 16 },
        { value: 20 },
        { value: 24 },
        { value: 28 },
        { value: 32 },
        { value: 48 },
        { value: 64 },
    ];

    return <div className={cn(
        "absolute border -top-[90px] border-gray-500 bg-slate-100 rounded-sm flex-row p-2 gap-1 cursor-pointer",
        selected ? "flex" : "hidden"
    )}>
        {sizes.map(size =>
            <div key={size.value} onClick={handleTextSizeChange.bind(null, size.value)} className="flex items-center rounded-full">
                <FaA className={
                    cn(size.value === value ? "fill-blue-500" : "fill-gray-500")
                } size={size.value} />
            </div>)}
    </div>
}