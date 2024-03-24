"use client";

import BlockComponent from "@components/ListView/Views/BlockComponent";
import { Block } from "app/_types/block";
import { useState, useEffect, useRef } from "react";
import LoadingSkeleton from '@components/LoadingSkeleton';
import { useAppContext } from "@contexts/context";
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

import { Flex, Box, Paper, Text } from "@mantine/core";
import LensInviteComponent from "@components/LensInviteComponent";
import BlockColumnHeader from "@components/Block/BlockColumnHeader";
import FinishedOnboardingModal from "@components/Onboarding/FinishedOnboardingModal";
import { useDebouncedCallback } from "app/_hooks/useDebouncedCallback";
import { useInViewport } from "@mantine/hooks";

import { PageHeader } from "@components/Layout/PageHeader";
import { PageContent } from "@components/Layout/Content";

type InboxProps = {
    blocks: Block[];
}

export default function Inbox(props: InboxProps) {
    const [blocks, setBlocks] = useState<Block[]>(props.blocks);
    const [unacceptedInvites, setUnacceptedInvites] = useState([]);

    const $pagination = useRef({ limit: 30, offset: 30 });
    const [hasMore, setHasMore] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const { ref, inViewport } = useInViewport();

    const { setLensId, user } = useAppContext();
    const supabase = createClientComponentClient()

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
        };

        const addBlocks = (payload) => {
            let block_id = payload["new"]["block_id"]
            console.log("Added a block", block_id)
            let newBlock = payload["new"]
            if (!blocks.some(item => item.block_id === block_id)) {
                setBlocks([newBlock, ...blocks]);
            }
        }

        const deleteBlocks = (payload) => {
            let block_id = payload["new"]["block_id"]
            console.log("Deleting block", block_id);
            setBlocks((blocks) => blocks.filter((block) => block.block_id != block_id))

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


    const fetchInvites = async () => {
        const { data, error } = await supabase
            .from('lens_invites')
            .select()
            .eq('recipient', user.email).eq("status", "sent")
        if (error) {
            console.error("error getting lens invites:", error.message)
        }
        setUnacceptedInvites(data);
    }

    useEffect(() => {
        const fetchBlocksAndInfo = async () => {
            fetchInvites();
            setLensId(null);
        }
        fetchBlocksAndInfo();

    }, []);

    const loadMore = useDebouncedCallback(async () => {
        setIsLoadingMore(true);
        fetch(`/api/inbox/getBlocks?limit=${$pagination.current.limit}&offset=${$pagination.current.offset}`)
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
    }, [inViewport]);

    const onBlockArchive = (block: Block) => {
        setBlocks((blocks) => blocks.filter((b) => b.block_id !== block.block_id));
    }

    return (
        <Flex direction="column" pt={0}>
            <PageHeader title="Inbox" />
            <PageContent>
                <Box p={16}>
                    <Paper mb={10}>
                        <Text size="lg" fw={600} c={"gray.7"}>Invitations</Text>
                        {unacceptedInvites?.length > 0 ? (
                            unacceptedInvites.map((invite) => (
                                <div key={invite.lens_id} >
                                    <LensInviteComponent invite={invite}></LensInviteComponent>
                                </div>
                            ))
                        ) : (
                            <Text c={"gray.6"} mt={5} size="md">
                                No unaccepted invites!
                            </Text>
                        )}
                    </Paper>
                    <BlockColumnHeader />
                    <Text size="lg" fw={600} c={"gray.7"}>Latest Pages</Text>
                    {blocks?.length > 0 && user?.user_metadata?.google_user_id != "" ? (
                        <>
                            {blocks.map((block) => (
                                <BlockComponent key={block.block_id} block={block} hasArchiveButton={true} onArchive={onBlockArchive} />
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
            <FinishedOnboardingModal />
        </Flex >
    );
}