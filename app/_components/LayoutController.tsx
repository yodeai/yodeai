
import BlockComponent from "./BlockComponent";
import { Block } from "app/_types/block";
import { Subspace, LensLayout, Lens, Whiteboard } from "app/_types/lens";
import IconLayoutComponent from "./IconLayoutComponent";
import React from "react";
import { Flex, Grid, ScrollArea } from "@mantine/core";
import { Divider, Text } from "@mantine/core";
import SubspaceComponent from "@components/SubspaceComponent"
import BlockHeader from "./BlockHeader";
import WhiteboardComponent from '@components/Whiteboard/WhiteboardLineComponent';

type LayoutControllerProps = {
    blocks: Block[]
    subspaces: (Subspace | Lens)[]
    whiteboards: Whiteboard[]
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
        blocks, layout, layoutView, subspaces, whiteboards,
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
            return <ScrollArea type={"scroll"} w={'100%'} p={12} scrollbarSize={8} h="100%">
                <Divider mb={0} size={1.8} label={<Text c={"gray.7"} size="sm" fw={500}>Blocks</Text>} labelPosition="center" />
                {blocks && blocks.length > 0
                    ? <>
                        <BlockHeader />
                        {blocks.map((block) => (
                            <BlockComponent key={block.block_id} block={block} />
                        ))}
                    </>
                    : <Flex align="center" justify="center">
                        <Text size="sm" c={"gray.7"} ta={"center"} my={20}> No blocks.</Text>
                    </Flex>
                }


                <Divider mb={0} size={1.8} label={<Text c={"gray.7"} size="sm" fw={500}>Whiteboards</Text>} labelPosition="center" />
                {whiteboards && whiteboards.length > 0
                    ? whiteboards.map((whiteboard) => (
                        <WhiteboardComponent key={whiteboard.whiteboard_id} whiteboard={whiteboard} />
                    ))
                    : <Flex align="center" justify="center">
                        <Text size="sm" c={"gray.7"} ta={"center"} my={20}> No whiteboards.</Text>
                    </Flex>
                }
                
                <Divider mb={0} size={1.8} label={<Text c={"gray.7"} size="sm" fw={500}>Subspaces</Text>} labelPosition="center" />
                {subspaces && subspaces.length > 0
                    ? subspaces.map((childLens) => (
                        <SubspaceComponent key={childLens.lens_id} subspace={childLens}></SubspaceComponent>
                    )) :
                    <Flex align="center" justify="center">
                        <Text size="sm" c={"gray.7"} ta={"center"} my={20}> No subspaces.</Text>
                    </Flex>
                }
            </ScrollArea>
        case "icon":
            return <div className="w-full h-full overflow-scroll">
                <IconLayoutComponent
                    handleBlockChangeName={handleBlockChangeName}
                    handleBlockDelete={handleBlockDelete}
                    handleLensDelete={handleLensDelete}
                    layouts={layout.icon_layout} onChangeLayout={onChangeLayout}
                    subspaces={subspaces}
                    blocks={blocks}
                    whiteboards={whiteboards} />
            </div>
    }
}