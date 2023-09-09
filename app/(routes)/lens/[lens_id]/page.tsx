"use client";
import { notFound } from "next/navigation";
import Container from "@components/Container";
import Link from "next/link";
import BlockComponent from "@components/BlockComponent";
import { Block } from "app/_types/block";
import { useState, useEffect, ChangeEvent } from "react";
import { Lens } from "app/_types/lens";
import { updateLensName } from './update-lens';
import load from "@lib/load";
import LoadingSkeleton from '@components/LoadingSkeleton';


export default function Lens({ params }: { params: { lens_id: string } }) {
  const [lens, setLens] = useState<Lens | null>(null);
  const [lensName, setLensName] = useState("");
  const [blocks, setBlocks] = useState<Block[]>([]);

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


  const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    setLensName(e.target.value);
  };

  const handleKeyPress = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && lens) {
      e.preventDefault();
      try {
        const updatePromise = updateLensName(lens.lens_id, lensName);
        await load(updatePromise, {
          loading: "Updating lens name...",
          success: "Lens name updated!",
          error: "Failed to update lens name.",
        });
        setLens({ ...lens, name: lensName });
      } catch (error) {
        console.error('Failed to update lens name', error);
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
    <Container as="main" className="py-8 max-w-screen-sm gap-8">
      <header className="flex items-center justify-between">
        <input
          type="text"
          value={lensName}
          onChange={handleNameChange}
          onKeyPress={handleKeyPress}
          className="text-xl font-semibold"
        />

      </header>
      <div className="flex items-stretch flex-col gap-4 mt-4">
        {blocks && blocks.length > 0 ? (
          blocks.map((block) => (
            <BlockComponent key={block.block_id} block={block} />
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