"use client";
import formatDate from "@lib/format-date";
import clsx from "clsx";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { Block } from "app/_types/block";
import BlockLenses from "@components/BlockLenses";


interface BlockProps {
  compact?: boolean;
  block: Block;
}
export default function BlockComponent({ block, compact }: BlockProps) {

  const firstTwoLines = block.content.split('\n').slice(0, 2).join('\n');
  return (
    <div
      className={clsx(
        " items-start justify-between elevated-block p-4 rounded-md bg-white border border-gray-200 mb-4",
        compact ? "max-w-xs" : ""
      )}
    >
      <div className="flex flex-col gap-1">
        <Link className="flex items-center flex-1 no-underline" href={`/block/${block.block_id}`}>
          <div className="prose text-gray-600 line-clamp-1">
            <strong>{block.title}</strong>
          </div>
        </Link>
        {block.status === 'processing' ? (<span className="processing-text">[Processing...]</span>) : ''}
        {block.inLenses && (
          <BlockLenses lenses={block.inLenses} block_id={block.block_id} />
        )}
        {!compact ? (
          <>
            <p className="text-gray-500 text-sm">{formatDate(block.updated_at)}</p>
            <div className="prose text-gray-600 line-clamp-2">
              {firstTwoLines}
            </div>

          </>
        ) : null}
      </div>


    </div >
  );
}
