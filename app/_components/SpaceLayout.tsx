
import BlockComponent from "./BlockComponent";
import { Block } from "app/_types/block";
import IconLayoutComponent from "./IconLayoutComponent";
import React from "react";
import { LensLayout } from '../_types/lens';

type SpaceLayoutComponentProps = {
    blocks: Block[]
    layout: LensLayout,
    layoutView: "block" | "icon",
    lens_id: string
    handleBlockChangeName: (block_id: number, newBlockName: string) => Promise<any>
    handleBlockDelete: (block_id: number) => Promise<any>
    onChangeLayout: (
        layoutName: keyof LensLayout,
        layoutData: LensLayout[keyof LensLayout]
    ) => void
}

export default function SpaceLayoutComponent(props: SpaceLayoutComponentProps) {
    const { blocks, layout, layoutView, lens_id, onChangeLayout, handleBlockChangeName, handleBlockDelete } = props;

    return layoutView === "block"
        ? <React.Fragment>{blocks.map((block) => (
            <BlockComponent key={block.block_id} block={block} />
        ))}</React.Fragment>
        : <IconLayoutComponent
            handleBlockChangeName={handleBlockChangeName}
            handleBlockDelete={handleBlockDelete}
            layouts={layout.icon_layout} onChangeLayout={onChangeLayout}
            lens_id={lens_id} blocks={blocks} />

}