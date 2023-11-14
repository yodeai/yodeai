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
import { FaCheck, FaCheckCircle, FaTrashAlt } from 'react-icons/fa';
import PDFViewerIframe from "@components/PDFViewer";
import toast from "react-hot-toast";
import { ActionIcon, Button, Flex, Text, TextInput } from '@mantine/core';



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
  const debouncedContent = useDebounce(content, 500);
  const debouncedTitle = useDebounce(title, 1000);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);


  //let controller;

  const saveContent = async (delay = 180) => {

    /*
    if (controller) {
      controller.abort()
      console.log("ABORTED")
    }
    controller = new AbortController();
    const signal = controller.signal;*/
    console.log("delay", delay)
    let method: 'POST' | 'PUT';
    let endpoint: string;
    // If block exists and there are changes, update it
    if (block && (content !== block.content || title !== block.title)) {
      if (!block.block_id) {
        method = "POST";
        endpoint = `/api/block`;
      } else {
        console.log("IN HERE")
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
      return true;
    }
    setIsSaving(true);

    type RequestBodyType = {
      block_type: string;
      content: string;
      title: string;
      lens_id?: string;
      delay: number;
    };

    const requestBody: RequestBodyType = {
      block_type: "note",
      content: content,
      title: (title ? title : "Untitled"),
      delay: delay
    };

    if (lensId) {
      requestBody.lens_id = lensId;
    }

    const savePromise = fetch(endpoint, {
      method: method,
      body: JSON.stringify(requestBody)
    })

    try {
      const response = await savePromise;
      // create artificial two second delay for testing
      //await new Promise(r => setTimeout(r, 3000));
      if (response.ok) {
        setIsSaved(true);
        setIsSaving(false);
      }

      if (method === "POST" && response.ok) {
        const responseData = await response.json();
        const newBlock = responseData.data[0];
        setBlock(newBlock);
      }
    } catch (error) {
      setIsSaved(false);
      setIsSaving(false);
    }

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

  // auto-save
  useEffect(() => {
    if (!isSaving)
      saveContent();
  }, [debouncedContent, debouncedTitle]);

  useEffect(() => {
    setIsSaved(false);
  }, [content, title]);

  // when the save button is clicked on the block editor
  const handleSaveAndNavigate = async () => {
    // remove the "saved" sign
    setIsSaved(false);
    if (isSaving) {
      // If isSaving is true, wait for it to become false
      while (isSaving) {
        await new Promise((resolve) => setTimeout(resolve, 100)); // Wait for 100 milliseconds
      }
    }

    // Save one last time
    await saveContent(0);

    // Navigate back using the router
    if (lensId) {
      router.back();
    } else {
      router.push(`/`);
    }
    // router.back();
  };



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
            <Flex direction={"column"}>
              <ActionIcon
                onClick={() => { savePDFtitle(); }}
                size="md"
                color="green"
                variant="gradient"
                ml={5}
                gradient={{ from: 'green', to: 'lime', deg: 116 }}
              >
                <FaCheck size={14} />
              </ActionIcon>

              {block && (
                <ActionIcon
                  onClick={handleDelete}
                  size="md"
                  color="red"
                  variant="gradient"
                  ml={5}
                  gradient={{ from: 'red', to: 'pink', deg: 255 }}
                >
                  <FaTrashAlt size={14} />
                </ActionIcon>
              )}
            </Flex>


          </div>
        </>

      ) : (
        <>
          <div className="flex justify-between items-center w-full">
            <TextInput
              style={{ flex: 1 }}
              size="xs"
              value={title || ""}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter title..."
            />

            <div className="flex gap-2">
              {isSaving && (
                <Flex miw={40} ml={10} align={"center"} c={"green"}>
                  <FaCheckCircle style={{ marginRight: 4 }} /> Saving...
                </Flex>
              )}
              {isSaved && (
                <Flex miw={40} ml={10} align={"center"} c={"green"}>
                  <FaCheckCircle style={{ marginRight: 4 }} /> Saved
                </Flex>
              )}
              {block && (
                <ActionIcon
                  onClick={handleDelete}
                  size="md"
                  color="red"
                  variant="gradient"
                  ml={5}
                  gradient={{ from: 'red', to: 'pink', deg: 255 }}
                >
                  <FaTrashAlt size={14} />
                </ActionIcon>
              )}
            </div>
          </div>


          <div className="min-w-full mt-1">
            <div className="prose text-gray-600">
              <DynamicSimpleMDE
                value={content}
                onChange={setContent}
              />
            </div>


            {
              <Button
                style={{ flex: 1, width: "100%", height: 30 }}
                onClick={handleSaveAndNavigate}
                variant="gradient"
                gradient={{ from: 'green', to: 'lime', deg: 150 }}
                disabled={isSaving}
              >
                {isSaving ? (
                  // Display loading indicator while saving
                  "Saving..."
                ) : (
                  // Display "Save" text when not saving
                  "Save"
                )}
              </Button>
            }

          </div>
        </>
      )}

    </div>
  );
}
