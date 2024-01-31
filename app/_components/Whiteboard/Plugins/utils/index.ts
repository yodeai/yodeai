import { Node } from "reactflow";

type GetBoundingProps = {}
const defaultGetBoundingProps: GetBoundingProps = {}

export const getNodesBounding = (
    nodes: Node[], props: GetBoundingProps = defaultGetBoundingProps
) => {
    return {
        top: Math.min(0, ...nodes.map((node) => node.position.y)),
        left: Math.min(0, ...nodes.map((node) => node.position.x)),
        right: Math.max(0, ...nodes.map((node) => node.position.x + node.width)),
        bottom: Math.max(0, ...nodes.map((node) => node.position.y + node.height))
    }
}
