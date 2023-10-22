"use client";

import 'easymde/dist/easymde.min.css';

import { Block } from "app/_types/block";
import { useRef, useEffect, useState } from "react";
import { useDebounce } from "usehooks-ts";
import load from "@lib/load";
import { useCallback } from "react";
import { TrashIcon, CheckIcon } from "@radix-ui/react-icons";
import { useRouter } from "next/navigation";
import dynamic from 'next/dynamic';
import { useAppContext } from "@contexts/context";
import { FaCheckCircle } from 'react-icons/fa';
import PDFViewerIframe from "@components/PDFViewer";
import toast from "react-hot-toast";



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
  const debouncedContent = useDebounce(content, 1000);
  const debouncedTitle = useDebounce(title, 2000);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isInitialEdit, setIsInitialEdit] = useState(true);

  let controller;

  const saveContent = async (isAutoSave) => {
    if (isSaving) {
      return;
    }
    setIsSaving(true);
    if (controller) {
      controller.abort()
      console.log("ABORTED")
    }
    controller = new AbortController();
    const signal = controller.signal;

    let method: 'POST' | 'PUT';
    let endpoint: string;

    // If block exists and there are changes, update it
    if (block && (content !== block.content || title !== block.title) && (title !== "" || isAutoSave)) {
      if (!block.block_id) {
        method = "POST";
        endpoint = `/api/block`;
      } else {
        method = "PUT";
        endpoint = `/api/block/${block.block_id}`;
      }
    }
    // If block doesn't exist, create a new block
    else if (!block && (title !== "")) {
      //console.log("making block");
      method = "POST";
      endpoint = `/api/block`;
    }
    else if (title === "" && content !== "" && !isAutoSave) {
      toast.error("Title cannot be empty")
      return false;
    }
    // If neither condition is met, exit the function early
    else {
      return true;
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

    savePromise
      .then(async (response: Response) => {
        if (response.ok) {
          setIsSaved(true);
          setIsSaving(false);
        }
        if (method === "POST" && response.ok) {
          const responseData = await response.json();
          const newBlock = responseData.data[0];
          setBlock(newBlock);
          setIsInitialEdit(false);
        }
      })
      .catch(() => {
        setIsSaved(false);
        setIsSaving(false);
      });
      return true;
  };


  const savePDFtitle = async () => {
    const savePDFPromise = fetch(`/api/block/${block.block_id}`, {
      method: "PUT",
      body: JSON.stringify({
        title: title,
      }),
    });

    load(savePDFPromise, {
      loading: "Saving...",
      success: "Saved!",
      error: "Failed to save.",
    }).then(() => {
      router.push(`/block/${block.block_id}`);
    })
  }

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
        router.back();
      })
        .catch((error) => {
          console.error("Error deleting block:", error);
        });
    }
  }, [block, router]);

  // This is for the very beginning to make sure a block is created to prevent a future race condition.
  useEffect(() => {
    setIsSaved(false);
    // don't run this when first rendering the page.
    if (isInitialEdit) {
      setIsInitialEdit(false);
      return;
    }
    if (isInitialEdit && !isSaving) {
      saveContent(true);
    }
  }, [content, title]);


  useEffect(() => {
    console.log("Checking")
    if (!isInitialEdit) {
      saveContent(true);
      console.log("Saved content")
    }
  }, [debouncedContent, debouncedTitle]);






  return (
    <div className="flex flex-col gap-1 w-full">


      {block && block.block_type === 'pdf' ? (
        <>
          <div className="flex justify-between items-center w-full">
            <input
              className="text-gray-600 line-clamp-1 text-xl flex-grow"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter title..."
            />
            <div className="flex gap-2">
              <button onClick={() => { savePDFtitle(); }} className="no-underline gap-2 font-semibold rounded px-2 py-1 bg-white text-gray-400 border-0 ml-4">
                <CheckIcon className="w-6 h-6" />
              </button>

              {block && (
                <button onClick={handleDelete} className="no-underline gap-2 font-semibold rounded px-2 py-1 text-red-500 border-0">
                  <TrashIcon className="w-6 h-6" />
                </button>
              )}
            </div>


          </div>
        </>

      ) : (
        <>
          <div className="flex justify-between items-center w-full">
            <input
              className="text-gray-600 line-clamp-1 text-xl"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter title..."
            />
            <div className="flex gap-2">
              {isSaved && (
                <div className="flex items-center text-green-500">
                  <FaCheckCircle className="w-4 h-4 mr-2" /> Saved
                </div>
              )}
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
                saveContent(false).then(result => {
                  console.log("Success", result); // Log the result inside the `then` block
                  if (result) {
                    router.back();
                  }
                });
              }}
              className="flex items-center mt-4 text-sm font-semibold rounded px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-slate-50 border border-emerald-600 shadow transition-colors">
              Save
            </button>
          </div>
        </>
      )}

    </div>
  );
}
