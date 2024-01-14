import { memo } from 'react';
import { Handle, Position, NodeResizer } from 'reactflow';

const ResizableNodeSelected = ({ children, selected }) => {
    return (
        <>
            <NodeResizer color="#3e83f8" isVisible={selected} minWidth={100} minHeight={30} />
            {children}
        </>
    );
};

export default memo(ResizableNodeSelected);
