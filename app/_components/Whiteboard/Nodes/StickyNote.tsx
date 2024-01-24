import React, { useState, useRef, memo } from 'react'
import { WrappedComponentType } from '@components/Whiteboard/NodeWrapper'
import ResizableNode from '@components/Whiteboard/Resizer'
import { NodeProps } from 'reactflow'
import { cn } from '@utils/style'

type StickyNoteProps = WrappedComponentType<NodeProps>

export type StickyNoteValueType = {
    text: string
    color: string
}

export const defaultValues: StickyNoteProps["data"] = {
    text: "Sticky Note",
    color: "#ffd43b"
}

export const defaultNodeProps: { height: number; width: number } = {
    height: 200,
    width: 200
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
        <ColorPicker
            handleColorChange={(color) => updateNode({ color })}
            value={node.data.color}
            selected={selected}
        />
        <div className="shadow-md rounded-md"
            style={{
                backgroundColor: node.data.color,
            }}>
            <textarea
                style={{
                    backgroundColor: "transparent",
                    height: node.height || 200,
                    width: node.width || 200,
                    fontSize: 9
                }}
                ref={$textarea}
                className="border-none m-0 resize-none block w-full"
                value={text}
                onChange={handleChange}
                onBlur={handleBlur}
            />
        </div>
    </ResizableNode>
});

type ColorPickerProps = {
    value: string
    selected: boolean
    handleColorChange: (value: string) => void
}
export const ColorPicker = ({ value, selected, handleColorChange }: ColorPickerProps) => {
    const colors = [
        { value: "#ffd43b" },
        { value: "#80caff" },
        { value: "#d9b8ff" },
        { value: "#f05152" },
        { value: "#0c9f6e"}
    ]

    return <div className={cn(
        "absolute -top-12 border border-gray-500 bg-slate-100 rounded-sm flex-row p-2 gap-1 cursor-pointer",
        selected ? "flex" : "hidden"
    )}>
        {colors.map(color =>
            <div key={color.value} onClick={handleColorChange.bind(null, color.value)}
                className={cn("h-5 w-5 rounded-full", color.value === value && "border-2 border-gray-800 outline-2")}
                style={{ backgroundColor: color.value }}></div>)}
    </div>
}
