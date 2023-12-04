import { useState } from 'react';
import { Text, Button } from '@mantine/core';

interface InlineSpoilerProps {
    children: React.ReactNode;
    maxHeight?: number;
}

export default function InlineSpoiler({
    children,
    maxHeight = 20,
}: InlineSpoilerProps) {
    const [expanded, setExpanded] = useState(false);
    const [height, setHeight] = useState(0);

    const measureHeight = (node) => {
        if (node !== null) {
            setHeight(node.scrollHeight);
        }
    };

    const toggleExpand = () => {
        setExpanded(!expanded);
    };

    return (
        <div style={{ position: 'relative' }}>
            <div
                ref={measureHeight}
                style={{
                    maxHeight: expanded ? `${height}px` : `${maxHeight}px`,
                    overflow: 'hidden',
                    transition: 'max-height 0.2s ease-out'
                }}
            >
                {children}
            </div>
            <Button
                display={height > maxHeight ? 'block' : 'none'}
                variant={"white"}
                pl={6}
                pr={6}
                mr={4}
                size="xs"
                style={{
                    position: 'absolute',
                    height: 20,
                    bottom: 0,
                    right: 0
                }}
                onClick={toggleExpand}
            >
                {expanded ? 'Show less' : 'Show more'}
            </Button>
        </div>
    );
}