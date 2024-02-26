import { Position } from "reactflow"
import { Handle } from "reactflow"
import { useFlow } from "./FlowWrapper"

type HandlesProps = {
    children: React.ReactNode
    positions?: {
        target: Position,
        source: Position
    }
}
export const Handles = ({
    children,
    positions = {
        target: Position.Left,
        source: Position.Right
    }
}: HandlesProps) => {
    const { isLocked } = useFlow();

    return <>
        {!isLocked && <Handle type="target" position={positions.target} /> || ""}
        {children}
        {!isLocked && <Handle type="source" position={positions.source} /> || ""}
    </>
}