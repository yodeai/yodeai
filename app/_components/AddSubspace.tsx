'use client';

import { useState } from 'react';
import { FaPlus } from 'react-icons/fa';
import Container from "@components/Container";
import { Button, Flex, Group, Modal, Text, TextInput } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import toast from 'react-hot-toast';

export default function DefaultModal({ lensId }) {
  const [lensName, setLensName] = useState("");
  const [loading, setLoading] = useState(false);

  const [opened, { open, close }] = useDisclosure(false);
  const supabase = createClientComponentClient();

  async function findRoot(lensId) {
    let currentLensId = lensId;

    while (currentLensId) {
      const { data, error } = await supabase
        .from('lens')
        .select('parent_id')
        .eq('lens_id', currentLensId);

      if (error) {
        console.error(`Error fetching lens data: ${error.message}`);
        return null; // or handle the error accordingly
      }

      const parent_id = data[0]?.parent_id;

      if (parent_id === -1) {
        return currentLensId; // Found the root lens
      }

      currentLensId = parent_id;
    }

    return null; // No root lens found, handle accordingly
  }

  const handleCreateLens = async () => {
    setLoading(true);
    let rootId = await findRoot(lensId)

    console.log("creating subspace", { text: lensName, parentId: lensId, root: rootId })
    const response = await fetch("/api/lens", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text: lensName, parentId: lensId, root: rootId }),
    });
    if (!response.ok) {
      setLensName("");
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    close();
    toast.success("Subspace created successfully", data);
    setLensName("");
    setLoading(false);
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
              <Button loading={loading} h={26} style={{ flex: 1, marginRight: 5 }} size='xs' color="blue" onClick={handleCreateLens}>
                Create
              </Button>
              <Button loading={loading} h={26} style={{ flex: 1, marginLeft: 5 }} size='xs' color="gray" onClick={() => {
                setLensName("");
                close();
              }}>
                Cancel
              </Button>
            </Flex>
          </Modal.Body>
        </Modal>
      </Container>
    </>
  )
}


