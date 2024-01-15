import { NodeProps } from "reactflow";
import { withNodeController } from "../NodeWrapper";

import * as StickyNote from "./StickyNote";
import * as DynamicElements from "./DynamicElements";

export const defaultValues = {
    stickyNote: StickyNote.defaultValues,
    dynamicElement: DynamicElements.defaultValues
}

export default {
    stickyNote: withNodeController<NodeProps>(StickyNote.Component),
    dynamicElement: withNodeController<NodeProps>(DynamicElements.Component)
};
