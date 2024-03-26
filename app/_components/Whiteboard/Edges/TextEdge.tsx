import { Input, Text } from '@mantine/core';
import { useClickOutside } from '@mantine/hooks';
import React, { useEffect, useRef, useState } from 'react';

import {
    BaseEdge,
    EdgeLabelRenderer,
    EdgeProps,
    getBezierPath,
    useReactFlow,
} from 'reactflow';

export default function CustomEdge({
    id,
    data,
    label,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    style = {},
    markerEnd,
}: EdgeProps) {
    const { setEdges } = useReactFlow();

    const [edgePath, labelX, labelY] = getBezierPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
    });

    const $input = useRef<HTMLInputElement>();
    const $label = useRef(label);

    const [isEditing, setIsEditing] = useState(false);

    const onChangeText = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        setEdges((edges) =>
            edges.map((edge) => {
                if (edge.id === id) return { ...edge, label: value || " " };
                return edge;
            })
        );
    }

    const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Escape") {
            setIsEditing(false);
            return;
        }
        if (event.key === 'Enter') setIsEditing(false);
    }

    useEffect(() => {
        if ($label.current === label) return;
        setIsEditing(Boolean(label));
    }, [label]);

    useEffect(() => {
        if (isEditing) {
            $input.current.focus();
            $input.current?.setSelectionRange(0, $input.current.value.length);
        }
    }, [isEditing]);


    const onClickText = () => {
        setIsEditing(true);
    }

    return (
        <>
            <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />
            <EdgeLabelRenderer>
                <div
                    className="rounded-md"
                    style={{
                        position: 'absolute',
                        pointerEvents: 'all',
                        transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
                        zIndex: 9999
                    }}>
                    {isEditing
                        ? <Input className="bg-transparent"
                            classNames={{
                                wrapper: 'bg-transparent',
                                input: 'bg-transparent text-center'
                            }}
                            ref={$input} unstyled value={label.toString()} onKeyDown={onKeyDown} onChange={onChangeText} />
                        : label && <Text onClick={onClickText} classNames={{ root: '!py-1 !px-1', }}> {label.toString().trim()}</Text>}
                </div>
            </EdgeLabelRenderer>
        </>
    );
}
