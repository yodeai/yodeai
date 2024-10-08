import { Node } from "reactflow";
import { defaultNodeProps as stickyNoteDefaultStyling } from "@components/Whiteboard/Nodes/StickyNote";

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

export const calculateStickyNoteBoxHeight = (text: string, width: number, fontSize: number = stickyNoteDefaultStyling.style.fontSize) => {
    const { lineHeight } = stickyNoteDefaultStyling.style;
    const newLineCount = (text.match(/\n/g) || []).length;
    const rowCount = Math.ceil(text.length / (width / ((fontSize / 2) + 2))) + newLineCount / 2;
    return (rowCount + 2) * (fontSize * lineHeight);
}

export const calculateTextBoxHeight = (text: string, fontSize: number, width: number) => {
    const newLineCount = (text.match(/\n/g) || []).length;
    const rowCount = Math.ceil(text.length / (width / ((fontSize / 2) + 2))) + newLineCount / 2;
    return (rowCount + 2) * fontSize
}