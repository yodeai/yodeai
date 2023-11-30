import React, { useState, useEffect } from 'react';
import { Anchor, Text, Button, Flex } from '@mantine/core';
import BlockComponent from './BlockComponent';
import { PiCaretUpBold, PiCaretDownBold } from "react-icons/pi";

export default function SubspaceComponent({ subspace, hierarchy = 0 }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [blocks, setBlocks] = useState([]);
  const [childSubspaces, setChildSubspaces] = useState([]);

  const handleSubspaceClick = () => {
    window.location.href = `${window.location.pathname}/${subspace.lens_id}`;
  };

  useEffect(() => {
    const fetchData = async () => {
      setFetching(true);

      if (isExpanded) {
        try {
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
      <div style={{ marginLeft: 28 * hierarchy }} className="flex items-center">
        <Button p={0} h={24} mr={4} color='gray' variant='subtle' size="xs" onClick={() => setIsExpanded(!isExpanded)}>
          {isExpanded ?
            <PiCaretDownBold size={18} />
            :
            <PiCaretUpBold size={18} />
          }
        </Button>
        <Anchor size="xs" underline="never" onClick={handleSubspaceClick}>
          <Flex ml={3} align={"center"}>
            <Text size="md" fw={600} c="gray.7">{subspace.name}</Text>
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
              <Text ml={28 * (hierarchy + 1)} size="sm" fw={400} c="gray.6">{fetching ? "" : "No blocks found within this subspace"}</Text>
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