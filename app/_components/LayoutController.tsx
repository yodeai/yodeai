
import BlockComponent from "./BlockComponent";
import { Block } from "app/_types/block";
import { Subspace, LensLayout } from "app/_types/lens";
import IconLayoutComponent from "./IconLayoutComponent";
import React from "react";
import { Flex, Grid, ScrollArea } from "@mantine/core";
import { Divider, Text } from "@mantine/core";
import SubspaceComponent from "@components/SubspaceComponent"
import BlockHeader from "./BlockHeader";

type LayoutControllerProps = {
    blocks: Block[]
    subspaces: Subspace[]
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

export default function LayoutController(props: LayoutControllerProps) {
    const {
        blocks, layout, layoutView, lens_id, subspaces,
        onChangeLayout, handleBlockChangeName, handleBlockDelete
    } = props;

    switch (layoutView) {
        case "block":
            return (
                <>
                    <ScrollArea type={"scroll"} w={'100%'} p={20} scrollbarSize={8} >
                        {/* <Divider mb={0} size={1.5} label={<Text c={"gray.7"} size="sm" fw={500}>Blocks</Text>} labelPosition="center" /> */}
                        {blocks && blocks.length > 0
                            ? <React.Fragment>
                                <BlockHeader />
                                {blocks.map((block) => (
                                    <BlockComponent key={block.block_id} block={block} />
                                ))}</React.Fragment>
                            : <Text size={"sm"} c={"gray.7"} ta={"center"} mt={30} mb={15}>
                                This space is empty, add blocks to populate this space with content & context.
                            </Text>}

                        {/* <Divider mb={0} size={1.5} label={<Text c={"gray.7"} size="sm" fw={500}>Subspaces</Text>} labelPosition="center" /> */}
                        {subspaces && subspaces.length > 0
                            ? subspaces.map((childLens) => (
                                <SubspaceComponent key={childLens.lens_id} subspace={childLens}></SubspaceComponent>
                            )) : <Text size={"sm"} c={"gray.7"} ta={"center"} mt={30}>
                                There are no subspaces, add subspaces to organize your blocks.</Text>}
                    </ScrollArea>
                </>)
        case "icon":
            return <IconLayoutComponent
                handleBlockChangeName={handleBlockChangeName}
                handleBlockDelete={handleBlockDelete}
                layouts={layout.icon_layout} onChangeLayout={onChangeLayout}
                lens_id={lens_id}
                subspaces={subspaces}
                blocks={blocks} />
    }
}