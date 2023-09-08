"use client";
import Button from "./Button";
import formatDate from "@lib/format-date";
import load from "@lib/load";
import clsx from "clsx";
import Link from "next/link";
import { useCallback } from "react";
import ReactMarkdown from "react-markdown";
import { Block } from "app/_types/block";
import BlockLenses from "@components/BlockLenses";

interface BlockProps {
  compact?: boolean;
  block: Block;
}
export default function BlockComponent({ block, compact }: BlockProps) {
 
  return (
    <div
      className={clsx(
        "flex items-start justify-between elevated-block p-4 rounded-md bg-white border border-gray-200 mb-4",
        compact ? "max-w-xs" : ""
      )}
    >
      <div className="flex flex-col gap-1">
        <Link className="flex items-center flex-1" href={`/block/${block.block_id}`}>
          <ReactMarkdown className="text-gray-600 line-clamp-1">
            {block.title}
          </ReactMarkdown>
        </Link>
        {block.inLenses  && (
          <BlockLenses lenses={block.inLenses} />  
        )}
        {!compact ? (
          <>
            <p className="text-gray-500 text-sm">{formatDate(block.created_at)}</p>
            <div className="text-gray-600 line-clamp-2">
              <ReactMarkdown>
                {block.content}
              </ReactMarkdown>
            </div>

          </>
        ) : null}
      </div>

      {
        !compact && (
          <div className="flex items-center gap-2">

          </div>
        )
      }
    </div >
  );
}