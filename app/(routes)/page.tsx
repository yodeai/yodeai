"use client";
import { useEffect, useState } from "react";
import { Block } from 'app/_types/block';
import BlockComponent from '@components/BlockComponent';
import Link from "next/link";
import { PlusIcon } from "@radix-ui/react-icons";

export const dynamic = 'force-dynamic';

export default function Index() {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch blocks from the API
    fetch('/api/block/getAllBlocks')
      .then(response => response.json())
      .then(data => {
        setBlocks(data.data || []);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching blocks:', error);
        setError('Failed to load blocks');
        setLoading(false);
      });
  }, []);

  if (loading) {

    return (
      <div className="flex flex-col p-4 flex-grow">
        <h1 className=" text-lg">Loading..</h1>
      </div>

    );
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  return (
    <div className=" flex flex-col p-4">
      <h1 className="font-semibold text-lg flex-grow-0 flex-shrink-0 w-full">All blocks.</h1>
      <Link
        href="/new"
        className="no-underline flex items-center gap-2 text-sm font-semibold rounded px-2 py-1 w-32 bg-emerald-600 hover:bg-emerald-700 text-slate-50 border border-emerald-600 shadow transition-colors"
      >
        <PlusIcon /> New block
      </Link>

      <div className="flex flex-col  lg:py-12 text-foreground">

        {blocks.length > 0 ? (
          blocks.map((block: Block) => (
            <div key={block.block_id}>

              <BlockComponent block={block} />
            </div>
          ))
        ) : (
          <p>No blocks found.</p>
        )}
      </div>

    </div>
  );
}
