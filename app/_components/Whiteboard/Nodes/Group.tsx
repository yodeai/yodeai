import React, { memo } from 'react'
import { NodeProps, Handle, Position } from 'reactflow'
import { WrappedComponentType } from '@components/Whiteboard/Helpers/NodeWrapper'
import ResizableNode from '@components/Whiteboard/Helpers/Resizer'
import { cn } from '@utils/style'
import { Handles } from '../Helpers/Handles'

type GroupNodeProps = WrappedComponentType<NodeProps>;

export type GroupNodeValueType = {
    color?: string
}

export const defaultValues: GroupNodeProps["data"] = {
    color: "#ffd43b"
}
export const defaultNodeProps: { height: number; width: number } = {
    height: 200,
    width: 200
}
export const Component = memo(({ data, node, selected, updateNode }: GroupNodeProps) => {
    const backgroundColor = data?.color || defaultValues.color;
    return <ResizableNode selected={selected}>
        <ColorPicker
            handleColorChange={(color) => updateNode({ color })}
            value={backgroundColor}
            selected={selected}
        />

        <Handles>
            <div
                style={{
                    backgroundColor,
                    opacity: 0.1,
                    height: node.height || 200,
                    width: node.width || 200
                }}
                className="rounded-lg shadow-md border-gray-500 bg-opacity-40"></div>
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
        { value: "#f07576" },
        { value: "#3e83f8" },
        { value: "#55e0b2" },
        { value: "#c37801" },
        { value: "#ffd43b" }
    ]

    return <div className={cn(
        "absolute -top-12 left-0 border border-gray-500 bg-slate-100 rounded-sm flex-row p-2 gap-1 cursor-pointer",
        selected ? "flex" : "hidden"
    )}>
        {colors.map(color =>
            <div key={color.value} onClick={handleColorChange.bind(null, color.value)}
                className={cn("h-5 w-5 rounded-full", color.value === value && "border-2 border-gray-800 outline-2")}
                style={{ backgroundColor: color.value }}></div>)}
    </div>
}
