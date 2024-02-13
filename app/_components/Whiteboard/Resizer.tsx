import { memo } from 'react';
import { Handle, Position, NodeResizer } from 'reactflow';

const ResizableNodeSelected = ({ children, selected }) => {
    return (
        <>
            <NodeResizer
                color="#3e83f8"
                isVisible={selected}
                minWidth={10}
                minHeight={20}
                lineStyle={{
                    padding: 12,
                    borderColor: "red",
                    borderWidth: 0
                }}
                handleStyle={{
                    width: 6,
                    height: 6,
                    borderRadius: 10,
                    backgroundColor: '#3e83f8',
                }}
            />
            {children}
        </>
    );
};

export default memo(ResizableNodeSelected);
