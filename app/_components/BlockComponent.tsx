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
import { createClient } from '@supabase/supabase-js';


interface BlockProps {
  compact?: boolean;
  block: Block;
}
export default function BlockComponent({ block, compact }: BlockProps) {
  const [blockStatus, setBlockStatus] = useState(block.status);

    // Function to update a specific item by its ID
    const updateBlock = (block_id: number, status: string, old_status: string) => {
      // Set the state with the updated array
      if (block_id == block.block_id && old_status != status) setBlockStatus(status);
    };
  
    // listen to block status updates
    useEffect(() => {
      // Assuming you have an asynchronous operation like fetching data here
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabase = createClient(url, supabaseKey)
      const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'block'
        },
        (payload) => {
          console.log("Payload")
          console.log(payload)
          updateBlock(payload["new"]["block_id"], payload["new"]["status"], payload['old']['status'])
  
        }
      ).subscribe()
  
      return () => {
        if (channel) channel.unsubscribe();
      };
    });

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
        { blockStatus === 'processing' ? (<span className="processing-text">[Processing...]</span>) : blockStatus === 'failure' ? (<div><span className="failed-text">[Failed]</span> <button onClick={() => retryProcessBlock()} className="flex items-center gap-2 text-sm font-semibold rounded px-2 py-1 border shadow transition-colors"> Retry upload</button></div>) : ''}
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
