"use client";
import React, { useState, useEffect } from 'react';
import InfoPopover from './InfoPopover';
import ToolbarHeader from './ToolbarHeader';
import { Flex, Text, Textarea } from '@mantine/core';

import { RichTextEditor, Link } from '@mantine/tiptap';
import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';

const NotesSection: React.FC = () => {
    const [content, setContent] = useState(() => {
        const savedContent = localStorage.getItem("notesContent");
        return savedContent ? savedContent : `<h2 style="text-align: center;">Welcome to Yodeai</h2><p>You are a <strong>product manager</strong> at <a href="https://notion.so/" rel="noopener noreferrer" target="_blank">Notion</a></p><p>You are doing pain point & analysis of Notion's users.</p><p>Below is a sample format. If you don't like this format for analysis/insights, please feel free to change it!</p><h3>What are the main user goals?</h3><ul><li>...</li><li>...</li><li>...</li></ul><h3>What are the main user needs?</h3><ul><li>...</li><li>...</li><li>...</li></ul><h3>What are the main user pain points?</h3><ul><li>...</li><li>...</li><li>...</li></ul>`;
    });

    useEffect(() => {
        localStorage.setItem("notesContent", content);
    }, [content]);

    const editor = useEditor({
        extensions: [
            StarterKit,
            TextAlign,
            Link,
            TextAlign.configure({ types: ['heading', 'paragraph'] }),
        ],
        content,
        onUpdate: ({ editor }) => {
            setContent(editor?.getHTML());
        },
    });

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
                <RichTextEditor editor={editor} style={{ borderRadius: 0, border: 'none' }}>
                    <RichTextEditor.Toolbar sticky>
                        <RichTextEditor.ControlsGroup>
                            <RichTextEditor.Bold />
                            <RichTextEditor.Italic />
                            <RichTextEditor.Underline />
                            <RichTextEditor.Strikethrough />
                            <RichTextEditor.ClearFormatting />
                            <RichTextEditor.Highlight />
                            <RichTextEditor.Code />
                        </RichTextEditor.ControlsGroup>

                        <RichTextEditor.ControlsGroup>
                            <RichTextEditor.H1 />
                            <RichTextEditor.H2 />
                            <RichTextEditor.H3 />
                            <RichTextEditor.H4 />
                        </RichTextEditor.ControlsGroup>

                        <RichTextEditor.ControlsGroup>
                            <RichTextEditor.Blockquote />
                            <RichTextEditor.Hr />
                            <RichTextEditor.BulletList />
                            <RichTextEditor.OrderedList />
                            <RichTextEditor.Subscript />
                            <RichTextEditor.Superscript />
                        </RichTextEditor.ControlsGroup>

                        <RichTextEditor.ControlsGroup>
                            <RichTextEditor.Link />
                            <RichTextEditor.Unlink />
                        </RichTextEditor.ControlsGroup>

                        <RichTextEditor.ControlsGroup>
                            <RichTextEditor.AlignLeft />
                            <RichTextEditor.AlignCenter />
                            <RichTextEditor.AlignJustify />
                            <RichTextEditor.AlignRight />
                        </RichTextEditor.ControlsGroup>
                    </RichTextEditor.Toolbar>

                    <RichTextEditor.Content />
                </RichTextEditor>
                {/* <Textarea
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
                /> */}
            </Flex>
        </Flex>
    );
};

export default NotesSection;