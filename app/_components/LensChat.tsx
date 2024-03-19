// components/QuestionAnswerForm.tsx
"use client";

import React, { useState, FormEvent, useMemo } from 'react';
import { ChatMessage } from 'app/_types/chat';
import { useAppContext } from "@contexts/context";
import { useRef, useEffect } from "react";
import { AppShell, Box, Button, Divider, Flex, Group, ScrollArea, Text, Textarea } from '@mantine/core';
import InfoPopover from './InfoPopover';
import ToolbarHeader from './Layout/Aside/ToolbarHeader';
import { timeAgo } from '@utils/index';
import LoadingSkeleton from './LoadingSkeleton';
import { cn } from '@utils/style';
import Gravatar from 'react-gravatar';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useDebouncedCallback } from 'app/_hooks/useDebouncedCallback';

const MESSAGE_LIMIT = 25;

export default function LensChat() {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isSending, setIsSending] = useState<boolean>(false);
    const [inputValue, setInputValue] = useState<string>('');
    const [hasMore, setHasMore] = useState<boolean>(true);
    const { lensId, lensName, user } = useAppContext();

    const supabase = createClientComponentClient()

    const $loadMore = useRef<HTMLDivElement>(null);
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
                setMessages(_messages => [...data.data.messages, ..._messages]);
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

            $loadMore.current = null;
            $offset.current = 0;
            $hasMore.current = false;
            $fetching.current = false;
        }
    }, [lensId, user]);

    useEffect(() => {
        if (!$loadMore.current) return;

        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && $hasMore.current && $fetching.current === false) {
                $offset.current += MESSAGE_LIMIT;
                fetchLensChat();
            }
        }, {
            root: null,
            rootMargin: '0px',
            threshold: 1.0
        })

        observer.observe($loadMore.current);
        return () => {
            observer.disconnect();
        }
    }, [lensId, $loadMore.current])

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
            <Box className="flex h-full flex-col-reverse gap-3 py-0 px-3 overflow-scroll">
                {messages.map((message, index) => {
                    return <MessageBox key={index} message={message} />
                })}
                {isLoading && (<LoadingSkeleton boxCount={$offset?.current ? 1 : 8} lineHeight={80} />)}
                {hasMore && <div ref={$loadMore} className="loadMore h-8 w-full" />}
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

type MessageBoxProps = {
    message: ChatMessage;
}
const MessageBox = (props: MessageBoxProps) => {
    const { message } = props;
    const { user } = useAppContext();

    const selfMessage = message.users.id === user?.id;

    return <div className={
        cn("flex gap-1.5", selfMessage ? "justify-end" : "justify-start")
    }>
        <Gravatar email={message.users.email} size={32} className="rounded-md" />
        <div className={cn(
            "flex flex-col w-full p-2 border",
            selfMessage
                ? "bg-indigo-600 border-indigo-700 text-gray-200 rounded-s-xl rounded-se-xl"
                : "bg-gray-200 border-gray-300 text-gray-800 rounded-e-xl rounded-es-xl"
        )}>
            <div className="flex items-center justify-between">
                <span className="truncate text-sm font-semibold">{message.users.email}</span>
                <span className="truncate text-sm font-normal ">{timeAgo(message.created_at)}</span>
            </div>
            <p className="text-sm font-normal whitespace-break-spaces">{message.message.trim()}</p>
        </div>
    </div>
}