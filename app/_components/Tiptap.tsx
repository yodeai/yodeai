"use client";

import {
  BubbleMenu,
  useEditor,
  EditorContent,
  FloatingMenu,
} from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { lowlight } from "lowlight/lib/common";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { Markdown } from "tiptap-markdown";
import "@catppuccin/highlightjs/css/catppuccin-mocha.css";
import Placeholder from "@tiptap/extension-placeholder";
import { useCallback, useEffect } from "react";
import {
  FontBoldIcon,
  FontItalicIcon,
  ImageIcon,
  Link1Icon,
  StrikethroughIcon,
} from "@radix-ui/react-icons";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Typography from "@tiptap/extension-typography";
import Code from "@tiptap/extension-code";
import clsx from "clsx";
import { Editor } from "@tiptap/core";

interface TiptapProps {
  defaultValue: string;
  onChange?: (value: string) => void;
  editorRef?: React.MutableRefObject<Editor | undefined>;
}
export default function Tiptap({
  defaultValue,
  onChange,
  editorRef,
}: TiptapProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        history: false,
        // We directly include the code extension to allow exiting
        // inline code marks.
        // See https://github.com/ueberdosis/tiptap/issues/3813.
        code: false,
      }),
      Placeholder,
      CodeBlockLowlight.configure({
        lowlight,
      }),
      Markdown.configure({
        html: true,
        linkify: true,
      }),
      Code,
      Typography,
      Link,
      Image,
    ],
    content: defaultValue,
    onUpdate: ({ editor }) => {
      onChange?.(editor.storage.markdown.getMarkdown());
    },
  });

  useEffect(() => {
    if (editorRef && editor) {
      editorRef.current = editor;
    }
  }, [editor, editorRef]);

  // From https://tiptap.dev/api/marks/link
  const setLink = useCallback(() => {
    const previousUrl = editor?.getAttributes("link").href;
    const url = window.prompt("URL", previousUrl);

    if (url === null) {
      return;
    }

    if (url === "") {
      editor?.chain().focus().extendMarkRange("link").unsetLink().run();

      return;
    }

    editor
      ?.chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href: url })
      .run();
  }, [editor]);

  return (
    <>
      {editor && (
        <BubbleMenu
          className="bg-gray-900 text-white p-2 shadow-lg rounded-lg flex gap-2 border border-gray-950"
          editor={editor}
          tippyOptions={{ duration: 100 }}
        >
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={clsx(
              "p-2 rounded",
              editor.isActive("bold") && "bg-gray-700 text-blue-200"
            )}
          >
            <FontBoldIcon className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={clsx(
              "p-2 rounded",
              editor.isActive("italic") && "bg-gray-700 text-blue-200"
            )}
          >
            <FontItalicIcon className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={clsx(
              "p-2 rounded",
              editor.isActive("strike") && "bg-gray-700 text-blue-200"
            )}
          >
            <StrikethroughIcon className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => {
              if (editor.isActive("link")) {
                editor.chain().focus().unsetLink().run();
                return;
              }
              setLink();
            }}
            className={clsx(
              "p-2 rounded",
              editor.isActive("link") && "bg-gray-700 text-blue-200"
            )}
          >
            <Link1Icon className="h-5 w-5" />
          </button>
        </BubbleMenu>
      )}
      {editor && (
        <FloatingMenu
          className="bg-gray-900 text-white p-2 shadow-lg rounded-lg flex gap-2 border border-gray-950"
          tippyOptions={{ duration: 100 }}
          editor={editor}
        >
          <button
            type="button"
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 1 }).run()
            }
            className={
              editor.isActive("heading", { level: 2 }) ? "is-active" : ""
            }
          >
            <ImageIcon
              onClick={() => {
                const url = window.prompt("URL");

                if (url) {
                  editor.chain().focus().setImage({ src: url }).run();
                }
              }}
              className="h-5 w-5"
            />
          </button>
        </FloatingMenu>
      )}
      <EditorContent id="body" editor={editor} />
    </>
  );
}