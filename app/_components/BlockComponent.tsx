"use client";
import formatDate from "@lib/format-date";
import clsx from "clsx";
import Link from "next/link";
import { useCallback, useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import { Block } from "app/_types/block";
import { FaArchive } from "react-icons/fa";
import BlockLenses from "@components/BlockLenses";
import apiClient from "@utils/apiClient";
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import load from "@lib/load";
import { Button, Tooltip } from 'flowbite-react';

interface BlockProps {
  compact?: boolean;
  block: Block;
  hasArchiveButton?: boolean
  onArchive?: () => void;
}
export default function BlockComponent({ block, compact, hasArchiveButton = false, onArchive }: BlockProps) {
  const [blockStatus, setBlockStatus] = useState(block.status);

  const handleArchive = async () => {
    const supabase = createClientComponentClient();

    const request = new Promise((resolve, reject) => {
      supabase
        .from('inbox')
        .delete()
        .eq('block_id', block.block_id)
        .then(response => {
          if (response.error) reject(response.error);
          else resolve(response);
        });
    });

    await load(request, {
      loading: "Archiving...",
      success: "Archived!",
      error: "Failed to archive.",
    });
    onArchive();


  };



  // Function to update a specific item by its ID
  // const updateBlock = (block_id: number, status: string, old_status: string) => {
  //   // Set the state with the updated array
  //   if (block_id == block.block_id && old_status != status) setBlockStatus(status);
  // };

  // // listen to block status updates
  // useEffect(() => {
  //   // Assuming you have an asynchronous operation like fetching data here
  //   const supabase = createClientComponentClient()
  //   const channel = supabase
  //   .channel('schema-db-changes')
  //   .on(
  //     'postgres_changes',
  //     {
  //       event: 'UPDATE',
  //       schema: 'public',
  //       table: 'block'
  //     },
  //     (payload) => {
  //       console.log("Payload")
  //       console.log(payload)
  //       updateBlock(payload["new"]["block_id"], payload["new"]["status"], payload['old']['status'])

  //     }
  //   ).subscribe()

  //   return () => {
  //     if (channel) channel.unsubscribe();
  //   };
  // });

  const retryProcessBlock = async () => {
    console.log("Retrying")
    await apiClient('/processBlock', 'POST', { block_id: block.block_id })
      .then(result => {
        console.log('Block processed successfully', result);
      })
      .catch(error => {
        console.error('Error processing block', error);
      });
  }


  // const [blockId, setBlockId] = useState(block.block_id);
  // const [stopPolling, setStopPolling] = useState(false)

  // function useInterval(callback, delay, stopPolling) {
  //   const savedCallback = useRef();
  //   useEffect(() => {
  //     savedCallback.current = callback;
  //   }, [callback])

  //   useEffect(() => {
  //     function tick() {
  //       savedCallback.current();
  //     }
  //     if (delay != null) {
  //       const id = setInterval(tick, delay)
  //       if (stopPolling) {
  //         clearInterval(id);
  //       }
  //       return () => {
  //         clearInterval(id);
  //       }
  //     }
  //   }, [callback, delay])

  // }

  // useInterval(async() => {
  //   console.log("polling")
  //   const block = await fetch(`/api/block/${blockId}`).then((response) => response.json())
  //   if (block.data.status == 'ready') {
  //     console.log("STOPPING polling")
  //     setStopPolling(true);
  //   }
  //   setBlockStatus(block.data.status)
  // }, 10000, stopPolling)

  const firstTwoLines = block.content?.split('\n').slice(0, 2).join('\n');
  return (
    <div
      className={clsx(
        " items-start justify-between elevated-block p-4 rounded-md bg-white border border-gray-200 mb-4",
        compact ? "max-w-xs" : ""
      )}
    >
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between flex-1">
          <button
            onClick={() => window.location.href = `/block/${block.block_id}`}
            className="prose text-gray-600 line-clamp-1 no-underline"
          >
            <strong>{block.title}</strong>
          </button>
          {hasArchiveButton && (
            <Tooltip content="Archive" style="light">
              <button onClick={handleArchive}>
                <FaArchive style={{ color: 'grey' }} />
              </button>
            </Tooltip>
          )}

        </div>
        {block.status === 'processing' ? (<span className="processing-text">[Processing...]</span>) : block.status === 'failure' ? (<div><span className="failed-text">[Failed]</span> <button onClick={() => retryProcessBlock()} className="flex items-center gap-2 text-sm font-semibold rounded px-2 py-1 border shadow transition-colors"> Retry upload</button></div>) : block.status == 'waiting to process' ? (<span className="waiting-text">[Waiting to process]</span>) : ''}
        {block.inLenses && (
          <BlockLenses lenses={block.inLenses} block_id={block.block_id} />
        )}
        {!compact && firstTwoLines ? (
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
