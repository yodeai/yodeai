// components/QuestionAnswerForm.tsx
"use client";

import { ChatMessage } from 'app/_types/chat';
import React, { useState, FormEvent } from 'react';
import { useAppContext } from "@contexts/context";
import { useRef, useEffect } from "react";
import { Box, Button, Flex, Group, ScrollArea, Text, Textarea } from '@mantine/core';
import InfoPopover from './InfoPopover';
import ToolbarHeader from './ToolbarHeader';
import { timeAgo } from '@utils/index';
import LoadingSkeleton from './LoadingSkeleton';
import { cn } from '@utils/style';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function LensChat() {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isSending, setIsSending] = useState<boolean>(false);
    const [inputValue, setInputValue] = useState<string>('');
    const { lensId, lensName } = useAppContext();

    const supabase = createClientComponentClient()

    const fetchLensChat = async () => {
        fetch(`/api/lens/${lensId}/chats`)
            .then(res => {
                if (!res.ok) {
                    throw new Error("Network response was not ok");
                } else {
                    return res.json();
                }
            })
            .then(data => {
                setMessages(data.data);
            })
            .catch(err => {
                console.log("Chat error:", err);
            })
            .finally(() => {
                setIsLoading(false);
            })
    }

    useEffect(() => {
        if (!lensId) {
            setMessages([]);
            return;
        }
        fetchLensChat();

        const channel = supabase
            .channel('schema-db-changes')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'lens_chats' }, fetchLensChat)
            .subscribe();

        return () => {
            if (channel) channel.unsubscribe();
        }
    }, [lensId])

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
                setMessages([...messages, data.data[0]]);
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

    const viewport = useRef<HTMLDivElement>(null);
    const scrollToBottom = () => {
        viewport.current!.scrollTo({ top: viewport.current!.scrollHeight, behavior: 'smooth' });
    }

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    return (
        <Flex
            direction={"column"}
            className="h-full w-full"
            justify={"space-between"}>
            <Box>
                <ToolbarHeader>
                    <Flex align="center" direction="row">
                        <Text size="sm">
                            {lensId && lensName
                                ? 'Context: ' + lensName
                                : "Ask a question "
                            }
                        </Text>
                        <InfoPopover infoText={"Ask a question and Yode will respond to it using the data in your blocks."} />
                    </Flex>
                </ToolbarHeader>

                <ScrollArea.Autosize p={10} scrollbarSize={0} type='scroll' viewportRef={viewport} className="h-[calc(100vh-225px)]">
                    {isLoading && (<LoadingSkeleton boxCount={8} lineHeight={50} />)}
                    {!isLoading && messages.map((message, index) => {
                        return <MessageBox key={index} message={message} />
                    })}
                </ScrollArea.Autosize>
            </Box>
            <Box className="relative">
                <Flex p={10} pt={0} direction={"column"}>
                    <Flex justify={'center'} pt={5} pb={0} direction={"column"}>
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
            </Box>
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
        cn("flex gap-0.5 my-3", selfMessage ? "justify-end" : "justify-start")
    }>
        {/* <span className="w-6 h-6 rounded-full bg-gray-600"></span> */}
        <div className={cn(
            "flex flex-col w-full max-w-[250px] p-3 border",
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