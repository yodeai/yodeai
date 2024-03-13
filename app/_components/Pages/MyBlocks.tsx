"use client";
import { useState, useEffect, useMemo } from "react";
import { notFound } from "next/navigation";
import BlockComponent from "@components/ListView/Views/BlockComponent";
import { Block } from "app/_types/block";
import LoadingSkeleton from '@components/LoadingSkeleton';
import { useAppContext } from "@contexts/context";
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

import { Flex, Text, Box } from "@mantine/core";
import BlockColumnHeader from "@components/Block/BlockColumnHeader";
import SpaceHeader from "@components/SpaceHeader";
import { useSort } from "app/_hooks/useSort";
import { revalidate } from "@utils/revalidate";

type MyBlocksProps = {
    blocks: Block[];
}
export default function MyBlocks(props: MyBlocksProps) {
    const supabase = createClientComponentClient()
    const { sortingOptions, setLensId } = useAppContext();
    const [blocks, setBlocks] = useState<Block[]>(props.blocks);


    useEffect(() => {
        const updateBlocks = (payload) => {
            let block_id = payload["new"]["block_id"]
            setBlocks(prevBlocks =>
                prevBlocks.map(item => {
                    if (item.block_id === block_id) {
                        return { ...payload['new'], inLenses: item.inLenses, lens_blocks: item.lens_blocks };
                    }
                    return item;
                })
            );

            revalidate(`/myblocks`)
        };

        const addBlocks = (payload) => {
            let block_id = payload["new"]["block_id"]
            console.log("Added a block", block_id)
            let newBlock = payload["new"]
            if (!blocks.some(item => item.block_id === block_id)) {
                setBlocks([newBlock, ...blocks]);
            }
            revalidate(`/myblocks`)
        }

        const deleteBlocks = (payload) => {
            let block_id = payload["new"]["block_id"]
            console.log("Deleting block", block_id);
            setBlocks((blocks) => blocks.filter((block) => block.block_id != block_id))
            revalidate(`/myblocks`)
        }

        const channel = supabase
            .channel('schema-db-changes')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'block' }, addBlocks)
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'block' }, updateBlocks)
            .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'block' }, deleteBlocks)
            .subscribe();

        return () => {
            if (channel) channel.unsubscribe();
        };
    }, [blocks]);


    useEffect(() => {
        setLensId(null);
    }, []);

    const sortedBlocks = useSort({ items: blocks, sortingOptions })

    return (
        <Flex direction="column" pt={0}>
            <SpaceHeader
                title="My Pages"
                selectedLayoutType="block"
                staticLayout={true}
            />

            {sortedBlocks.length > 0 &&
                <Box p={16}>
                    <BlockColumnHeader />
                    {sortedBlocks.map((block) =>
                        <BlockComponent key={block.block_id} block={block} hasArchiveButton={false} />
                    )}
                </Box> || ""
            }

            {sortedBlocks?.length == 0 &&
                <Text size={"sm"} c={"gray.7"} ta={"center"} mt={30}>
                    Nothing to show here. As you add pages they will initially show up in your Inbox.
                </Text> || ""
            }

        </Flex >
    );
}