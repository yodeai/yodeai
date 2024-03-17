
import { useEffect, useMemo, useRef } from "react";
import { Flex, Text, ScrollArea, Divider, AppShell, Box } from "@mantine/core";
import { Block } from "app/_types/block";
import { Subspace, Lens } from "app/_types/lens";

import BlockColumnHeader from "@components/Block/BlockColumnHeader";
import BlockComponent from "@components/ListView/Views/BlockComponent";
import SubspaceComponent from "@components/ListView/Views/SubspaceComponent";

import { Tables } from "app/_types/supabase";
import { useAppContext } from "@contexts/context";
import WhiteboardLineComponent from "@components/ListView/Views/WhiteboardLineComponent";
import SpreadsheetLineComponent from "./Views/SpreadsheetLineComponent";
import WidgetLineComponent from "./Views/WidgetLineComponent";
import { useSort } from "app/_hooks/useSort";
import { cn, getInnerHeight } from "@utils/style";

export type ListViewItemType = Block | Subspace | Lens
    | Tables<"whiteboard">
    | Tables<"spreadsheet">
    | Tables<"widget">;

type ListLayoutComponentProps = {
    blocks?: Block[];
    whiteboards?: Tables<"whiteboard">[];
    spreadsheets?: Tables<"spreadsheet">[];
    subspaces?: (Subspace | Lens)[];
    widgets: Tables<"widget">[];
}
type ItemType = Block | Tables<"whiteboard"> | Tables<"spreadsheet"> | Tables<"widget">;
export default function ListLayoutComponent(props: ListLayoutComponentProps) {
    const {
        blocks = [], subspaces = [], whiteboards = [], spreadsheets = [], widgets = []
    } = props;

    const { sortingOptions, layoutRefs } = useAppContext();

    const items = useMemo(() =>
        [...blocks, ...whiteboards, ...spreadsheets, ...widgets]
        , [blocks, whiteboards, spreadsheets, widgets]);

    const sortedItems = useSort<ListViewItemType>({ sortingOptions, items });

    const itemRenderer = (item: ItemType) => {
        if ("whiteboard_id" in item) {
            return <WhiteboardLineComponent key={item.whiteboard_id} whiteboard={item} />
        }
        if ("spreadsheet_id" in item) {
            return <SpreadsheetLineComponent key={item.spreadsheet_id} spreadsheet={item} />
        }
        if ("block_id" in item) {
            return <BlockComponent key={item.block_id} block={item} />
        }
        if ("widget_id" in item) {
            return <WidgetLineComponent key={item.widget_id} widget={item} />
        }
    }

    return <Box pl={12}>
        {(sortedItems.length > 0
            ? <>
                <BlockColumnHeader />
                {sortedItems.map(itemRenderer)}
            </>
            : <Flex align="center" justify="center">
                <Text size="sm" c={"gray.7"} ta={"center"} my={20}>No page or whiteboards.</Text>
            </Flex>) || ""}

        <Divider mb={0} size={1.8} label={<Text c={"gray.7"} size="sm" fw={500}>Subspaces</Text>} labelPosition="center" />
        {subspaces && subspaces.length > 0
            ? subspaces.map((childLens) => (
                <SubspaceComponent key={childLens.lens_id} subspace={childLens}></SubspaceComponent>
            )) :
            <Flex align="center" justify="center">
                <Text size="sm" c={"gray.7"} ta={"center"} my={20}> No subspaces.</Text>
            </Flex>
        }
    </Box>
}