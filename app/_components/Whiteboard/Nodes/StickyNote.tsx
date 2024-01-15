import React, { useState, useRef, memo } from 'react'
import { WrappedComponentType } from '../NodeWrapper'
import ResizableNode from '../Resizer'
import { Node, NodeProps } from 'reactflow'
import { cn } from '@utils/style'

type StickyNoteProps = WrappedComponentType<NodeProps>

export const defaultValues: StickyNoteProps["data"] = {
    text: "Sticky Note",
    color: "#ffd43b"
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
        <div className="border border-gray-200 rounded-md shadow-sm overflow-hidden">
            <textarea
                style={{
                    backgroundColor: node.data.color,
                    height: node.height || 200,
                    width: node.width || 200
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
        { value: "#f05152" },
        { value: "#3e83f8" },
        { value: "#0c9f6e" },
        { value: "#c37801" },
        { value: "#ffd43b" }
    ]

    return <div className={cn(
        "absolute -top-12 border border-gray-500 bg-slate-100 rounded-sm flex-row p-2 gap-1 cursor-pointer",
        selected ? "flex" : "hidden"
    )}>
        {colors.map(color =>
            <div onClick={handleColorChange.bind(null, color.value)}
                className={cn("h-5 w-5 rounded-full", color.value === value && "border-2 border-gray-800 outline-2")}
                style={{ backgroundColor: color.value }}></div>)}
    </div>
}
