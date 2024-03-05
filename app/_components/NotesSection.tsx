"use client";
import React, { useState, useEffect } from 'react';
import InfoPopover from './InfoPopover';
import ToolbarHeader from './ToolbarHeader';
import { Flex, Text, Textarea } from '@mantine/core';

const NotesSection: React.FC = () => {
    const [content, setContent] = useState(() => {
        const savedContent = localStorage.getItem("notesContent");
        return savedContent ? savedContent : "type notes here...";
    });

    useEffect(() => {
        localStorage.setItem("notesContent", content);
    }, [content]);

    return (
        <Flex
            direction={"column"}
            className="h-full w-full"
            justify={"space-between"}
        >
            <ToolbarHeader>
                <Flex align="center" direction="row">
                    <Text size="sm">
                        Notepad
                    </Text>
                    <InfoPopover infoText={"Take notes here to remember key information as you switch between pages and spaces."} />
                </Flex>
            </ToolbarHeader>

            <Flex direction={"column"} style={{ overflow: 'scroll', height: '100vh' }}>
                <Textarea
                    styles={{
                        input: {
                            height: "100vh",
                            border: 'none',
                            borderRadius: '0px',
                        },
                        wrapper: {
                            border: 'none'
                        }
                    }}
                    value={content}
                    onChange={(event) => setContent(event.currentTarget.value)}
                />
            </Flex>
        </Flex>
    );
};

export default NotesSection;