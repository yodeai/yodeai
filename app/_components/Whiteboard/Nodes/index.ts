import { NodeProps } from "reactflow";
import { withNodeController } from "@components/Whiteboard/NodeWrapper";

import * as StickyNote from "./StickyNote";
import * as DynamicElements from "./DynamicElements";
import * as Group from "./Group";
import * as Text from "./Text";

export const defaultValues = {
    stickyNote: StickyNote.defaultValues,
    dynamicElement: DynamicElements.defaultValues,
    group: Group.defaultValues,
    text: Text.defaultValues
}

export const defaultNodeProps = {
    stickyNote: StickyNote.defaultNodeProps,
    dynamicElement: DynamicElements.defaultNodeProps,
    group: Group.defaultNodeProps,
    text: Text.defaultNodeProps
}

export default {
    stickyNote: withNodeController<NodeProps>(StickyNote.Component),
    dynamicElement: withNodeController<NodeProps>(DynamicElements.Component),
    group: withNodeController<NodeProps>(Group.Component),
    text: withNodeController<NodeProps>(Text.Component)
};
