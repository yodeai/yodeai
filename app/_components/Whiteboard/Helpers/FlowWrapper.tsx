import { WhiteboardComponentProps } from "app/_types/whiteboard"
import React, { createContext } from "react"


type FlowWrapperContextProps = {
    whiteboard: WhiteboardComponentProps["data"]
    isSaving: boolean
    isLocked: boolean
}

export const FlowContext = createContext<FlowWrapperContextProps | undefined>(undefined)
export const useFlow = () => {
    const flow = React.useContext(FlowContext)
    if (!flow) throw new Error("useFlow must be used within a FlowWrapper")
    return flow
}

type FlowWrapperProps = FlowWrapperContextProps & { children: React.ReactNode }
/**
 * This file is a part of the Whiteboard component.
 * It provides a context for the Whiteboard component.
 * It is used to pass the whiteboard data, saving state, and lock state to the children components.
 * 
 * @param whiteboard The whiteboard object.
 * @param isSaving Indicates whether the whiteboard is currently being saved.
 * @param isLocked Indicates whether the whiteboard is locked.
 * @param children The content to be wrapped.
 */
export const FlowWrapper = ({ whiteboard, isSaving, isLocked, children }: FlowWrapperProps) => {
    return <FlowContext.Provider value={{ whiteboard, isSaving, isLocked }}>
        {children}
    </FlowContext.Provider>
}