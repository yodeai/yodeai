"use client";
import { notFound } from "next/navigation";
import Container from "@components/Container";
import BlockComponent from "@components/BlockComponent";
import { Block } from "app/_types/block";
import { useState, useEffect, ChangeEvent, useContext } from "react";
import LoadingSkeleton from '@components/LoadingSkeleton';
import { useAppContext } from "@contexts/context";
import { clearConsole } from "debug/tools";
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Link from 'next/link';
import { PlusIcon } from "@radix-ui/react-icons";

import { Button, Divider, Flex, Grid, Paper, Text } from "@mantine/core";
import { FaPlus } from "react-icons/fa";
import QuestionAnswerForm from "@components/QuestionAnswerForm";
import LensInviteComponent from "@components/LensInviteComponent";
import BlockHeader from "@components/BlockHeader";


export default function MyBlocks() {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient()

  const { setLensId } = useAppContext();

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

  const fetchBlocks = () => {
    fetch(`/api/block/getAllBlocks`)
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
    fetchBlocks();
    setLensId(null);
  }, []);

  return (
    <Flex direction="column" p={16} pt={0}>
      <Divider mb={0} size={1.5} label={<Text c={"gray.7"} size="sm" fw={500}>My Blocks</Text>} labelPosition="center" />
      <BlockHeader />

      {
        loading ? (
          <div className="mt-2">
            <LoadingSkeleton boxCount={8} lineHeight={80} m={0} />
          </div>
        ) : blocks?.length > 0 ? (
          blocks.map((block) => (
            <BlockComponent key={block.block_id} block={block} hasArchiveButton={false} />
          ))
        ) : (
          <Text size={"sm"} c={"gray.7"} ta={"center"} mt={30}>
            Nothing to show here. As you add blocks they will initially show up in your Inbox.
          </Text>
        )
      }

      {/* <Flex direction={"column"} justify={"flex-end"}>
        <QuestionAnswerForm />
      </Flex> */}
    </Flex >
  );
}