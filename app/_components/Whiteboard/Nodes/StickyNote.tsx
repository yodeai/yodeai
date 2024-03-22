import React, { useState, useRef, memo, useEffect, useCallback } from 'react'
import { NodeProps } from 'reactflow'
import { WrappedComponentType } from '@components/Whiteboard/Helpers/NodeWrapper'
import ResizableNode from '@components/Whiteboard/Helpers/Resizer'
import { cn } from '@utils/style'
import { Handles } from '@components/Whiteboard/Helpers/Handles'

type StickyNoteProps = WrappedComponentType<NodeProps>

export type StickyNoteValueType = {
    text: string
    color: string
    fontSize: number;
}

export const defaultValues: StickyNoteProps["data"] = {
    text: "Sticky Note",
    color: "#ffd43b",
    fontSize: 9
}

export const defaultNodeProps: {
    height: number; width: number,
    style?: {
        lineHeight: number
        fontSize: number
    }
} = {
    height: 200,
    width: 200,
    style: {
        lineHeight: 1.5,
        fontSize: 9
    }
}

export const Component = memo(({ data, node, selected, updateNode, updateNodeSelf }: StickyNoteProps) => {
    const [text, setText] = useState(data.text);
    const $textarea = useRef(null);
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
        <Handles>
            <ColorPicker
                handleColorChange={(color) => updateNode({ color })}
                value={node.data.color}
                selected={selected}
            />
            <div className="shadow-md rounded-md"
                style={{
                    backgroundColor: node.data.color,
                    opacity: text.length === 0 ? 0.25 : 1
                }}>
                <textarea
                    style={{
                        backgroundColor: "transparent",
                        height: node.height || defaultNodeProps.height,
                        width: node.width || defaultNodeProps.width,
                        fontSize: node.data.fontSize || defaultNodeProps.style.fontSize,
                        lineHeight: defaultNodeProps.style.lineHeight,
                        hyphens: "auto"
                    }}
                    ref={$textarea}
                    className="border-none m-0 resize-none block w-full"
                    value={text}
                    onChange={handleChange}
                    onBlur={handleBlur}
                />
            </div>
        </Handles>
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
        { value: "#f07576" },
        { value: "#55e0b2" }
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
