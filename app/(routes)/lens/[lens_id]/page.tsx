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
import { Pencil2Icon, TrashIcon, PlusIcon, Share1Icon, CheckIcon } from "@radix-ui/react-icons";

import { useRouter, useSearchParams } from "next/navigation";
import { useAppContext } from "@contexts/context";
import { Button, Tooltip } from 'flowbite-react';
import ShareLensComponent from "@components/ShareLensComponent";


export default function Lens({ params }: { params: { lens_id: string } }) {
  const [lens, setLens] = useState<Lens | null>(null);
  const [lensName, setLensName] = useState("");
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [isEditingLensName, setIsEditingLensName] = useState(false);
  const router = useRouter();
  const { reloadLenses } = useAppContext();
  



  useEffect(() => {


    // Fetch the blocks associated with the lens
    fetch(`/api/lens/${params.lens_id}/getBlocks`)
      .then((response) => response.json())
      .then((data) => {
        setBlocks(data.data);
      })
      .catch((error) => {
        console.error("Error fetching block:", error);
        notFound();
      });
  
    // Fetch the lens details
    fetch(`/api/lens/${params.lens_id}`)
      .then((response) => response.json())
      .then((data) => {
        setLens(data.data);
        setLensName(data.data.name);
      })
      .catch((error) => {
        console.error("Error fetching lens:", error);
        notFound();
      });

  }, [params.lens_id]);




  const updateLensName = async (lens_id: number, name: string) => {
    const updatePromise = fetch(`/api/lens/${lens_id}`, {
      method: "PUT",
      body: JSON.stringify({ name: name }),
    });
    reloadLenses();
    return updatePromise;
  };

  const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    setLensName(e.target.value);
  };


  const saveNewLensName = async () => {
    if (lens) {
      try {
        const updatePromise = updateLensName(lens.lens_id, lensName);
        await load(updatePromise, {
          loading: "Updating lens name...",
          success: "Lens name updated!",
          error: "Failed to update lens name.",
        });
        setLens({ ...lens, name: lensName });
        setIsEditingLensName(false);  // Turn off edit mode after successful update
      } catch (error) {
        console.error('Failed to update lens name', error);
      }
    }
  };
  const handleKeyPress = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      saveNewLensName();
    }
  };
  const handleDeleteLens = async () => {
    if (lens && window.confirm("Are you sure you want to delete this lens?")) {
      try {
        const deleteResponse = await fetch(`/api/lens/${lens.lens_id}`, {
          method: "DELETE"
        });

        if (deleteResponse.ok) {
          reloadLenses();
          router.push("/");
        } else {
          console.error("Failed to delete lens");
        }
      } catch (error) {
        console.error("Error deleting lens:", error);
      }
    }
  };



  if (!lens) {
    return (
      <div className="flex flex-col p-4 flex-grow">
        <LoadingSkeleton />
      </div>
    );
  }
  return (

    <Container as="main" className="py-8 max-w-screen-sm gap-8 ">

      <header className="flex items-center justify-between">

        {!isEditingLensName ? (
          <>
            <span className="text-xl font-semibold">{lensName}</span>
            <div className="flex items-center space-x-2">
              <Tooltip content="Edit lens." style="light" >
                <Button onClick={() => setIsEditingLensName(true)} className="no-underline gap-2 font-semibold rounded px py-1 bg-white text-gray-400 border-0">
                  <Pencil2Icon className="w-6 h-6" />
                </Button>
              </Tooltip>
              {/* <ShareLensComponent /> */}
            </div>

          </>
        ) : (
          <div className="flex items-center w-full">
            <input
              type="text"
              value={lensName}
              onChange={handleNameChange}
              onKeyUp={handleKeyPress}
              className="text-xl font-semibold flex-grow"
            />
            <button onClick={() => { saveNewLensName(); setIsEditingLensName(false) }} className="no-underline gap-2 font-semibold rounded px-2 py-1 bg-white text-gray-400 border-0 ml-4">
              <CheckIcon className="w-6 h-6" />
            </button>

            <div className="flex gap-2">
              <button onClick={handleDeleteLens} className="no-underline gap-2 font-semibold rounded px-2 py-1  text-red-500 hover:text-red-600 border-0">
                <TrashIcon className="w-6 h-6" />
              </button>

            </div>

          </div>

        )}






      </header>

      <div className="flex items-stretch flex-col gap-4 mt-4">

        <Link
          href="/new"
          className="no-underline flex items-center gap-2 text-sm font-semibold rounded px-2 py-1 w-32 bg-royalBlue hover:bg-royalBlue-hover text-white border border-royalBlue shadow transition-colors">
          <PlusIcon /> New block
        </Link>
        {blocks && blocks.length > 0 ? (
          blocks.map((block) => (
            <BlockComponent key={block.block_id} block={block}  />
          ))
        ) : (
          <p>This lens is empty, add blocks here.</p>
        )}

        {/* Display child lenses if they exist */}
        {lens.children && lens.children.length > 0 ? (
          lens.children.map((childLens) => (
            <div key={childLens.lens_id}>
              {/* Child lens display logic */}
              Child Lens: {childLens.name}
            </div>
          ))
        ) : (
          <p></p>
        )}
      </div>
    </Container>
  );
}