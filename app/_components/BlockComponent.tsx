"use client";
import formatDate from "@lib/format-date";
import clsx from "clsx";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Block } from "app/_types/block";
import { FaArchive } from "react-icons/fa";
import BlockLenses from "@components/BlockLenses";
import apiClient from "@utils/apiClient";
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import load from "@lib/load";
import { Button, Tooltip } from 'flowbite-react';
import toast from "react-hot-toast";

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




  const retryProcessBlock = async () => {
    console.log("Retrying")
    await apiClient('/processBlock', 'POST', { block_id: block.block_id })
      .then(result => {
        console.log('Block processed successfully', result);
      })
      .catch(error => {
        toast.error('Error processing block: ' + error.message);
      });
  }



  const firstTwoLinesComplete = block.content?.split('\n').slice(0, 2).join('\n');
  const firstTwoLines = firstTwoLinesComplete?.length<300?firstTwoLinesComplete:firstTwoLinesComplete?.slice(0,300);
  const [expanded, setExpanded] = useState(false);

  const toggleExpand = () => {
    setExpanded(!expanded);
  };

  

  const previewText = block.preview ? (expanded ? block.preview : `${block.preview.slice(0, 80)}...`) : (firstTwoLines?(expanded?firstTwoLines:firstTwoLines.slice(0,80)):"");



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
            className="prose line-clamp-1 no-underline font-semibold"
          >
            <div className="truncate">
              {block.title}
            </div>
          </button>
          {hasArchiveButton && (
            <Tooltip content="Archive" style="light">
              <button onClick={handleArchive}>
                <FaArchive style={{ color: 'grey' }} />
              </button>
            </Tooltip>
          )}
        </div>

        <div className="text-gray-500">
        <div>
          <p className="text-gray-500 text-sm">
            {previewText}
            {expanded && (
              <a
                href="#"
                onClick={toggleExpand}
                style={{ marginLeft: '10px', textDecoration: 'underline', cursor: 'pointer' }}
              >
               {previewText.length>0?"[Show less]":""} 
              </a>
            )}
            {!expanded && (
              <a
                href="#"
                onClick={toggleExpand}
                style={{ marginLeft: '10px', textDecoration: 'underline', cursor: 'pointer' }}
              >
                {previewText.length>0?"[Show more]":""} 
              </a>
            )}
          </p>
        </div>
      </div>



        {block.status === 'processing' ? (<span className="processing-text">[Processing...]</span>) : block.status === 'failure' ? (<div><span className="failed-text">[Failed]</span> <button onClick={() => retryProcessBlock()} className="flex items-center gap-2 text-sm font-semibold rounded px-2 py-1 border shadow transition-colors"> Retry upload</button></div>) : block.status == 'waiting to process' ? (<span className="waiting-text">[Waiting to process]</span>) : ''}
        {block.inLenses && (
          <BlockLenses lenses={block.inLenses} block_id={block.block_id} />
        )}

        {block.block_type == "pdf" ? (
          <>
            <div className="flex text-gray-600 ">
              <img src="/pdf-icon.png" alt="Lens Icon" className="mr-2 w-6" />
              {block.file_url.split('/').pop()}
            </div>
          </>
        ) : null}

        {!compact && firstTwoLines && false ? (
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
