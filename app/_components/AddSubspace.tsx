'use client';

import { useState } from 'react';
import { FaPlus } from 'react-icons/fa';
import Container from "@components/Container";
import { Button, Flex, Group, Modal, Text, TextInput, LoadingOverlay } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import toast from 'react-hot-toast';

type AddSubspaceProps = {
  lensId: number
  modalController: ReturnType<typeof useDisclosure>
  accessType: string
}
export default function AddSubspace({ lensId, modalController, accessType }: AddSubspaceProps) {
  const [lensName, setLensName] = useState("");
  const [loading, setLoading] = useState(false);
  const supabase = createClientComponentClient();
  const [opened, { close }] = modalController;  

    async function findRoot(lensId) {
      let parents = [lensId];
      let currentLensId = lensId;
  
      while (currentLensId) {
          const { data, error } = await supabase
              .from('lens')
              .select('parent_id')
              .eq('lens_id', currentLensId);
  
          if (error) {
              console.error(`Error fetching space data: ${error.message}`);
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
      setLoading(true);
        let {rootId, parents} = await findRoot(lensId)
        if (!parents.includes(-1)) parents.push(-1)
        const response = await fetch("/api/lens", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ text: lensName, parentId: lensId, root: rootId, parents: parents, accessType: accessType }),
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
  return <Container className="max-w-3xl absolute">
    <Modal zIndex={299} closeOnClickOutside={true} opened={opened} onClose={close} title={<Text size='md' fw={600}>New Subspace</Text>} centered>
      <Modal.Body p={2} pt={0}>
        <LoadingOverlay visible={loading} zIndex={1000} overlayProps={{ radius: "sm", blur: 2 }} />
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
          <Button h={26} style={{ flex: 1, marginLeft: 5 }} size='xs' color="gray" onClick={() => {
            setLensName("");
            close();
          }}>
            Cancel
          </Button>
        </Flex>
      </Modal.Body>
    </Modal>
  </Container>}
