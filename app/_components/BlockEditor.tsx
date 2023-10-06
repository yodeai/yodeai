"use client";
import Tiptap from "@components/Tiptap";

import SimpleMDE from 'react-simplemde-editor';

import { Block } from "app/_types/block";
import { useEffect, useState } from "react";
import { useDebounce } from "usehooks-ts";
import formatDate from "@lib/format-date";
import load from "@lib/load";
import { useCallback } from "react";
import { TrashIcon } from "@radix-ui/react-icons";
import { useRouter } from "next/navigation";

export default function BlockEditor({ block }: { block: NonNullable<Block> }) {
  const router = useRouter();
  const [content, setContent] = useState(block.content);
  const [title, setTitle] = useState(block.title);
  const debouncedContent = useDebounce(content, 2000);
  const debouncedTitle = useDebounce(title, 2000);

  const saveContent = () => {
    if (content !== block.content || title !== block.title) {
      const savePromise = fetch(`/api/block/${block.block_id}`, {
        method: "PUT",
        body: JSON.stringify({ content: content, title: title }),
      });
      load(savePromise, {
        loading: "Saving...",
        success: "Saved!",
        error: "Failed to save.",
      });
    }
  };
  const handleDelete = useCallback(() => {
    if (block && window.confirm("Are you sure you want to delete this block?")) {
      const deletePromise = fetch(`/api/block/${block.block_id}`, {
        method: "DELETE",
      })
        .then(response => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response;
        });

      load(deletePromise, {
        loading: "Deleting...",
        success: "Deleted!",
        error: "Failed to delete.",
      }).then(() => {
        router.push('/');
      })
        .catch((error) => {
          console.error("Error deleting block:", error);
        });
    }
  }, [block, router]);

  useEffect(() => {
    saveContent();
  }, [debouncedContent, debouncedTitle]);


  return (
    <div className="flex flex-col gap-1 w-full">
      <div className="flex justify-between items-center w-full">
        <input
          className="text-gray-600 line-clamp-1 text-xl"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter title..."
        />
        <div className="flex gap-2">
          <button onClick={handleDelete} className="no-underline gap-2 font-semibold rounded px-2 py-1  text-red-500 border-0">
            <TrashIcon className="w-6 h-6" />
          </button>
        </div>
      </div>
      <div className="min-w-full">
        <p className="text-gray-500 text-sm">{formatDate(block.created_at)}</p>
        <div className="text-gray-600">
          {/* <Tiptap defaultValue={content} onChange={(t) => setContent(t)} /> */}
          <SimpleMDE
            value={content}
            onChange={(t) => setContent(t)}
            options={{
              // You can customize options here
              spellChecker: true,
            }}
          />
        </div>
        <button
          onClick={saveContent}
          className="flex items-center mt-4 text-sm font-semibold rounded px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-slate-50 border border-emerald-600 shadow transition-colors">
          Save
        </button>
      </div>
    </div>
  );
}
