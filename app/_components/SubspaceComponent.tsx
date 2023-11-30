import React, { useState, useEffect } from 'react';
import { Anchor, Text, Button, Flex } from '@mantine/core';
import BlockComponent from './BlockComponent';
import { FaCaretDown, FaCaretUp, FaCube } from 'react-icons/fa';

export default function SubspaceComponent({ subspace, leftSpace = 0 }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [blocks, setBlocks] = useState([]);
  const [childSubspaces, setChildSubspaces] = useState([]);

  const handleSubspaceClick = () => {
    window.location.href = `${window.location.pathname}/${subspace.lens_id}`;
  };

  useEffect(() => {
    if (isExpanded) {
      fetch(`/api/lens/${subspace.lens_id}/getBlocks`)
        .then((response) => response.json())
        .then((data) => setBlocks(data?.data));

      fetch(`/api/lens/${subspace.lens_id}/getSubspaces`)
        .then((response) => response.json())
        .then((data) => setChildSubspaces(data?.data));
    }
  }, [isExpanded, subspace.lens_id]);

  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between items-center">
        <Anchor size="xs" underline="never" onClick={handleSubspaceClick}>
          <Flex ml={3} align={"center"}>
            <FaCube size={12} color='gray' style={{ marginRight: 6.5 }} />
            <Text size="md" fw={600} c="gray.7">{subspace.name}</Text>
          </Flex>
        </Anchor>
        <Button variant='subtle' size="xs" onClick={() => setIsExpanded(!isExpanded)}>
          {isExpanded ?
            <FaCaretUp size={20} />
            :
            <FaCaretDown size={20} />
          }
        </Button>
      </div>
      <div style={{ marginLeft: 20 * (leftSpace) }}>
        {isExpanded && (
          <div>
            {/* Render Blocks */}
            {blocks.map((block) => (
              <BlockComponent key={block.block_id} block={block} />
            ))}
            {/* Render Child Subspaces */}
            {childSubspaces.map((childSubspace) => (
              <SubspaceComponent key={childSubspace.lens_id} subspace={childSubspace} leftSpace={1} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}