
import { useMemo } from "react";
import { Flex, Text, ScrollArea, Divider, AppShell } from "@mantine/core";
import { Block } from "app/_types/block";
import { Subspace, Lens } from "app/_types/lens";

import BlockColumnHeader from "@components/Block/BlockColumnHeader";
import BlockComponent from "@components/ListView/Views/BlockComponent";
import SubspaceComponent from "@components/ListView/Views/SubspaceComponent";

import { Tables } from "app/_types/supabase";
import { useAppContext } from "@contexts/context";
import WhiteboardLineComponent from "@components/ListView/Views/WhiteboardLineComponent";
import SpreadsheetLineComponent from "./Views/SpreadsheetLineComponent";

type ListLayoutComponentProps = {
    blocks?: Block[];
    whiteboards?: Tables<"whiteboard">[];
    spreadsheets?: Tables<"spreadsheet">[];
    subspaces?: (Subspace | Lens)[];
}
type ItemType = Block | Tables<"whiteboard"> | Tables<"spreadsheet">;
export default function ListLayoutComponent(props: ListLayoutComponentProps) {
    const {
        blocks = [], subspaces = [], whiteboards = [], spreadsheets = []
    } = props;

    const { sortingOptions } = useAppContext();

    const items = useMemo(() =>
        [...blocks, ...whiteboards, ...spreadsheets]
        , [blocks, whiteboards, spreadsheets]);

    const sortedItems = useMemo(() => {
        if (sortingOptions.sortBy === null) return items;

        let _sorted_items = [...items].sort((a, b) => {
            if (sortingOptions.sortBy === "name") {
                let aName = "block_id" in a ? a.title : a.name;
                let bName = "block_id" in b ? b.title : b.name;
                return aName.localeCompare(bName);
            } else if (sortingOptions.sortBy === "createdAt") {
                return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
            } else if (sortingOptions.sortBy === "updatedAt") {
                return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
            }
        });

        if (sortingOptions.order === "desc") {
            _sorted_items = _sorted_items.reverse();
        }

        return _sorted_items;
    }, [items]);

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
    }

    return <ScrollArea type={"scroll"} w={'100%'} p={12} scrollbarSize={8} h="100%">
        {(blocks || whiteboards) && (sortedItems.length > 0
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
    </ScrollArea>
}