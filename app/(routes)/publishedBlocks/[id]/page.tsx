"use client";

import { notFound } from "next/navigation";
import ReactMarkdown from 'react-markdown';
import formatDate from "@lib/format-date";
import { Pencil2Icon } from "@radix-ui/react-icons";
import { useState } from 'react';
import { Block } from 'app/_types/block';
import { useEffect } from 'react';
import BlockEditor from '@components/BlockEditor';
import Link from "next/link";
import PDFViewerIframe from "@components/PDFViewer";
import { useRouter } from "next/navigation";

export default function Block({ params }: { params: { id: string } }) {
  const [block, setBlock] = useState<Block | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [presignedUrl, setPresignedUrl] = useState<string | null>(null);
  const router = useRouter();


  useEffect(() => {
    fetch(`/api/publishedBlocks/${params.id}`)
    .then((response) => {
      if (!response.ok) {
        console.log("Error fetching url dana")
        setLoading(false);
        router.push("/notFound")
      } else {
        response.json().then((data) => {
          setBlock(data.data);
          setLoading(false);
        })
      }
    })
      
  }, [params.id]);


  useEffect(() => {
    async function fetchPresignedUrl() {
      if (block && block.block_type === "pdf") {
        const url = await getPresignedUrl(block.file_url);
        setPresignedUrl(url);
      }
    }

    fetchPresignedUrl();
  }, [block]);


  if (loading || !block) {
    return (
      <div className="skeleton-container p-8 mt-12 ">
        <div className="skeleton line  "></div>
      </div>
    );
  }



  const renderContent = () => {
    if (block && block.block_type === "pdf" && presignedUrl) {
      return <PDFViewerIframe url={presignedUrl} />;
    } else {
      return (
        <ReactMarkdown className="prose text-gray-600">
          {block.content}
        </ReactMarkdown>
      );
    }
  }



  async function getPresignedUrl(key) {
    const response = await fetch(`/api/getPresignedUrl?key=${key}`);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return data.data;
  }

  return (
    <main className="container">
      <div className="w-full flex flex-col p-8">
        <div className="flex items-start justify-between p-8 rounded-md bg-white border border-gray-200 mb-4 mt-12">
            <>
              <div className="flex flex-col gap-1 w-full">
                <div className="flex justify-between items-center w-full">
                  <Link className="flex items-center flex-1" href={`/publishedBlocks/${block.block_id}`}>
                    <ReactMarkdown className="prose text-gray-600 line-clamp-1 text-xl">
                      {block.title}
                    </ReactMarkdown>
                  </Link>
                  <div className="flex gap-2">
                    
                  </div>
                </div>
                <div className="min-w-full">
                  <div className="min-w-full">
                    <p className="text-gray-500 text-sm">{formatDate(block.updated_at)}</p>
                    {renderContent()}
                  </div>
                </div>
              </div>
            </>
      
        </div>
      </div>
    </main>

  );
}
