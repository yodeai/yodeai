"use client";
import { useEffect, useState, useRef } from "react";
import { Block } from 'app/_types/block';
import BlockComponent from '@components/BlockComponent';
import Link from "next/link";
import { PlusIcon } from "@radix-ui/react-icons";
import LoadingSkeleton from '@components/LoadingSkeleton';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Button, Divider, Flex, Grid, NavLink, Text } from "@mantine/core";
import { FaPlusSquare } from "react-icons/fa";
import QuestionAnswerForm from "@components/QuestionAnswerForm";

export const dynamic = 'force-dynamic';

export default function Index() {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClientComponentClient()
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


  // const handleNewBlock = (e: React.MouseEvent) => {
  //   setLensId(null);
  //   setActiveComponent("global");
  //   router.push(`/new`);
  // };

  if (loading) {
    return (
      <div className="flex flex-col p-2 pt-0 flex-grow">
        <LoadingSkeleton />
      </div>

    );
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  return (
    <Flex mih={'100vh'} direction="column">
      <Flex direction="column" p={16} pt={0}>
        <Divider mb={0} size={1.5} label={<Text c={"gray.7"} size="sm" fw={500}>All blocks</Text>} labelPosition="center" />

        <Grid mb={5}>
          <Grid.Col span={7}>
            <Text ml={2} size={"sm"} fw={500} c="gray.6">{"Name"}</Text>
          </Grid.Col>
          <Grid.Col span={3}>
            <Text size={"sm"} fw={500} c="gray.6">{"File type"}</Text>
          </Grid.Col>
          <Grid.Col span={2}>
            <Text ml={-1} size={"sm"} fw={500} c="gray.6">{"Last modified"}</Text>
          </Grid.Col>
        </Grid>

        {blocks.length > 0 ? (
          blocks.map((block: Block) => (

            <div key={block.block_id}>
              <BlockComponent block={block} />
            </div>
          ))
        ) : (
          <p>No blocks found.</p>
        )}
      </Flex>
      {/* <Flex direction={"column"} justify={"flex-end"}>
        <QuestionAnswerForm />
      </Flex> */}
    </Flex>
  );
}