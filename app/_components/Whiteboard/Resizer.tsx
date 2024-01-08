import { memo } from 'react';
import { Handle, Position, NodeResizer } from 'reactflow';

const ResizableNodeSelected = ({ children, selected }) => {
    return (
        <>
            <NodeResizer color="#ff0071" isVisible={selected} minWidth={100} minHeight={30} />
            {children}
        </>
    );
};

export default memo(ResizableNodeSelected);
