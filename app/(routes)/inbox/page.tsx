"use client";
import { notFound } from "next/navigation";
import Container from "@components/Container";
import Link from "next/link";
import BlockComponent from "@components/BlockComponent";
import { Block } from "app/_types/block";
import { useState, useEffect, ChangeEvent, useContext } from "react";
import { Lens } from "app/_types/lens";
import load from "@lib/load";
import LoadingSkeleton from '@components/LoadingSkeleton';
import { Pencil2Icon, TrashIcon, PlusIcon, Share1Icon } from "@radix-ui/react-icons";
import { useRouter } from "next/navigation";
import { useLens } from "@contexts/lensContext";
import { Button, Tooltip } from 'flowbite-react';
import ShareLensComponent from "@components/ShareLensComponent";


export default function Inbox() {
  const [InboxData, setInboxData] = useState(null);
  //const [lensName, setLensName] = useState("");
  const [blocks, setBlocks] = useState<Block[]>([]);
  //const [isEditingLensName, setIsEditingLensName] = useState(false);
  const router = useRouter();
  //const { reloadLenses } = useLens();


  useEffect(() => {
    // Fetch the blocks associated with the lens
    fetch(`/api/inbox/getBlocks`)
      .then((response) => response.json())
      .then((data) => {
        setBlocks(data.data);
      })
      .catch((error) => {
        console.error("Error fetching block:", error);
        notFound();
      });

    // Fetch the lens details
    fetch(`/api/inbox`)
      .then((response) => response.json())
      .then((data) => {
        setInboxData(data.data);        
      })
      .catch((error) => {
        console.error("Error fetching lens:", error);
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
          <p>Inbox is empty.</p>
        )}

        {/* Display child lenses if they exist */}

      </div>
    </Container>
  );
}