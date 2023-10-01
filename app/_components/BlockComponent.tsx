"use client";
import Button from "./Button";
import formatDate from "@lib/format-date";
import load from "@lib/load";
import clsx from "clsx";
import Link from "next/link";
import { useCallback, useState, useEffect, useRef} from "react";
import ReactMarkdown from "react-markdown";
import { Block } from "app/_types/block";
import BlockLenses from "@components/BlockLenses";
import apiClient from "@utils/apiClient";


interface BlockProps {
  compact?: boolean;
  block: Block;
}
export default function BlockComponent({ block, compact }: BlockProps) {
  const [blockStatus, setBlockStatus] = useState(block.status);
  const [blockId, setBlockId] = useState(block.block_id);
  const [stopPolling, setStopPolling] = useState(false)
  function useInterval(callback, delay, stopPolling) {
    const savedCallback = useRef();
    useEffect(() => {
      savedCallback.current = callback;
    }, [callback])

    useEffect(() => {
      function tick() {
        savedCallback.current();
      }
      if (delay != null) {
        const id = setInterval(tick, delay)
        if (stopPolling) {
          clearInterval(id);
        }
        return () => {
          clearInterval(id);
        }
      }
    }, [callback, delay])

  }
  useInterval(async() => {
    console.log("polling")
    const block = await fetch(`/api/block/${blockId}`).then((response) => response.json())
    if (block.data.status == 'ready') {
      console.log("STOPPING polling")
      setStopPolling(true);
    }
    setBlockStatus(block.data.status)
  }, 10000, stopPolling)

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
        { blockStatus === 'processing' ? (<span className="processing-text">[Processing...]</span>) : ''}
        {block.inLenses  && (
          <BlockLenses lenses={block.inLenses} block_id={block.block_id} />
        )}
        {!compact ? (
          <>
            <p className="text-gray-500 text-sm">{formatDate(block.updated_at)}</p>
            <div className="prose text-gray-600 line-clamp-2">
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
