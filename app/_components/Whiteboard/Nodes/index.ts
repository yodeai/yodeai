import { NodeProps } from "reactflow";
import { withNodeController } from "../NodeWrapper";

import * as StickyNote from "./StickyNote";
import * as Block from "./Block";

export const defaultValues = {
    stickyNote: StickyNote.defaultValues,
    block: Block.defaultValues
}

export default {
    stickyNote: withNodeController<NodeProps>(StickyNote.Component),
    block: withNodeController<NodeProps>(Block.Component)
};
