"use client";

import { notFound } from "next/navigation";
import BlockComponent from "@components/BlockComponent";
import { Block } from "app/_types/block";
import { useState, useEffect, ChangeEvent, useContext } from "react";
import LoadingSkeleton from '@components/LoadingSkeleton';
import { useAppContext } from "@contexts/context";
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Link from 'next/link';

import { Button, Divider, Flex, Grid, Paper, Text } from "@mantine/core";
import { FaPlus } from "react-icons/fa";
import LensInviteComponent from "@components/LensInviteComponent";
import BlockHeader from "@components/BlockHeader";

export default function Inbox() {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [loading, setLoading] = useState(true);
  const [unacceptedInvites, setUnacceptedInvites] = useState([]);

  const { setLensId } = useAppContext();
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
      });
  };

  const fetchInvites = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    const { data, error } = await supabase
      .from('lens_invites')
      .select()
      .eq('recipient', user.email).eq("status", "sent")
    if (error) {
      console.error("error getting lens invites:", error.message)
    }
    setUnacceptedInvites(data);
  }

  useEffect(() => {
    fetchBlocks();
    fetchInvites();
    setLensId(null);
  }, []);

  return (
    <Flex direction="column" p={16} pt={0}>
      <Divider mb={0} size={1.5} label={<Text c={"gray.7"} size="sm" fw={500}>Inbox</Text>} labelPosition="center" />
      <Flex justify={"center"} align={"center"}>
        <Flex justify={"center"} align={"center"}>
          <Link href="/new">
            <Button
              size="xs"
              variant="subtle"
              leftSection={<FaPlus />}
            // onClick={() => setIsEditingLensName(true)}
            >
              Add Block
            </Button>
          </Link>
        </Flex>
      </Flex>

      <Paper mb={10}>
        <Text size="md" fw={600} c={"gray.7"}>Invitations</Text>
        {
          unacceptedInvites?.length > 0 ? (
            unacceptedInvites.map((invite) => (
              <div key={invite.lens_id} >
                <LensInviteComponent invite={invite}></LensInviteComponent>
              </div>
            ))
          ) : (
            <Text ta={"center"} c={"gray.6"} size="sm">
              No unaccepted invites!
            </Text>
          )
        }
      </Paper>

      <BlockHeader />

      {
        loading ? (
          <div className="mt-2">
            <LoadingSkeleton boxCount={8} lineHeight={80} m={0} />
          </div>
        ) : blocks?.length > 0 ? (
          blocks.map((block) => (
            <BlockComponent key={block.block_id} block={block} hasArchiveButton={true} onArchive={fetchBlocks} />
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