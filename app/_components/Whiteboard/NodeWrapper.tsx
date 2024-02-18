import React from 'react';
import { useReactFlow, useNodeId, Node } from 'reactflow';

type WithNodeControllerProps = {
    node: Node;
    updateNode: (payload) => void;
};

export type WrappedComponentType<P> = P & WithNodeControllerProps;

export const withNodeController = <P extends object>(Component: React.ComponentType<WrappedComponentType<P>>) => {
    type Props = P;

    const EnhancedComponent: React.FC<Props> = (props) => {
        const reactFlow = useReactFlow();
        const nodeId = useNodeId();
        const node = reactFlow.getNode(nodeId);

        const updateNode = (payload) => {
            const node = reactFlow.getNode(nodeId);
            if (!node) return;

            reactFlow.setNodes((nodes) => {
                const nodeIndex = nodes.findIndex((n) => n.id === nodeId);
                const newNode = { ...nodes[nodeIndex], data: { ...nodes[nodeIndex].data, ...payload } };
                nodes[nodeIndex] = newNode;
                return nodes;
            })

            // console.log(storeApi.getState().nodeInternals.get(nodeId))

        };

        return <Component {...props} node={node} updateNode={updateNode} />;
    };

    return EnhancedComponent;
};
