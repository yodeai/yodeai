"use client";
import Button from "@components/Button";
import load from "@lib/load";
import clsx from "clsx";
import { useRouter } from "next/navigation";
import { ChangeEvent, FormEventHandler, useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Block } from "app/_types/block";
import { useAppContext } from "@contexts/context";
import toast from 'react-hot-toast';


async function uploadToS3(base64: string, fileType: string): Promise<any> {
  try {
    const response = await fetch('/api/uploadToS3', {
      method: 'POST',
      body: JSON.stringify({ file: base64, fileType: fileType }),
      headers: {
        'Content-Type': 'application/json'
      }
    });
    if (!response.ok) throw new Error('Failed to upload to S3');
    return await response.json();
  } catch (error) {
    toast.error(error.message);
    throw error;
  }
}

interface UploadData {
  title: string;
  content?: string;
  lens_id: string | null;
  block_type?: string;
  is_file?: boolean;
  file_url?: string;
  base64?: string;
  fileType?: string;
}

async function upload(data: UploadData): Promise<Block> {
  try {
    if (data.base64 && data.fileType) {
      const s3Response = await uploadToS3(data.base64, data.fileType);
      if (!s3Response.success) throw new Error('Failed to upload to S3');
      data.file_url = s3Response.data.Location;
    }

    const { base64, fileType, ...postData } = data;
    const request = fetch("/api/block", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(postData),
    });

    const { data: created } = await load(request, {
      loading: "Uploading...",
      success: "Uploaded!",
      error: "Failed to upload.",
    }).then((response: Response) => response.json());


    return created;
  } catch (error) {
    console.error(error);
    throw error; // Re-throw to be caught outside
  }
}


export default function UploadBlocks() {
  const router = useRouter();
  const [block, setBlock] = useState<string>("");
  const [files, setFiles] = useState<File[]>([]);
  const { lensId } = useAppContext();
  const [isUploading, setIsUploading] = useState(false);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop: (acceptedFiles) => {
      setFiles(acceptedFiles as File[]);
    },
    accept: {
      "text/markdown": [".md"],
      "application/pdf": [".pdf"],
    },
    maxFiles: 1,
  });

  const [title, setTitle] = useState<string>("new block");
  const uploadAndRedirect = useCallback(
    async (data: UploadData) => {
      try {
        const created = await upload(data);
        setFiles([]);
        setBlock("");
        setTitle("new block");
        router.refresh();
        if (!lensId)
          router.push(`/`);
        else
          router.push(`/lens/${lensId}`);
      } catch (error) {
        console.error("Error in uploadAndRedirect:", error);
        toast.error("There was an error uploading the file.");
      }
    },
    [router]
  );


  const handleFileUpload: FormEventHandler<HTMLFormElement> = useCallback(
    async (event) => {
      event.preventDefault();
      setIsUploading(true);
      
      try {
        if (files[0].type === "text/markdown") {
          const data = await files[0].text();
          uploadAndRedirect({
            title,
            content: data,
            lens_id: lensId
          });
        } else if (files[0].type === "application/pdf") {
          const reader = new FileReader();
          reader.onloadend = async () => {
            if (reader.result) {
              const base64 = (reader.result as string).split(',')[1];
              uploadAndRedirect({
                title: files[0].name,
                lens_id: lensId,
                block_type: "pdf",
                is_file: true,
                base64: base64,
                fileType: files[0].type
              });
            } else {
              throw new Error("Error reading the file.");
            }
          };
          reader.readAsDataURL(files[0]);
        } else {
          throw new Error("Unsupported file type.");
        }
      } catch (error) {
        console.error(error);
        toast.error(`Error: ${error}`);
      } finally {
        
      }
    },
    [files, uploadAndRedirect]
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
        Drag and drop a PDF file or click here to select.
      </div>
      {files.length > 0 && (
        <ul>
          {files.map((file) => (
            <li key={file.name}>{file.name}</li>
          ))}
        </ul>
      )}
      {files.length !== 0 && (
        <Button
          disabled={isUploading || files.length === 0}  
          className={clsx(files.length === 0 && "cursor-not-allowed")}
          variant="primary"
          type="submit"
        >
          {isUploading ? "Uploading..." : "Upload"} 
        </Button>
      )}
    </form>

  );
}