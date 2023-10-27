"use client";
import { notFound } from "next/navigation";
import Container from "@components/Container";
import BlockComponent from "@components/BlockComponent";
import { Block } from "app/_types/block";
import { useState, useEffect, ChangeEvent, useContext } from "react";
import LoadingSkeleton from '@components/LoadingSkeleton';
import { useAppContext } from "@contexts/context";
import ShareLensComponent from "@components/ShareLensComponent";
import { clearConsole } from "debug/tools";
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Link from 'next/link';
import { PlusIcon } from "@radix-ui/react-icons";


export default function Inbox() {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient()
  useEffect(() => {
    const updateBlocks = (payload) => {
      let block_id = payload["new"]["block_id"]
      setBlocks(prevBlocks =>
        prevBlocks.map(item => {
          if (item.block_id === block_id) {
            console.log('Updating block status:', item, " to ", payload['new'] );
            return {...payload['new'], inLenses: item.inLenses, lens_blocks: item.lens_blocks};
          }
          return item;
        })
      );
    };

    const addBlocks = (payload) => {
      let block_id = payload["new"]["block_id"]
      console.log("Added a block", block_id)
      let newBlock = payload["new"]
      if (!blocks.some(item => item.block_id === block_id)) {
        setBlocks([newBlock, ...blocks]);
      }
    }
      
    const channel = supabase
      .channel('schema-db-changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'block' }, addBlocks)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'block' }, updateBlocks)
      .subscribe();
  
    return () => {
      if (channel) channel.unsubscribe();
    };
  }, [blocks]);


  const fetchBlocks = () => {
    fetch(`/api/inbox/getBlocks`)
      .then((response) => response.json())
      .then((data) => {
        setBlocks(data.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching block:", error);
        notFound();
        setLoading(false);
      });
  };

  useEffect(() => {
      fetchBlocks();
  }, []);





  return (

    <Container as="main" className="py-8 max-w-screen-sm gap-8 ">

      <header className="flex items-center justify-between">

        {
          <>
            <span className="text-xl font-semibold">Inbox</span>
            <div className="flex items-center space-x-2">

            </div>

          </>
        }
      </header>

      <div className="flex items-stretch flex-col gap-4 mt-4">
      <Link
        href="/new"
        className="no-underline flex items-center gap-2 text-sm font-semibold rounded px-2 py-1 w-32 bg-royalBlue hover:bg-royalBlue-hover text-white border border-royalBlue shadow transition-colors">
        <PlusIcon /> New block
      </Link>

        {
          loading ? (
            <div className="flex flex-col p-4 flex-grow">
              <LoadingSkeleton />
            </div>
          ) : blocks?.length > 0 ? (
            blocks.map((block) => (
              <BlockComponent key={block.block_id} block={block} hasArchiveButton={true}  onArchive={fetchBlocks} />
            ))
          ) : (
            <div className="flex flex-col p-4 flex-grow">
              Nothing to show here. As you add blocks they will initially show up in your Inbox.
            </div>
          )
        }


      </div>
    </Container>
  );
}