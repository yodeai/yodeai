"use client";
import { useState, useEffect, useRef } from "react";
import BlockComponent from "@components/ListView/Views/BlockComponent";
import { Block } from "app/_types/block";
import { useAppContext } from "@contexts/context";
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

import { Flex, Text, Box } from "@mantine/core";
import BlockColumnHeader from "@components/Block/BlockColumnHeader";
import SpaceHeader from "@components/SpaceHeader";
import { useSort } from "app/_hooks/useSort";
import { revalidateRouterCache } from "@utils/revalidate";
import { useInViewport } from '@mantine/hooks';
import LoadingSkeleton from "@components/LoadingSkeleton";
import { useDebouncedCallback } from "app/_hooks/useDebouncedCallback";

type MyBlocksProps = {
    blocks: Block[];
}
export default function MyBlocks(props: MyBlocksProps) {
    const supabase = createClientComponentClient()
    const { sortingOptions, setLensId } = useAppContext();

    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [blocks, setBlocks] = useState<Block[]>(props.blocks);
    const $pagination = useRef({ limit: 30, offset: 30 });
    const [hasMore, setHasMore] = useState(true);

    const { ref, inViewport } = useInViewport();

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

            revalidateRouterCache(`/myblocks`)
        };

        const addBlocks = (payload) => {
            let block_id = payload["new"]["block_id"]
            console.log("Added a block", block_id)
            let newBlock = payload["new"]
            if (!blocks.some(item => item.block_id === block_id)) {
                setBlocks([newBlock, ...blocks]);
            }
            revalidateRouterCache(`/myblocks`)
        }

        const deleteBlocks = (payload) => {
            let block_id = payload["new"]["block_id"]
            console.log("Deleting block", block_id);
            setBlocks((blocks) => blocks.filter((block) => block.block_id != block_id))
            revalidateRouterCache(`/myblocks`)
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

    const loadMore = useDebouncedCallback(async () => {
        setIsLoadingMore(true);
        fetch(`/api/block/getAllBlocks?limit=${$pagination.current.limit}&offset=${$pagination.current.offset}`)
            .then(async (res) => {
                const data = await res.json();
                if (data.data.length !== $pagination.current.limit) {
                    setHasMore(false);  
                }
                setBlocks([...blocks, ...data.data]);
                setIsLoadingMore(false);
                $pagination.current.offset += $pagination.current.limit;
            })
    }, 100, []);

    useEffect(() => {
        if (inViewport && hasMore && !isLoadingMore) {
            loadMore();
            console.log("Fetching more blocks")
        }
    }, [inViewport])

    const sortedBlocks = useSort({ items: blocks, sortingOptions })

    return (
        <Flex direction="column" pt={0}>
            <SpaceHeader
                title="My Pages"
                selectedLayoutType="block"
                staticLayout={true}
                defaultSortingOption={{
                    sortBy: "createdAt",
                    order: "desc"
                }}
            />

            {sortedBlocks.length > 0 &&
                <Box p={16}>
                    <BlockColumnHeader />
                    {sortedBlocks.map((block) =>
                        <BlockComponent key={block.block_id} block={block} hasArchiveButton={false} />
                    )}
                    {hasMore && <>
                        <div ref={ref} className="w-full h-[1px]" />
                        <LoadingSkeleton
                            boxCount={3}
                            lineHeight={75}
                        />
                    </>}

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