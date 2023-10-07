"use client";
import Button from "@components/Button";
import load from "@lib/load";
import clsx from "clsx";
import { useRouter } from "next/navigation";
import { ChangeEvent, FormEventHandler, useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import TextareaAutosize from "react-textarea-autosize";
import * as Tabs from "@radix-ui/react-tabs";
import { Block } from "app/_types/block";
import { useLens } from "@contexts/lensContext";

async function upload(data: { title: string; content: string; lens_id: string | null }): Promise<Block> {
  const request = fetch("/api/block", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ block_type: "note", title: data.title, content: data.content, lens_id: data.lens_id }),
  });

  const { data: created } = await load(request, {
    loading: "Uploading...",
    success: "Uploaded!",
    error: "Failed to upload.",
  }).then((response) => response.json());

  return created;
}

export default function UploadBlocks() {
  const router = useRouter();
  const [block, setBlock] = useState<string>("");
  const [files, setFiles] = useState<File[]>([]);
  const { lensId } = useLens();

  const { getRootProps, getInputProps } = useDropzone({
    onDrop: (acceptedFiles) => {
      setFiles(acceptedFiles as File[]);
    },
    accept: {
      "text/markdown": [".md"],
    },
    maxFiles: 1,
  });
 
  const [title, setTitle] = useState<string>("new block");
  const uploadAndRedirect = useCallback(
    async (data: { title: string; content: string; lens_id: string | null }) => {
      const created = await upload(data);
      setFiles([]);
      setBlock("");
      setTitle("new block");
      router.refresh();
      if (!lensId)
        router.push(`/`);
      else
        router.push(`/lens/${lensId}`);
    },
    [router]
  );
  const handleFileUpload: FormEventHandler<HTMLFormElement> = useCallback(
    async (event) => {
      event.preventDefault();

      const data = await files[0].text();
      uploadAndRedirect({
        title,
        content: data,
        lens_id: lensId
      });
    },
    [files, uploadAndRedirect, title]
  );


  return (
    
        
      
        <form
          className="flex flex-col gap-4 items-start"
          encType="multipart/form-data"
          onSubmit={handleFileUpload}
        >
          <div
            {...getRootProps({
              className:
                "w-full min-h-[200px] border-2 border-dashed rounded text-gray-600 p-4 flex flex-col gap-2 items-center justify-center cursor-pointer",
            })}
          >
            <input {...getInputProps()} />
            Drag and drop some Markdown files or click to select.
          </div>
          {files.length > 0 && (
            <ul>
              {files.map((file) => (
                <li key={file.name}>{file.name}</li>
              ))}
            </ul>
          )}
          <Button
            disabled={files.length === 0}
            className={clsx(files.length === 0 && "cursor-not-allowed")}
            variant="primary"
            type="submit"
          >
            Upload
          </Button>
        </form>
      
  );
}