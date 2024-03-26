"use client";
import { useState, useEffect, useRef, useMemo } from "react";
import { Block } from "app/_types/block";
import { useAppContext } from "@contexts/context";
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

import { Flex, Text, Box } from "@mantine/core";
import { useSort } from "app/_hooks/useSort";
import { useInViewport } from '@mantine/hooks';
import LoadingSkeleton from "@components/LoadingSkeleton";
import { useDebouncedCallback } from "app/_hooks/useDebouncedCallback";

import { PageHeader } from "@components/Layout/PageHeader";
import { Sort } from "@components/Layout/PageHeader/Sort";
import { PageContent } from "@components/Layout/Content";
import BlockComponent from "@components/ListView/Views/BlockComponent";
import { useProgressRouter } from "app/_hooks/useProgressRouter";
import BlockColumnHeader from "@components/Block/BlockColumnHeader";

type MyBlocksProps = {
    blocks: Block[];
}
export default function MyBlocks(props: MyBlocksProps) {
    const supabase = createClientComponentClient()
    const { sortingOptions, setSortingOptions, setLensId } = useAppContext();
    const router = useProgressRouter();

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
            router.revalidate();
        };

        const addBlocks = (payload) => {
            let block_id = payload["new"]["block_id"]
            console.log("Added a block", block_id)
            let newBlock = payload["new"]
            if (!blocks.some(item => item.block_id === block_id)) {
                setBlocks([newBlock, ...blocks]);
            }
            router.revalidate();
        }

        const deleteBlocks = (payload) => {
            let block_id = payload["new"]["block_id"]
            console.log("Deleting block", block_id);
            setBlocks((blocks) => blocks.filter((block) => block.block_id != block_id))
            router.revalidate();
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

    const headerActions = useMemo(() => {
        return <>
            <Sort sortingOptions={sortingOptions} setSortingOptions={setSortingOptions} />
        </>
    }, [sortingOptions]);

    return (
        <Flex direction="column" pt={0}>
            <PageHeader
                title="My Pages"
                actions={headerActions}
            />
            <PageContent>
                <Box p={16}>
                    <BlockColumnHeader />
                    {blocks?.length > 0 ? (
                        <>
                            {sortedBlocks.map((block) => (
                                <BlockComponent key={block.block_id} block={block} />
                            ))}
                            {hasMore && <>
                                <div ref={ref} className="w-full h-[1px]" />
                                <LoadingSkeleton
                                    boxCount={3}
                                    lineHeight={75}
                                />
                            </>}
                        </>
                    ) : (
                        <Text size={"sm"} c={"gray.7"} ta={"center"} mt={30}>
                            Nothing to show here. As you add pages they will initially show up in your Inbox.
                        </Text>
                    )}
                </Box>
            </PageContent>
        </Flex >
    );
}