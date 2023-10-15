"use client";

import 'easymde/dist/easymde.min.css';

import { Block } from "app/_types/block";
import { useEffect, useState } from "react";
import { useDebounce } from "usehooks-ts";
import load from "@lib/load";
import { useCallback } from "react";
import { TrashIcon } from "@radix-ui/react-icons";
import { useRouter } from "next/navigation";
import dynamic from 'next/dynamic';
import { useAppContext } from "@contexts/context";


const DynamicSimpleMDE = dynamic(
  () => import('react-simplemde-editor').then(mod => mod.SimpleMdeReact),
  { ssr: false, loading: () => <p>Loading editor...</p> }
);


export default function BlockEditor({ block: initialBlock }: { block?: Block }) {
  const router = useRouter();
  const [block, setBlock] = useState<Block | undefined>(initialBlock);
  const { lensId } = useAppContext();
  const [content, setContent] = useState(block?.content || "");
  const [title, setTitle] = useState(block?.title || "");
  const debouncedContent = useDebounce(content, 2000);
  const debouncedTitle = useDebounce(title, 2000);
  const [shouldRunEffect, setShouldRunEffect] = useState(false);

  let controller;

  const saveContent = async () => {
    if (controller) {
      controller.abort()
      console.log("ABORTED")
    }
    controller = new AbortController();
    const signal = controller.signal;

    let method: 'POST' | 'PUT';
    let endpoint: string;

    // If block exists and there are changes, update it
    if (block && (content !== block.content || title !== block.title)) {
      if (!block.block_id) { // if block_id is not present, it's a new block
        method = "POST";
        endpoint = `/api/block`;
      } else {
        method = "PUT";
        endpoint = `/api/block/${block.block_id}`;
      }
    }
    // If block doesn't exist, create a new block
    else if (!block && (content !== "" || title !== "")) {
      method = "POST";
      endpoint = `/api/block`;
    }
    // If neither condition is met, exit the function early
    else {
      return;
    }

    type RequestBodyType = {
      block_type: string;
      content: string;
      title: string;
      lens_id?: string; 
    };

    const requestBody: RequestBodyType = {
      block_type: "note",
      content: content,
      title: title,
    };

    if (lensId) {
      requestBody.lens_id = lensId;
    }

    const savePromise = fetch(endpoint, {
      method: method,
      body: JSON.stringify(requestBody),
      signal: signal
    })

    load(savePromise, {
      loading: "Saving...",
      success: "Saved!",
      error: "Failed to save."
    }, true)
      .then(async (response: Response) => {
        // Update the block state if a new block is created
        if (method === "POST" && response.ok) {
          const responseData = await response.json();
          const newBlock = responseData.data[0];
          setBlock(newBlock);
          if (lensId) {
            fetch(`/api/lens/${lensId}/getBlocks`)
            .then((response) => response.json())
            .then((data) => {
            })
            .catch((error) => {
              console.error("Error fetching block:", error);
            });
          } else {
            fetch('/api/block/getAllBlocks')
            .then((response) => response.json())
            .then((data) => {
            })
            .catch((error) => {
              console.error("Error fetching block:", error);
            });
          }
        }
      });
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
    let timeoutId;

    if (shouldRunEffect) {
      timeoutId = setTimeout(() => {
        saveContent();
      }, 5000); // 5000 milliseconds (5 seconds)
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [shouldRunEffect, debouncedContent, debouncedTitle]);

  // Set the flag to true after 5 seconds
  useEffect(() => {
    const initialDelay = setTimeout(() => {
      setShouldRunEffect(true);
    }, 5000); // 5000 milliseconds (5 seconds)

    return () => {
      clearTimeout(initialDelay);
    };
  }, []);




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
          {block && (
            <button onClick={handleDelete} className="no-underline gap-2 font-semibold rounded px-2 py-1 text-red-500 border-0">
              <TrashIcon className="w-6 h-6" />
            </button>
          )}
        </div>
      </div>
      <div className="min-w-full">
        <div className="prose text-gray-600">
          <DynamicSimpleMDE
            value={content}
            onChange={setContent}
          />
        </div>
        <button
          onClick={() => {
            saveContent();
            router.back();
          }}
          className="flex items-center mt-4 text-sm font-semibold rounded px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-slate-50 border border-emerald-600 shadow transition-colors">
          Save
        </button>
      </div>
    </div>
  );
}
