import { Position } from "reactflow"
import { Handle } from "reactflow"
import { useFlow } from "./FlowWrapper"
import { cn } from "@utils/style"

type HandlesProps = {
    children: React.ReactNode
    className?: string
    positions?: {
        target: Position,
        source: Position
    }
}
export const Handles = ({
    children,
    className,
    positions = {
        target: Position.Left,
        source: Position.Right
    }
}: HandlesProps) => {
    const { isLocked } = useFlow();

    return <>
        <Handle type="target" position={positions.target} className={cn(className, isLocked && "opacity-0" || "")} />
        {children}
        <Handle type="source" position={positions.source} className={cn(className, isLocked && "opacity-0" || "")} />
    </>
}