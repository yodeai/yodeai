// components/QuestionAnswerForm.tsx
"use client";

import React, { useState, FormEvent } from 'react';
import { ChatMessage } from 'app/_types/chat';
import { useAppContext } from "@contexts/context";
import { useRef, useEffect } from "react";
import { AppShell, Box, Button, Divider, Flex, Group, Text, Textarea } from '@mantine/core';
import InfoPopover from '@components/InfoPopover';
import ToolbarHeader from '@components/Layout/Aside/ToolbarHeader';
import LoadingSkeleton from '@components/LoadingSkeleton';
import LensChatMessage from './LensChatMessage';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useDebouncedCallback } from 'app/_hooks/useDebouncedCallback';
import { useIntersection } from '@mantine/hooks';

const MESSAGE_LIMIT = 25;

export default function LensChat() {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isSending, setIsSending] = useState<boolean>(false);
    const [inputValue, setInputValue] = useState<string>('');
    const [hasMore, setHasMore] = useState<boolean>(true);
    const { lensId, lensName, user } = useAppContext();

    const supabase = createClientComponentClient()
    const $container = useRef<HTMLDivElement>(null);
    const $intersectionObject = useIntersection({
        root: $container.current,
        rootMargin: '0px', threshold: 1
    });

    const $offset = useRef<number>(0);
    const $hasMore = useRef<boolean>(false);
    const $fetching = useRef<boolean>(false);

    const fetchLensChat = useDebouncedCallback(async () => {
        $fetching.current = true;
        setIsLoading(true);
        const searchParams = new URLSearchParams({
            limit: MESSAGE_LIMIT.toString(),
            offset: $offset.current.toString()
        });
        fetch(`/api/lens/${lensId}/chats?${searchParams.toString()}`)
            .then(res => {
                if (!res.ok) {
                    throw new Error("Network response was not ok");
                } else {
                    return res.json();
                }
            })
            .then(data => {
                setMessages(_messages => [..._messages, ...data.data.messages]);
                setHasMore(data.data.hasMore);
                $hasMore.current = data.data.hasMore;
            })
            .catch(err => {
                console.log("Chat error:", err);
            })
            .finally(() => {
                setIsLoading(false);
                $fetching.current = false;
            })
    }, 100, [lensId, $offset])

    const fetchMessage = async (payload) => {
        const { id } = payload.new;
        if (messages.find(message => message.id === id)) return;

        fetch(`/api/lens/${lensId}/chats/${id}`, {
            method: "GET"
        })
            .then(res => {
                if (!res.ok) {
                    throw new Error("Network response was not ok");
                } else {
                    return res.json();
                }
            })
            .then(data => {
                setMessages(_messages => [data.data, ..._messages]);
            })
            .catch(err => {
                console.log("Chat error:", err);
            })
            .finally(() => {
                setIsLoading(false);

            })
    }

    useEffect(() => {
        if (!user?.id || !lensId) return;
        fetchLensChat();

        const channel = supabase
            .channel('schema-db-changes')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'lens_chats', filter: `user_id=neq.${user?.id}` }, fetchMessage)
            .subscribe();

        return () => {
            if (channel) channel.unsubscribe();
            setMessages([]);
            setIsLoading(true);
            setIsSending(false);

            $offset.current = 0;
            $hasMore.current = false;
            $fetching.current = false;
        }
    }, [lensId, user]);

    useEffect(() => {
        if ($intersectionObject.entry && $hasMore.current && $fetching.current === false && isLoading === false) {
            $offset.current += MESSAGE_LIMIT;
            fetchLensChat();
        }
    }, [$intersectionObject.entry, lensId]);

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        if (!inputValue) return;

        setIsSending(true);

        fetch(`/api/lens/${lensId}/chats`, {
            method: "PUT",
            body: JSON.stringify({ message: inputValue, })
        })
            .then(res => {
                if (!res.ok) {
                    throw new Error("Network response was not ok");
                } else {
                    return res.json();
                }
            })
            .then(data => {
                setMessages([data.data[0], ...messages]);
                setInputValue('');
            })
            .catch(err => {
                console.log("Chat error:", err);
            })
            .finally(() => {
                setIsSending(false);
            })
    }

    const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setInputValue(event.target.value);
    }

    const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            handleSubmit(event);
        }
    }

    // useEffect(() => {v
    //     console.log("intersection", $intersectionObject.entry)
    // }, [$intersectionObject.entry])

    return (
        <Flex
            direction={"column"}
            className="h-full w-full"
            justify={"space-between"}>

            {/* headaer */}
            <AppShell.Section>
                <ToolbarHeader>
                    <Flex align="center" direction="row">
                        <Text size="sm">
                            {lensId && lensName
                                ? 'Chat: ' + lensName
                                : "Chat"}
                        </Text>
                        <InfoPopover infoText={`This chat is for communicating with other users on the "${lensName}" space.`} />
                    </Flex>
                </ToolbarHeader>
            </AppShell.Section>

            {/* content */}
            <Box ref={$container} className="flex h-full flex-col-reverse gap-3 py-1 px-3 overflow-scroll">
                {messages.map((message, index) => {
                    return <LensChatMessage key={index} message={message} />
                })}
                {isLoading && (<LoadingSkeleton boxCount={$offset?.current ? 1 : 8} lineHeight={80} />)}
                {hasMore && <div ref={$intersectionObject.ref} className="loadMore h-8 w-full"></div>}
                {!hasMore && !isLoading && messages.length > 0 && <Divider mb={0} size={1.5}
                    label={<Text c={"gray.5"} size="sm" fw={500}>You've reached the start of the chat.</Text>}
                    labelPosition="center" />}
            </Box>

            {/* footer */}
            <AppShell.Section>
                <Flex p={10} pt={0} direction={"column"}>
                    <Flex justify={'center'} pb={0} direction={"column"}>
                        <form onSubmit={handleSubmit} style={{ flexDirection: 'column' }} className="flex">
                            <Textarea
                                disabled={isSending}
                                value={inputValue}
                                onChange={handleChange}
                                onKeyDown={handleKeyDown}
                                placeholder="Enter your question"
                            />
                            <Group justify="flex-end" mt="xs">
                                <Button style={{ height: 24, width: '100%' }} size='xs' type="submit" variant='gradient' gradient={{ from: 'orange', to: '#FF9D02', deg: 250 }} disabled={isSending}>
                                    {isSending ? 'Loading...' : 'Send'}
                                </Button>
                            </Group>
                        </form>
                    </Flex>
                </Flex>
            </AppShell.Section>
        </Flex>
    );
};
