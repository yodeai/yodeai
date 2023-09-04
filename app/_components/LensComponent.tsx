"use client";
import Button from "@components/Button";
import formatDate from "@lib/format-date";
import load from "@lib/load";
import clsx from "clsx";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import ReactMarkdown from "react-markdown";
import { Lens } from "app/_types/lens";
import { ShadowInnerIcon } from "@radix-ui/react-icons";

interface LensProps {
  compact?: boolean;
  lens: Lens;
}
export default function LensComponent({ lens, compact }: LensProps) {
  const router = useRouter();

  const handleDelete = useCallback(async () => {
    const request = fetch(`/api/blocks/${lens.lens_id}`, {
      method: "DELETE",
    });
    await load(request, {
      loading: "Deleting...",
      success: "Deleted!",
      error: "Failed to delete.",
    });
    router.refresh();
  }, [lens, router]);

  return (
    <div
      className={clsx(
        "flex items-start justify-between py-2 transition-colors",
        compact && "max-w-xs"
      )}
    >
      <div className="flex flex-col gap-1">
        <Link className="flex items-center flex-1" href={`/lens/${lens.lens_id}`}>
          <ShadowInnerIcon className="mr-2" />  
          <ReactMarkdown className="text-gray-600 line-clamp-1">
            {lens.name}
          </ReactMarkdown>
        </Link>
        <p className="text-gray-500 text-sm">{formatDate(lens.created_at)}</p>
      </div>
      <div className="flex items-center gap-2">
        {!compact && (
          <Button
            variant="secondary"
            className="hover:text-red-500 hover:border-red-500 transition-colors"
            type="button"
            onClick={handleDelete}
          >
            Delete
          </Button>
        )}
      </div>
    </div>
  );
}