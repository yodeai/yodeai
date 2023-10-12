"use client";
import { notFound } from "next/navigation";
import Container from "@components/Container";
import BlockComponent from "@components/BlockComponent";
import { Block } from "app/_types/block";
import { useState, useEffect, ChangeEvent, useContext } from "react";
import { Lens } from "app/_types/lens";
import load from "@lib/load";
import LoadingSkeleton from '@components/LoadingSkeleton';
import { Pencil2Icon, TrashIcon, PlusIcon, Share1Icon } from "@radix-ui/react-icons";
import { useRouter } from "next/navigation";
import { useAppContext } from "@contexts/context";
import { Button, Tooltip } from 'flowbite-react';
import ShareLensComponent from "@components/ShareLensComponent";
import { clearConsole } from "debug/tools";
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';



export default function Inbox() {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const router = useRouter();
  
  useEffect(() => {
    const supabase = createClientComponentClient()
    const updateBlocks = (payload) => {
      let block_id = payload["new"]["block_id"]
      let new_status = payload["new"]["status"]
      let old_status = payload['old']['status']
      if (new_status == old_status) {
        return;
      }
      setBlocks(prevBlocks =>
        prevBlocks.map(item => {
          if (item.block_id === block_id) {
            console.log('Updating block status:', item.block_id, " to ", new_status);
            return { ...item, status: new_status };
          }
          return item;
        })
      );
    };
  
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

          updateBlocks(payload)
        }
      ).subscribe();
  
    return () => {
      if (channel) channel.unsubscribe();
    };
  }, [blocks]);

  useEffect(() => {
    // Fetch the blocks associated with the Inbox
    fetch(`/api/inbox/getBlocks`)
      .then((response) => response.json())
      .then((data) => {
        setBlocks(data.data);
      })
      .catch((error) => {
        console.error("Error fetching block:", error);
        notFound();
      });

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


        {blocks && blocks.length > 0 ? (
          blocks.map((block) => (
            <BlockComponent key={block.block_id} block={block} />
          ))
        ) : (
          <div className="flex flex-col p-4 flex-grow">
            <LoadingSkeleton />
          </div>
        )}

      </div>
    </Container>
  );
}