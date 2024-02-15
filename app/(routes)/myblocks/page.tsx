"use client";
import { useState, useEffect, useMemo } from "react";
import { notFound } from "next/navigation";
import BlockComponent from "@components/ListView/Views/BlockComponent";
import { Block } from "app/_types/block";
import LoadingSkeleton from '@components/LoadingSkeleton';
import { useAppContext } from "@contexts/context";
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

import { Flex, Text, Box } from "@mantine/core";
import BlockColumnHeader from "@components/Block/BlockColumnHeader";
import SpaceHeader from "@components/SpaceHeader";
import { getUserInfo } from "@utils/googleUtils";

export default function MyBlocks() {
  const supabase = createClientComponentClient()

  const [blocks, setBlocks] = useState<Block[]>([]);
  const [loading, setLoading] = useState(true);
  const { sortingOptions, setLensId } = useAppContext();



  useEffect(() => {
    const updateBlocks = (payload) => {
      let block_id = payload["new"]["block_id"]
      setBlocks(prevBlocks =>
        prevBlocks.map(item => {
          if (item.block_id === block_id) {
            return { ...payload['new'], inLenses: item.inLenses, lens_blocks: item.lens_blocks };
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

    const deleteBlocks = (payload) => {
      let block_id = payload["new"]["block_id"]
      console.log("Deleting block", block_id);
      setBlocks((blocks) => blocks.filter((block) => block.block_id != block_id))

    }

    const channel = supabase
      .channel('schema-db-changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'block' }, addBlocks)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'block' }, updateBlocks)
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'block' }, deleteBlocks)
      .subscribe();

    return () => {
      if (channel) channel.unsubscribe();
    };
  }, [blocks]);

  const fetchBlocks = (googleUserId) => {
    fetch(`/api/block/getAllBlocks/${googleUserId}`)
      .then((response) => response.json())
      .then((data) => {
        setBlocks(data.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching block:", error);
        notFound();
      });
  };

  useEffect(() => {
    const fetchBlocksAndInfo = async() => {
      let googleUserId = await getUserInfo();
      fetchBlocks(googleUserId);
      setLensId(null);
    }
    fetchBlocksAndInfo();
  }, []);

  const sortedBlocks = useMemo(() => {
    if (sortingOptions.sortBy === null) return blocks;

    let _sorted_blocks = [...blocks].sort((a, b) => {
      if (sortingOptions.sortBy === "name") {
        return a.title.localeCompare(b.title);
      } else if (sortingOptions.sortBy === "createdAt") {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      } else if (sortingOptions.sortBy === "updatedAt") {
        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      }
    });

    if (sortingOptions.order === "desc") {
      _sorted_blocks = _sorted_blocks.reverse();
    }

    return _sorted_blocks;
  }, [sortingOptions, blocks]);

  return (
    <Flex direction="column" pt={0}>
      <SpaceHeader
        title="My Blocks"
        selectedLayoutType="block"
        staticLayout={true}
      />
      {loading && <div className="p-3">
        <LoadingSkeleton boxCount={8} lineHeight={80} m={0} />
      </div> || ""
      }

      {!loading && sortedBlocks.length > 0 &&
        <Box p={16}>
          <BlockColumnHeader />
          {sortedBlocks.map((block) =>
            <BlockComponent key={block.block_id} block={block} hasArchiveButton={false} />
          )}
        </Box> || ""
      }

      {!loading && sortedBlocks?.length == 0 &&
        <Text size={"sm"} c={"gray.7"} ta={"center"} mt={30}>
          Nothing to show here. As you add blocks they will initially show up in your Inbox.
        </Text> || ""
      }

    </Flex >
  );
}