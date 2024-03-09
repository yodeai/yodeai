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
        return savedContent ? savedContent : `
        <h2 style="text-align: center;">Welcome to Yodeai</h2>
        <p>You are a <strong>product manager</strong> at <a href="https://notion.so/" rel="noopener noreferrer" target="_blank">Notion</a></p>
        <p>You are doing review/interview analysis of Notion's users to come up with new feature/bug fix proposals. Please follow these steps to complete the task!</p>
        <p></p>
        <p><strong>Step 1: </strong>Please take 3 min to look over the documents for both the user interviews and the app store reviews to get a sense of their structure, format, and content.</p>
        <p></p>
        <p><strong>Step 2: </strong>Then, using the user insights widget, pick the top 6 new feature/bug fix proposals. Feel free to generate as many widgets as you would like, with a mix of predefined areas or auto-generated ones.</p>
        <ul>
            <li>Feature 1</li>
            <li>Feature 2</li>
            <li>Feature 3</li>
            <li>Feature 4</li>
            <li>Feature 5</li>
            <li>Feature 6</li>
        </ul>
        <p></p>
        <p><strong>Step 3: </strong>Now, using the pain point tracker widget and the Q&A, as well as the user insights widget, narrow the features/bug fixes down to the top 3. Again, feel free to generate as many widgets as you would like. Please add explanations and citations to each proposed feature.</p>
        <ul>
            <li>Feature 1</li>
            <li>Feature 2</li>
            <li>Feature 3</li>
        </ul>
    `;
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