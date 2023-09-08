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


export default function Block({ params }: { params: { id: string } }) {
  const [block, setBlock] = useState<Block | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetch(`/api/block/${params.id}`)
      .then((response) => response.json())
      .then((data) => {
        setBlock(data.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching block:", error);
        setLoading(false);
        notFound();
      });
  }, [params.id]);


  if (loading || !block) {
    return (
      <div className="skeleton-container p-8 mt-12 ">
        <div className="skeleton line  "></div>
      </div>
    );
  }


  return (
    <main className="container">
      <div className="w-full flex flex-col p-8">
        <div className="flex items-start justify-between elevated-block p-8 rounded-md bg-white border border-gray-200 mb-4 mt-12">
          {!isEditing ? (
            <>
              <div className="flex flex-col gap-1 w-full">
                <div className="flex justify-between items-center w-full">
                  <Link className="flex items-center flex-1" href={`/block/${block.block_id}`}>
                    <ReactMarkdown className="text-gray-600 line-clamp-1 text-xl">
                      {block.title}
                    </ReactMarkdown>
                  </Link>
                  <div className="flex gap-2">
                    <button onClick={() => setIsEditing(!isEditing)} className="no-underline gap-2 font-semibold rounded px-2 py-1 bg-white text-gray-400 border-0">
                      <Pencil2Icon className="w-6 h-6" />
                    </button>
                  </div>
                </div>
                <div className="min-w-full">
                  <p className="text-gray-500 text-sm">{formatDate(block.created_at)}</p>
                  <div className="text-gray-600">
                    <ReactMarkdown>{block.content}</ReactMarkdown>
                  </div>
                </div>
              </div>

            </>
          ) : (
            <BlockEditor block={block} />
          )}
        </div>
      </div>
    </main>

  );
}
