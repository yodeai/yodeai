"use client";

import 'easymde/dist/easymde.min.css';

import { Block } from "app/_types/block";
import { useRef, useEffect, useState } from "react";
import { useDebounce } from "usehooks-ts";
import load from "@lib/load";
import { useCallback } from "react";
import { TrashIcon, CheckIcon } from "@radix-ui/react-icons";
import { usePathname, useRouter } from "next/navigation";
import dynamic from 'next/dynamic';
import { useAppContext } from "@contexts/context";
import { FaCheck, FaCheckCircle, FaTrashAlt } from 'react-icons/fa';
import PDFViewerIframe from "@components/PDFViewer";
import toast from "react-hot-toast";
import { ActionIcon, Button, Flex, Text, TextInput, Select } from '@mantine/core';
import { getUserInfo, fetchGoogleDocContent } from '@utils/googleUtils';
import { RequestBodyType } from '@api/types';
import axios from 'axios'




const DynamicSimpleMDE = dynamic(
  () => import('react-simplemde-editor').then(mod => mod.SimpleMdeReact),
  { ssr: false, loading: () => <p>Loading editor...</p> }
);

type BlockEditorProps = {
  block?: Block;
  onSave?: (block: Block) => void;
}

export default function BlockEditor({ block: initialBlock, onSave }: BlockEditorProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [block, setBlock] = useState<Block | undefined>(initialBlock);
  const { lensId } = useAppContext();
  const [documentType, setDocumentType] = useState(block?.block_type || 'note');

  const [content, setContent] = useState(block?.content || "");

  const [title, setTitle] = useState(block?.title || "");
  const debouncedContent = useDebounce(content, 500);
  const debouncedTitle = useDebounce(title, 1000);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [googleDocId, setGoogleDocId] = useState(block?.google_doc_id || null)
  const [googleUserId, setGoogleUserId] = useState(block?.google_user_id || 'global')
  const [isLoadingContent, setIsLoadingContent] = useState(false);

  useEffect(() => {
    const updateGoogleDocContent = async () => {
      if (documentType === 'google_doc' && block?.google_doc_id!= null) {
        setIsLoadingContent(true); // Set loading state when fetching content
        try {
          // bring in updated content
          let fetchedContent = await fetchGoogleDocContent(block.google_doc_id);
          setContent(fetchedContent);
        } finally {
          setIsLoadingContent(false); // Reset loading state after content is fetched
        }
      }
      if (!block || block.google_user_id === 'global') setGoogleUserId(await getUserInfo());
    };

    updateGoogleDocContent();
  }, []);


  const fetchEndIndex = async(documentId) => {
    try {
      const response = await fetch(`/api/google/getEndIndex/${documentId}`)
      if (response.ok) {
        // Assuming the document content is in plain text
        const content = await response.json();
        return content.data
      } else {
        console.error("Failed to fetch Google Doc index:", response.statusText);
        return -1;
      }
    } catch (error) {
      console.error("Error fetching Google Doc index:", error.message);
      return -1;
    }

  }

  //let controller;
  const saveContent = async (delay = 180) => {
    console.log("delay", delay)
    let method: 'POST' | 'PUT';
    let endpoint: string;
    // If block exists and there are changes, update it
    if (block && (content !== block.content || title !== block.title || delay == 0)) {
      if (!block.block_id) {
        console.log("in old block")
        method = "POST";
        endpoint = `/api/block`;
      } else {
        console.log("in put")
        method = "PUT";
        endpoint = `/api/block/${block.block_id}`;
      }
    }
    // If block doesn't exist, create a new block
    else if (!block && (content !== "" || title !== "" || delay === 0)) {
      console.log("in new block")
      method = "POST";
      endpoint = `/api/block`;
    }
    // If neither condition is met, exit the function early
    else {
      return true;
    }
    setIsSaving(true);
    let google_doc_id = googleDocId
    if (documentType == "google_doc") {
      if (google_doc_id == null) {
        // write to google docs
        const response = await fetch(`/api/google/createDoc`,{ 
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title })})
        if (!response.ok) {
          console.error("Error creating google doc")
        } else {
          let data = await response.json()
          google_doc_id = data["google_doc_id"]
          setGoogleDocId(google_doc_id)
          console.log("created google doc", google_doc_id)
        }
      }
      let oldContent = await fetchGoogleDocContent(google_doc_id);
      if (oldContent != content) {
        let endIndex = await fetchEndIndex(google_doc_id);
        if (endIndex == -1) {
          console.error("Error getting end index")
          return
        }
        
        const response = await fetch(`/api/google/updateDoc`, {
        method: "PUT",
        headers: {
          'Content-Type': 'application/json',
          // Add any other necessary headers, such as authorization, if required
        },
        body: JSON.stringify({ google_doc_id, content, oldContent, title, endIndex })})
        if (!response.ok) {
          console.error("Error updating google doc")
          return
        } else {
          console.log("updated google doc")
        }
      }
    }

    const requestBody: RequestBodyType = {
      block_type: documentType,
      content: content,
      title: (title ? title : "Untitled"),
      delay: delay,
      google_doc_id: google_doc_id,
      google_user_id: documentType == "google_doc" ? googleUserId : 'global'
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

      if (response.ok) {
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

    if(pathname === "/new"){
      router.push(`/block/${block.block_id}`);
      return;
    }

    return onSave({ ...block, title: title, content: content });
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
        <div className="flex flex-col w-full">
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

            <div className="flex justify-between items-center w-full mt-1">
              <Select
                size="xs"
                data={[
                  { label: "Note", value: "note" },
                  { label: "Google Doc", value: "google_doc" },
                  // Add more document types as needed
                ].filter(option => googleUserId != null || option.value !== "google_doc")}
                value={documentType}
                onChange={(value) => setDocumentType(value)}
              />
            </div>

  
          {isLoadingContent ? (
            <p>Updating google doc content...</p>
          ) : (
            <div className="min-w-full mt-1">
              <div className="prose text-gray-600">
                <DynamicSimpleMDE
                  value={content}
                  onChange={setContent}
                />
              </div>
  
              <div>
                <Button
                  style={{ flex: 1, width: "100%", height: 30 }}
                  onClick={handleSaveAndNavigate}
                  variant="gradient"
                  gradient={{ from: 'green', to: 'lime', deg: 150 }}
                  disabled={isSaving}
                >
                  {isSaving ? "Saving..." : "Save"}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
  
}
