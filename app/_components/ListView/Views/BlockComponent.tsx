"use client";
import { useState } from "react";
import { Block } from "app/_types/block";
import { FaArchive, FaFile } from "react-icons/fa";
import BlockLenses from "@components/Block/BlockLenses";
import apiClient from "@utils/apiClient";
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import load from "@lib/load";
import toast from "react-hot-toast";
import { Divider, Text, Tooltip, Flex, ActionIcon, Grid, Anchor } from "@mantine/core";
import InlineSpoiler from "../../InlineSpoiler";
import { useRouter } from "next/navigation";
import { timeAgo } from "@utils/index";
import { useAppContext } from "@contexts/context";
import OnboardingPopover from "@components/Onboarding/OnboardingPopover";

interface BlockProps {
  compact?: boolean;
  block: Block;
  hasArchiveButton?: boolean
  onArchive?: (googleUserId) => void;
  hierarchy?: number;
  googleUserId?: string;
}

export default function BlockComponent({ block, compact, hasArchiveButton = false, onArchive, hierarchy = 0, googleUserId=""}: BlockProps) {
  const router = useRouter();

  const { onboardingStep, onboardingIsComplete, goToNextOnboardingStep } = useAppContext();

  const handleArchive = async () => {
    const supabase = createClientComponentClient();

    const request = new Promise((resolve, reject) => {
      supabase
        .from('inbox')
        .delete()
        .eq('block_id', block.block_id)
        .then(response => {
          if (response.error) reject(response.error);
          else resolve(response);
        });
    });

    await load(request, {
      loading: "Archiving...",
      success: "Archived!",
      error: "Failed to archive.",
    });
    onArchive(googleUserId);
  };

  const retryProcessBlock = async () => {
    console.log("Retrying")
    await apiClient('/processBlock', 'POST', { block_id: block.block_id, delay: 0 })
      .then(result => {
        console.log('Block processed successfully', result);
      })
      .catch(error => {
        toast.error('Error processing block: ' + error.message);
      });
  }

  // const previewText = block.preview ? (expanded ? block.preview : `${block.preview.slice(0, 80)}...`) : (firstTwoLines ? (expanded ? firstTwoLines : firstTwoLines.slice(0, 80)) : "");
  // useEffect(()=>{
  //   const supabase = createClientComponentClient()

  //   let getAccessType = async() => {
  //     const { data: { user } } = await supabase.auth.getUser();

  //     const { data: accessLevel, error: accessLevelError } = await supabase.rpc('get_access_type_block', { "chosen_block_id": block.block_id, "chosen_user_id": user.id })
  //     if (accessLevelError) {
  //       console.log("message", accessLevelError.message)
  //       throw accessLevelError;
  //     }
  //     block.accessLevel = accessLevel ? accessLevel : "owner"; // if the block is not part of a lens, then it is the user's own block
  //   }
  //   getAccessType();

  // }, [])

  const onClickBlock = () => {
    if (onboardingStep === 1 && !onboardingIsComplete) goToNextOnboardingStep();
    router.push(`/block/${block.block_id}`)
  }

  return (
    <div>
      <Flex pl={2} pr={2} direction={"column"}>
        <Grid>
          <Grid.Col span={10}>
            <Flex align={"center"} direction={"row"}>
              <FaFile size={12} style={{ minWidth: 12, minHeight: 12, marginRight: 5, marginBottom: 0.2 }} color="gray" />

              <Anchor
                size={"xs"}
                underline="never"
                onClick={onClickBlock}
              >
                
                {((block.title === "About Pages and Spaces" || block.title === "About Blocks and Spaces") && onboardingStep === 1 && !onboardingIsComplete)
                  ?
                  <OnboardingPopover
                    width={400}
                    stepToShow={1}
                    position="right-start"
                    popoverContent={
                      <>
                        <Text size="sm" mb={10}>This is a <b>page</b>, a unit of information in Yodeai.</Text>
                        <Text size="sm">Click <b>About pages and spaces.</b></Text>
                      </>
                    }
                  >
                    <Text size={"md"} fw={500} c="gray.7">{block.title}</Text>
                  </OnboardingPopover>
                  :
                  <Text size={"md"} fw={500} c="gray.7">{block.title} (block id: {block.block_id})</Text>
                }

              </Anchor>

              {hasArchiveButton && (
                <Flex ml={2}>
                  <Tooltip label="Archive this block">
                    <ActionIcon aria-label="archive block" color="gray" variant="subtle" onClick={handleArchive}>
                      <FaArchive size={14} style={{ marginBottom: 2 }} />
                    </ActionIcon>
                  </Tooltip>
                </Flex>
              )}
            </Flex>
          </Grid.Col>
          <Grid.Col span={2}>
            <Flex mt={5} justify={"end"} align={"center"} direction={"row"}>
              <Text style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 88.5, fontSize: 13 }} size={"sm"} fw={400} c="gray">
                {timeAgo(block.updated_at)}
              </Text>
              <Text style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 88.5, fontSize: 13 }} size={"sm"} fw={400} c="gray">
                {timeAgo(block.created_at)}
              </Text>
            </Flex>
          </Grid.Col>
        </Grid>

        <Flex direction="column">
          <InlineSpoiler>
            <Text size={"sm"} c="gray.7">{block.preview}</Text>
            {(block.block_type === "pdf") ? (
              <>
                <div className="flex text-gray-600 ">
                  <img src="/pdf-icon.png" alt="Space Icon" className="mr-1 w-5" />
                  <Text size={"sm"} mt={2} c="gray.7">{block.file_url?.split('/').pop()}</Text>
                </div>
              </>
            ) : null}
          </InlineSpoiler>

          {block.status === 'processing' ?
            (<span className="processing-text">
              <Text size="sm" fw={500}>
                [Processing...]
              </Text>
            </span>)
            :
            block.status === 'failure' ?
              (
                <div>
                  <span className="failed-text">
                    <Text size="sm" fw={500}>
                      [Failed]
                    </Text>
                  </span>

                  {(block.accessLevel != 'editor' && block.accessLevel != "owner") ?
                    null
                    :
                    <button onClick={() => retryProcessBlock()} className="flex items-center gap-2 text-sm font-semibold rounded px-2 py-1 border shadow transition-colors">
                      Retry upload
                    </button>}
                </div>)
              :
              block.status == 'waiting to process' ?
                (<span className="waiting-text">
                  <Text size="sm" fw={500}>
                    [Waiting to process]
                  </Text>
                </span>
                ) : ''}
          {block.inLenses && (
            <BlockLenses lenses={block.inLenses} block_id={block.block_id} />
          )}
        </Flex>

        {/* {!compact && firstTwoLines && false ? (
          <>
            <p className="text-gray-500 text-sm">{formatDate(block.updated_at)}</p>
            <div className="prose text-gray-600 line-clamp-2">
              {firstTwoLines}
            </div>

          </>
        ) : null} */}
      </Flex>
      <Divider mt={11} mb={6} variant="dashed" />

    </div >
  );
}