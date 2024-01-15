import { Flex, Text, ScrollArea, Divider } from "@mantine/core";
import { Block } from "app/_types/block";
import { Subspace, LensLayout, Lens, Whiteboard } from "app/_types/lens";

import WhiteboardComponent from "./Whiteboard";
import BlockHeader from "./BlockHeader";
import BlockComponent from "./BlockComponent";
import SubspaceComponent from "./SubspaceComponent";
import { Tables } from "app/_types/supabase";
import { useAppContext } from "@contexts/context";
import { useMemo } from "react";
import WhiteboardLineComponent from "./Whiteboard/WhiteboardLineComponent";

type ListLayoutComponentProps = {
    blocks?: Block[];
    whiteboards?: Tables<"whiteboard">[];
    subspaces?: (Subspace | Lens)[];
}
export default function ListLayoutComponent(props: ListLayoutComponentProps) {
    const {
        blocks, subspaces, whiteboards
    } = props;

    const { sortingOptions } = useAppContext();

    const items = useMemo(() => [...(blocks || []), ...(whiteboards || [])], [blocks || [], whiteboards || []]);
    const sortedItems = useMemo(() => {
        if (sortingOptions.sortBy === null) return items;

        let _sorted_items = [...items].sort((a, b) => {
            if (sortingOptions.sortBy === "name") {
                let aName = "whiteboard_id" in a ? a.name : a.title;
                let bName = "whiteboard_id" in b ? b.name : b.title;
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

    return <ScrollArea type={"scroll"} w={'100%'} p={12} scrollbarSize={8} h="100%">
        {(blocks || whiteboards) && (sortedItems.length > 0
            ? <>
                <BlockHeader />
                {sortedItems.map((item) => {
                    return "whiteboard_id" in item
                        ? <WhiteboardLineComponent key={item.whiteboard_id} whiteboard={item} />
                        : <BlockComponent key={item.block_id} block={item} />
                })}</>
            : <Flex align="center" justify="center">
                <Text size="sm" c={"gray.7"} ta={"center"} my={20}>No block or whiteboards.</Text>
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