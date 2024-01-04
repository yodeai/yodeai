
import BlockComponent from "./BlockComponent";
import { Block } from "app/_types/block";
import { Subspace, LensLayout, Lens } from "app/_types/lens";
import IconLayoutComponent from "./IconLayoutComponent";
import React from "react";
import { Flex, Grid, ScrollArea } from "@mantine/core";
import { Divider, Text } from "@mantine/core";
import SubspaceComponent from "@components/SubspaceComponent"
import BlockHeader from "./BlockHeader";

type LayoutControllerProps = {
    blocks: Block[]
    subspaces: (Subspace | Lens)[]
    layout: LensLayout,
    layoutView: "block" | "icon",
    handleBlockChangeName: (block_id: number, newBlockName: string) => Promise<any>
    handleBlockDelete: (block_id: number) => Promise<any>
    handleLensDelete: (lens_id: number) => Promise<any>
    onChangeLayout: (
        layoutName: keyof LensLayout,
        layoutData: LensLayout[keyof LensLayout]
    ) => void
}

export default function LayoutController(props: LayoutControllerProps) {
    const {
        blocks, layout, layoutView, subspaces,
        onChangeLayout, handleBlockChangeName,
        handleBlockDelete, handleLensDelete
    } = props;

    if (blocks.length === 0 && subspaces.length === 0) return (
        <Flex
            align="center"
            justify="center"
        >
            <Text
                size="sm"
                c={"gray.7"}
                ta={"center"}
                mt={30}
                mb={15}
            >
                This space is empty, add blocks to populate this space with content & context.
            </Text>
        </Flex>
    )

    switch (layoutView) {
        case "block":
            return <ScrollArea type={"scroll"} w={'100%'} p={12} scrollbarSize={8}
                className="h-[calc(100vh-120px)]">
                {/* <Divider mb={0} size={1.5} label={<Text c={"gray.7"} size="sm" fw={500}>Blocks</Text>} labelPosition="center" /> */}
                {blocks && blocks.length > 0
                    && <React.Fragment>
                        <BlockHeader />
                        {blocks.map((block) => (
                            <BlockComponent key={block.block_id} block={block} />
                        ))}</React.Fragment>
                    || ""}

                {/* <Divider mb={0} size={1.5} label={<Text c={"gray.7"} size="sm" fw={500}>Subspaces</Text>} labelPosition="center" /> */}
                {subspaces && subspaces.length > 0
                    ? subspaces.map((childLens) => (
                        <SubspaceComponent key={childLens.lens_id} subspace={childLens}></SubspaceComponent>
                    )) : null}
            </ScrollArea>
        case "icon":
            return <ScrollArea type={"scroll"} w={'100%'} p={0} scrollbarSize={8}>
                <IconLayoutComponent
                    handleBlockChangeName={handleBlockChangeName}
                    handleBlockDelete={handleBlockDelete}
                    handleLensDelete={handleLensDelete}
                    layouts={layout.icon_layout} onChangeLayout={onChangeLayout}
                    subspaces={subspaces}
                    blocks={blocks} />
            </ScrollArea>
    }
}