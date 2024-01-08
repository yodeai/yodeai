import React, { memo } from 'react'
import { WrappedComponentType } from '../NodeWrapper'
import { NodeProps, useStore, Handle, Position } from 'reactflow'
import { FaFile } from 'react-icons/fa6'
import { Box, Text, Title } from '@mantine/core'
import { cn } from '@utils/style'

type BlockProps = WrappedComponentType<NodeProps>

export const defaultValues: BlockProps["data"] = {
    block_id: 0,
    title: "Title of the block",
    content: "This is a block component. It is a representation of the preview of a block. This block node can be connected to other block nodes.",
}
export const Component = memo(({ data, node, selected, updateNode }: BlockProps) => {
    const showContent = useStore(s => s.transform[2] >= 2);

    return <div className="border border-gray-200 rounded-md shadow-sm overflow-hidden bg-white hover:cursor-pointer hover:bg-gray-100">
        <Handle type="target" position={Position.Left} />
        <div className={cn("h-24 w-32 flex p-3", !showContent && "justify-center items-center" || "")}>
            {showContent && <Box p={0} m={0}>
                <Title className="p-0 m-0" size="12px" order={6}>{defaultValues.title}</Title>
                <Text size="8px">{defaultValues.content}</Text>
            </Box>}
            {!showContent &&
                <FaFile size={36} className="text-gray-400" />
            }
        </div>
        <Handle type="source" position={Position.Right} />
    </div>
});