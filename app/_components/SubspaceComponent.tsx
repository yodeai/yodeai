import React, { useState, useEffect, useMemo } from 'react';
import { Anchor, Text, Button, Flex, Skeleton } from '@mantine/core';
import BlockComponent from './BlockComponent';
import { PiCaretUpBold, PiCaretDownBold } from "react-icons/pi";
import LoadingSkeleton from './LoadingSkeleton';
import { useRouter } from 'next/navigation';
import { getUserInfo } from '@utils/googleUtils';
import { Lens, Subspace } from 'app/_types/lens';
import { Block } from 'app/_types/block';

type SubspaceComponentProps = {
  subspace: Subspace | Lens;
  leftComponent?: (type: string, id: Lens["lens_id"]) => React.ReactNode;
}
export default function SubspaceComponent({ leftComponent, subspace }: SubspaceComponentProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [childSubspaces, setChildSubspaces] = useState([]);
  const router = useRouter();

  const handleSubspaceClick = () => {
    if (window.location.pathname === "/") return router.push(`/lens/${subspace.lens_id}`)
    else router.push(`${window.location.pathname}/${subspace.lens_id}`)
  };

  useEffect(() => {
    const fetchData = async () => {
      setFetching(true);

      if (isExpanded) {
        try {
          let googleUserId = await getUserInfo();
          const blocksResponse = await fetch(`/api/lens/${subspace.lens_id}/getBlocks/${googleUserId}`);
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
      <div className="flex items-center">
        <Button p={0} h={24} mr={4} color='gray' variant='subtle' size="xs" onClick={() => setIsExpanded(!isExpanded)}>
          {isExpanded ?
            <PiCaretUpBold size={18} />
            :
            <PiCaretDownBold size={18} />
          }
        </Button>
        <Anchor size="xs" underline="never" onClick={handleSubspaceClick}>
          <Flex ml={3} align={"center"}>
            <Text size="md" fw={600} c="gray.7">{subspace.name}</Text>
          </Flex>
        </Anchor>
      </div>
      <div style={{ marginLeft: 24 }}>
        {isExpanded && (
          <>
            {(blocks.length > 0) ?
              <div>
                {blocks.map((block) => (<div className="flex rounded-md">
                  {leftComponent && leftComponent("block", block.block_id)}
                  <div key={block.block_id} className="flex-1">
                    <BlockComponent key={block.block_id} block={block} />
                  </div>
                </div>))}
              </div>
              :
              <Flex direction={"column"}>
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
              {childSubspaces.map((childSubspace) => (<div className="flex rounded-md">
                {leftComponent && leftComponent("lens", childSubspace.lens_id)}
                <div className="flex-1">
                  <SubspaceComponent
                    leftComponent={leftComponent}
                    key={childSubspace.lens_id} subspace={childSubspace} />
                </div>
              </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}