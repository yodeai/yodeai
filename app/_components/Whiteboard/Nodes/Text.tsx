import React, { memo, useState, useRef } from 'react'
import { WrappedComponentType } from '@components/Whiteboard/NodeWrapper'
import ResizableNode from '@components/Whiteboard/Resizer'
import { NodeProps } from 'reactflow'
import { cn } from '@utils/style'
import { FaA } from 'react-icons/fa6'

type StickyNoteProps = WrappedComponentType<NodeProps>

export const defaultValues: StickyNoteProps["data"] = {
    text: "Text",
    size: 16

}
export const defaultNodeProps: { height: number; width: number } = {
    height: 40,
    width: 60
}

export const Component = memo(({ data, node, selected, updateNode }: StickyNoteProps) => {
    const [text, setText] = useState(data.text);
    const $textarea = useRef(null);

    const handleChange = (event) => {
        setText(event.target.value);
    };

    const handleBlur = () => {
        updateNode({ text });
    };
    return <ResizableNode selected={selected}>
        <TextSizer value={node.data.size} selected={selected} handleTextSizeChange={(size) => updateNode({ size })} />
        <div className="rounded-lg">
            <textarea
                style={{
                    height: node.height || 50,
                    width: node.width || 100,
                    fontSize: node.data.size
                }}
                ref={$textarea}
                className="border-none m-0 resize-none block w-full bg-transparent"
                value={text}
                onChange={handleChange}
                onBlur={handleBlur}
            />
        </div>
    </ResizableNode>
});

type TextSizerProps = {
    value: number;
    selected: boolean
    handleTextSizeChange: (value: number) => void
}
export const TextSizer = ({ value, selected, handleTextSizeChange }: TextSizerProps) => {
    const sizes = [
        { value: 12 },
        { value: 16 },
        { value: 20 },
        { value: 24 },
        { value: 28 },
        { value: 32 }
    ]

    return <div className={cn(
        "absolute -top-16 border border-gray-500 bg-slate-100 rounded-sm flex-row p-2 gap-1 cursor-pointer",
        selected ? "flex" : "hidden"
    )}>
        {sizes.map(size =>
            <div onClick={handleTextSizeChange.bind(null, size.value)} className="flex items-center rounded-full">
                <FaA className={
                    cn(size.value === value ? "fill-blue-500" : "fill-gray-500")
                } size={size.value} />
            </div>)}
    </div>
}