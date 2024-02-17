
import { Block } from "app/_types/block";
import { Subspace, LensLayout, Lens, Whiteboard } from "app/_types/lens";
import IconLayoutComponent from "./IconView/IconLayoutComponent";
import React from "react";
import { Flex, Text } from "@mantine/core";
import ListLayoutComponent from "./ListLayoutComponent";
import { Tables } from "app/_types/supabase";

type LayoutControllerProps = {
    blocks?: Block[]
    subspaces?: (Subspace | Lens)[]
    whiteboards?: Tables<"whiteboard">[]
    layout: LensLayout,
    itemIcons: Lens["item_icons"];
    layoutView: "block" | "icon",
    handleBlockChangeName: (block_id: number, newBlockName: string) => Promise<any>
    handleBlockDelete: (block_id: number) => Promise<any>
    handleLensDelete: (lens_id: number) => Promise<any>
    handleLensChangeName?: (lens_id: number, newLensName: string) => Promise<any>
    handleWhiteboardDelete?: (whiteboard_id: number) => Promise<any>
    handleWhiteboardChangeName?: (whiteboard_id: number, newWhiteboardName: string) => Promise<any>
    onChangeLayout: (
        layoutName: keyof LensLayout,
        layoutData: LensLayout[keyof LensLayout]
    ) => void
    handleItemSettings?: (item: Lens | Subspace | Tables<"block"> | Tables<"whiteboard">) => void
    handleItemIconChange?: (item_id: number, newIcon: string) => Promise<any>
}

export default function LayoutController(props: LayoutControllerProps) {
    const {
        blocks,
        layout,
        layoutView,
        subspaces,
        whiteboards,
        onChangeLayout
    } = props;

    if (blocks?.length === 0 && subspaces?.length === 0 && whiteboards?.length === 0) return (
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
                This space is empty, add pages to populate this space with content & context.
            </Text>
        </Flex>
    )

    switch (layoutView) {
        case "block":
            return <ListLayoutComponent
                blocks={blocks}
                subspaces={subspaces}
                whiteboards={whiteboards}
            />
        case "icon":
            return <div className="w-full h-full overflow-scroll">
                <IconLayoutComponent
                    subspaces={subspaces}
                    layouts={layout.icon_layout}
                    onChangeLayout={onChangeLayout}
                    blocks={blocks || []}
                    whiteboards={whiteboards || []}
                    {...props}
                />
            </div>
    }
}