"use client";
import Button from "./Button";
import formatDate from "@lib/format-date";
import load from "@lib/load";
import clsx from "clsx";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import ReactMarkdown from "react-markdown";
import { Block } from "app/_types/block";

interface BlockProps {
  compact?: boolean;
  block: Block;
}
export default function BlockComponent({ block, compact }: BlockProps) {
  const router = useRouter();

  const handleDelete = useCallback(async () => {
    const request = fetch(`/api/block/${block.block_id}`, {
      method: "DELETE",
    });
    await load(request, {
      loading: "Deleting...",
      success: "Deleted!",
      error: "Failed to delete.",
    });
    router.refresh();
  }, [block, router]);

  return (
    <div
      className={clsx(
        "flex items-start justify-between",
        compact ? "max-w-xs" : ""
      )}
    >
      <div className="flex flex-col gap-1">
        <Link className="flex items-center flex-1" href={`/block/${block.block_id}`}>
          <ReactMarkdown className="text-gray-600 line-clamp-1">
            {block.content}
          </ReactMarkdown>
        </Link>
        {!compact && (
          <p className="text-gray-500 text-sm">{formatDate(block.created_at)}</p>
        )}
      </div>
      {!compact && (
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            className="hover:text-red-500 hover:border-red-500 transition-colors"
            type="button"
            onClick={handleDelete}
          >
            Delete
          </Button>
        </div>
      )}
    </div>
  );
}