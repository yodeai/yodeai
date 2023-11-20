
import BlockComponent from "./BlockComponent";
import { Block } from "app/_types/block";
import CanvasComponent from "./CanvasComponent";
import React from "react";

type SpaceLayoutComponentProps = {
    blocks: Block[]
    layoutView: "block" | "canvas",
    lens_id: string
}

export default function SpaceLayoutComponent({ blocks, layoutView, lens_id }: SpaceLayoutComponentProps) {
    return layoutView === "block"
        ? <React.Fragment>{blocks.map((block) => (
            <BlockComponent key={block.block_id} block={block} />
        ))}</React.Fragment>
        : <CanvasComponent lens_id={lens_id} blocks={blocks} />

}