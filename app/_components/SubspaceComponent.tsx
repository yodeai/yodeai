import React, { useState, useEffect } from 'react';
import { Anchor, Text, Button, Flex, Skeleton, Popover, Image } from '@mantine/core';
import BlockComponent from './BlockComponent';
import { PiCaretUpBold, PiCaretDownBold } from "react-icons/pi";
import LoadingSkeleton from './LoadingSkeleton';
import { useRouter } from 'next/navigation';
import { useAppContext } from "@contexts/context";
import OnboardingPopover from './OnboardingPopover';

export default function SubspaceComponent({ subspace, hierarchy = 0 }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [blocks, setBlocks] = useState([]);
  const [childSubspaces, setChildSubspaces] = useState([]);
  const router = useRouter();

  const { onboardingStep, onboardingIsComplete, goToNextOnboardingStep } = useAppContext();

  const handleSubspaceClick = () => {
    if (onboardingStep === 0 && !onboardingIsComplete) goToNextOnboardingStep();

    if (window.location.pathname === "/") return router.push(`/lens/${subspace.lens_id}`)
    else router.push(`${window.location.pathname}/${subspace.lens_id}`)
  };

  useEffect(() => {
    const fetchData = async () => {
      setFetching(true);

      if (isExpanded) {
        try {
          if (onboardingStep === 0 && !onboardingIsComplete) goToNextOnboardingStep();

          const blocksResponse = await fetch(`/api/lens/${subspace.lens_id}/getBlocks`);
          const blocksData = await blocksResponse.json();
          setBlocks(blocksData?.data);

          const subspacesResponse = await fetch(`/api/lens/${subspace.lens_id}/getSubspaces`);
          const subspacesData = await subspacesResponse.json();
          setChildSubspaces(subspacesData?.data);
        } catch (error) {
          console.error("An error occurred:", error);
        } finally {
          setFetching(false);
        }
      }
    };

    fetchData();
  }, [isExpanded, subspace.lens_id]);

  return (
    <div style={{ marginTop: 10 }} className="flex flex-col gap-1">
      <div style={{ marginLeft: Math.min(24 * hierarchy, 300) }} className="flex items-center">
        <Button p={0} h={24} mr={4} color='gray' variant='subtle' size="xs" onClick={() => setIsExpanded(!isExpanded)}>
          {isExpanded ?
            <PiCaretUpBold size={18} />
            :
            <PiCaretDownBold size={18} />
          }
        </Button>
        <Anchor size="xs" underline="never" onClick={handleSubspaceClick}>
          <Flex ml={3} align={"center"}>
            {(subspace.name === "Welcome to Yodeai!" && onboardingStep === 0 && !onboardingIsComplete)
              ?
              <OnboardingPopover
                stepToShow={0}
                width={500}
                position="right-start"
                popoverContent={
                  <>
                    <Text size="sm" mb={10}>Welcome to Yodeai! Here are a few <b>tips</b> to help you get familiar with your Yodeai workspace.</Text>
                    <Text size="sm" mb={10}>Click the <b>Getting Started</b> space to begin.</Text>
                    <Text size="sm">Or, click here to dismiss tips.</Text>
                  </>
                }
              >
                <Text size="md" fw={600} c="gray.7">{subspace.name}</Text>
              </OnboardingPopover>
              :
              <Text size="md" fw={600} c="gray.7">{subspace.name}</Text>
            }
          </Flex>
        </Anchor>
      </div>
      <div>
        {isExpanded && (
          <>
            {(blocks.length > 0) ?
              <div>
                {blocks.map((block) => (
                  <BlockComponent key={block.block_id} block={block} hierarchy={hierarchy + 1} />
                ))}
              </div>
              :
              <Flex ml={Math.min(25 * (hierarchy + 1), 300)} direction={"column"}>
                {fetching ?
                  <>
                    <LoadingSkeleton boxCount={3} lineHeight={15} />
                  </>
                  :
                  <Text size="sm" fw={400} c="gray.6">{"No blocks found within this subspace"}</Text>
                }
              </Flex>
            }
            <div>
              {childSubspaces.map((childSubspace) => (
                <SubspaceComponent key={childSubspace.lens_id} subspace={childSubspace} hierarchy={hierarchy + 1} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}