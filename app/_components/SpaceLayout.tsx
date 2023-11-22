
import BlockComponent from "./BlockComponent";
import { Block } from "app/_types/block";
import CanvasComponent from "./CanvasComponent";
import React from "react";
import { LensLayout } from '../_types/lens';

type SpaceLayoutComponentProps = {
    blocks: Block[]
    layout: LensLayout,
    layoutView: "block" | "canvas",
    lens_id: string
    onChangeLayout: (
        layoutName: keyof LensLayout,
        layoutData: LensLayout[keyof LensLayout]
    ) => void
}

export default function SpaceLayoutComponent({ blocks, layout, layoutView, lens_id, onChangeLayout }: SpaceLayoutComponentProps) {
    return layoutView === "block"
        ? <React.Fragment>{blocks.map((block) => (
            <BlockComponent key={block.block_id} block={block} />
        ))}</React.Fragment>
        : <CanvasComponent
        layouts={layout.canvas_layout} onChangeLayout={onChangeLayout}
        lens_id={lens_id} blocks={blocks} />

}