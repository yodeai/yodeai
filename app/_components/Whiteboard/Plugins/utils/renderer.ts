import { Node } from "reactflow";
import { v4 as uuidv4 } from 'uuid';

import { TextValueType } from "@components/Whiteboard/Nodes/Text";
import { StickyNoteValueType } from "@components/Whiteboard/Nodes/StickyNote"
import { GroupNodeValueType } from "@components/Whiteboard//Nodes/Group";

type CreateTextType = {
    id?: string;
    data: TextValueType;
    position: Node<any>["position"];
    width: number;
    height: number;
}
export const createText = ({ id = uuidv4(), data, position, width, height }: CreateTextType): Node<TextValueType> => {
    return {
        id,
        data,
        type: "text",
        position,
        positionAbsolute: {
            x: position.x + width,
            y: position.y + height,
        },
        style: { width, height },
        width, height,
        zIndex: 100,
        dragging: false,
        resizing: false,
        selected: false,
    }
}

type CreateStickyNoteType = {
    id?: string;
    data: StickyNoteValueType;
    position: Node<any>["position"];
    width: number;
    height: number;
}
export const createStickyNote = ({ id = uuidv4(), data, position, width, height }: CreateStickyNoteType): Node<StickyNoteValueType> => {
    return {
        id,
        data,
        type: "stickyNote",
        position,
        positionAbsolute: {
            x: position.x + width,
            y: position.y + height,
        },
        style: { width, height },
        width, height,
        zIndex: 50,
        dragging: false,
        resizing: false,
        selected: false,
    }
}

type CreateGroupNodeType = {
    id?: string;
    data?: GroupNodeValueType;
    position: Node<undefined>["position"];
    width: number;
    height: number;
}
export const createGroupNode = ({ id = uuidv4(), data, position, width, height }: CreateGroupNodeType): Node<GroupNodeValueType> => {
    return {
        id,
        type: "group",
        data,
        position,
        positionAbsolute: {
            x: position.x + width,
            y: position.y + height,
        },
        style: {
            width,
            height,
            padding: 0,
            borderColor: '#ddd',
        },
        width, height,
        zIndex: 9
    }
}