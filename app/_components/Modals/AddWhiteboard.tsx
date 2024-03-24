'use client';

import { useEffect, useState } from 'react';

import Container from "@components/Container";
import { Button, Flex, Group, Modal, Text, TextInput, LoadingOverlay } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import toast from 'react-hot-toast';

type AddWhiteboard = {
  lensId: number
  modalController: ReturnType<typeof useDisclosure>
  accessType: string
}
export default function AddWhiteBoard({ lensId, modalController, accessType }: AddWhiteboard) {
  const [whiteboardName, setWhiteboardName] = useState("");
  const [loading, setLoading] = useState(false);

  const supabase = createClientComponentClient();
  const [opened, { close }] = modalController;

  const handleCreateWhiteBoard = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/whiteboard", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: whiteboardName,
          lens_id: lensId,
          payload: []
        }),
      });
      if (!response.ok) {
        setWhiteboardName("");
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      close();
      toast.success("Whiteboard created successfully.", data);
      setWhiteboardName("");
    } catch (e) {
      toast.error("Something went wrong. Please try again later.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    return () => {
      setWhiteboardName("");
    }
  }, [opened]);

  return <Container className="max-w-3xl absolute">
    <Modal zIndex={299} closeOnClickOutside={true} opened={opened} onClose={close} title={<Text size='md' fw={600}>New Whiteboard</Text>} centered>
      <Modal.Body p={2} pt={0}>
        <LoadingOverlay visible={loading} zIndex={1000} overlayProps={{ radius: "sm", blur: 2 }} />
        <Group>
          <Flex w={'100%'} direction={"column"}>
            <TextInput
              style={{ width: '100%' }}
              size='xs'
              label="Whiteboard name"
              value={whiteboardName}
              onChange={(e) => setWhiteboardName(e.target.value)}
              placeholder="Enter whiteboard name"
            />
          </Flex>
        </Group>
        <Flex mt={20}>
          <Button loading={loading} h={26} style={{ flex: 1, marginRight: 5 }} size='xs' color="blue" onClick={handleCreateWhiteBoard}>
            Create
          </Button>
          <Button h={26} style={{ flex: 1, marginLeft: 5 }} size='xs' color="gray" onClick={() => {
            setWhiteboardName("");
            close();
          }}>
            Cancel
          </Button>
        </Flex>
      </Modal.Body>
    </Modal>
  </Container>
}
