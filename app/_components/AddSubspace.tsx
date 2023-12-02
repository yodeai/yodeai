'use client';

import { useState, useEffect } from 'react';
import { Lens } from "app/_types/lens";
import { FaPlus } from 'react-icons/fa';
import { LinkIcon } from '@heroicons/react/20/solid'
import formatDate from "@lib/format-date";
import { useRouter } from 'next/navigation';
import apiClient from '@utils/apiClient';
import Container from "@components/Container";
import { Button, Flex, Group, List, ListItem, Modal, Select, Text, TextInput, Title, Tooltip } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useAppContext } from '@contexts/context';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function DefaultModal({ lensId }) {
    const [openModal, setOpenModal] = useState<string | undefined>();
    const props = { openModal, setOpenModal };
    const [lensName, setLensName] = useState("");
    const router = useRouter();
    const {setLensId} = useAppContext();
    const [opened, { open, close }] = useDisclosure(false);
    const supabase = createClientComponentClient();

    async function findRoot(lensId) {
      let parents = [lensId];
      let currentLensId = lensId;
  
      while (currentLensId) {
          const { data, error } = await supabase
              .from('lens')
              .select('parent_id')
              .eq('lens_id', currentLensId);
  
          if (error) {
              console.error(`Error fetching lens data: ${error.message}`);
              return { rootId: null, parents }; // or handle the error accordingly
          }
  
          const parent_id = data[0]?.parent_id;
          parents.push(parent_id);
  
          if (parent_id === -1) {
              return { rootId: currentLensId, parents }; // Found the root lens
          }
  
          currentLensId = parent_id;
      }
  
      return { rootId: null, parents }; // No root lens found, handle accordingly
  }
  
    const handleCreateLens = async () => {
        let {rootId, parents} = await findRoot(lensId)
        if (!parents.includes(-1)) parents.push(-1)
        const response = await fetch("/api/lens", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ text: lensName, parentId: lensId, root: rootId, parents: parents }),
        });
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        const newLensId = data.data[0].lens_id;
        // Route to the new lens page and pass a 'edit' query parameter
        setLensId(newLensId);
        router.push(`${window.location.pathname}/${newLensId}`);
      };

    return (
        <>
            <Button
                size="xs"
                variant="subtle"
                onClick={open}
                leftSection={<FaPlus />}
                data-tooltip-target="tooltip-animation"
            >
                Add Subspace
            </Button>

            <Container className="max-w-3xl absolute">
                <Modal zIndex={299} closeOnClickOutside={false} opened={opened} onClose={close} title={<Text size='md' fw={600}>New Subspace</Text>} centered>
                    <Modal.Body p={2} pt={0}>
                        <Group>                    
                            <Flex w={'100%'} direction={"column"}>
                                <TextInput
                                    style={{ width: '100%' }}
                                    size='xs'
                                    label="New Subspace name"
                                    value={lensName}
                                    onChange={(e) => setLensName(e.target.value)}
                                    placeholder="Enter subspace name"
                                />
                            </Flex>
                        </Group>
                        <Flex mt={20}>
                            <Button h={26} style={{ flex: 1, marginRight: 5 }} size='xs' color="blue" onClick={handleCreateLens}>
                                Create
                            </Button>
                            <Button h={26} style={{ flex: 1, marginLeft: 5 }} size='xs' color="gray" onClick={close}>
                                Cancel
                            </Button>
                        </Flex>
                    </Modal.Body>
                </Modal>
            </Container>
        </>
    )
}


