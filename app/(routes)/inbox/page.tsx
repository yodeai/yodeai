"use client";

import { notFound } from "next/navigation";
import BlockComponent from "@components/ListView/Views/BlockComponent";
import { Block } from "app/_types/block";
import { useState, useEffect } from "react";
import LoadingSkeleton from '@components/LoadingSkeleton';
import { useAppContext } from "@contexts/context";
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

import { Flex, Box, Paper, Text } from "@mantine/core";
import LensInviteComponent from "@components/LensInviteComponent";
import BlockColumnHeader from "@components/Block/BlockColumnHeader";
import SpaceHeader from "@components/SpaceHeader";
import FinishedOnboardingModal from "@components/Onboarding/FinishedOnboardingModal";

export default function Inbox() {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [loading, setLoading] = useState(true);
  const [unacceptedInvites, setUnacceptedInvites] = useState([]);

  const { setLensId, user } = useAppContext();
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
    const fetchBlocksAndInfo = async () => {
      fetchInvites();
      setLensId(null);
      fetchBlocks();
    }
    fetchBlocksAndInfo();

  }, []);

  return (
    <Flex direction="column" pt={0}>
      <SpaceHeader
        title="Inbox"
        selectedLayoutType="block"
        handleChangeLayoutView={() => { }}
        staticLayout={true}
        staticSortBy={true}
      />
      <Box p={16}>
        <Paper mb={10}>
          <Text size="lg" fw={600} c={"gray.7"}>Invitations</Text>
          {
            unacceptedInvites?.length > 0 ? (
              unacceptedInvites.map((invite) => (
                <div key={invite.lens_id} >
                  <LensInviteComponent invite={invite}></LensInviteComponent>
                </div>
              ))
            ) : (
              <Text c={"gray.6"} mt={5} size="md">
                No unaccepted invites!
              </Text>
            )
          }
        </Paper>

        <BlockColumnHeader />

        <Text size="lg" fw={600} c={"gray.7"}>Latest Pages</Text>

        {
          loading ? (
            <div className="mt-2">
              <LoadingSkeleton boxCount={8} lineHeight={80} m={0} />
            </div>
          ) : blocks?.length > 0 && user?.user_metadata?.google_user_id != "" ? (
            blocks.map((block) => (
              <BlockComponent key={block.block_id} block={block} hasArchiveButton={true} onArchive={fetchBlocks} />
            ))
          ) : (
            <Text size={"sm"} c={"gray.7"} ta={"center"} mt={30}>
              Nothing to show here. As you add pages they will initially show up in your Inbox.
            </Text>
          )
        }

        {/* <Flex direction={"column"} justify={"flex-end"}>
        <QuestionAnswerForm />
      </Flex> */}
      </Box>
      <FinishedOnboardingModal />
    </Flex >
  );
}