'use client';

import { useState } from 'react';
import Container from "@components/Container";
import { Button, Flex, Modal, Text, LoadingOverlay, Textarea } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import toast from 'react-hot-toast';

import WhiteboardMockData from 'app/_assets/whiteboard.competitiveanalysis.raw.json';
import { WhiteboardPluginParams } from 'app/_types/whiteboard';

type AddCompetitiveAnalysisProps = {
  lensId: number;
  modalController: ReturnType<typeof useDisclosure>
  accessType: string
}
export default function AddCompetitiveAnalysis({ lensId, modalController }: AddCompetitiveAnalysisProps) {
  const [loading, setLoading] = useState(false);
  const [opened, { close }] = modalController;
  const [text, setText] = useState("");

  const handleCreateWhiteBoard = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/whiteboard", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: "Competitive Analysis",
          lens_id: lensId,
          payload: WhiteboardMockData,
          plugin: {
            name: "competitive-analysis",
            rendered: false,
            data: { text },
            state: {
              status: "queued",
              progress: 0,
              message: "Quequed for rendering",
            }
          } as WhiteboardPluginParams
        }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      close();
      toast.success("Competitive Analysis created successfully.", data);
    } catch (e) {
      toast.error("Something went wrong. Please try again later.");
    } finally {
      setLoading(false);
    }
  }

  return <Container className="max-w-3xl absolute">
    <Modal zIndex={299} closeOnClickOutside={true} opened={opened} onClose={close} title={<Text size='md' fw={600}>New Competitive Analysis</Text>} centered>
      <Modal.Body p={2} pt={0}>
        <LoadingOverlay visible={loading} zIndex={1000} overlayProps={{ radius: "sm", blur: 2 }} />

        <Flex className="flex-1 w-full">
          <Textarea
            className="mt-0.5 w-full"
            autosize
            minRows={4}
            placeholder="Put analysis here, multiple lines are allowed."
            description="" label=""
            value={text}
            onChange={(event) => setText(event.currentTarget.value)}
          />
        </Flex>

        <Flex mt={20} gap="xs">
          <Button h={26} style={{ flex: 1 }} size='xs' onClick={handleCreateWhiteBoard}>
            Create
          </Button>
          <Button h={26} style={{ flex: 1 }} size='xs' color="gray" onClick={() => {
            close();
          }}>
            Cancel
          </Button>
        </Flex>
      </Modal.Body>
    </Modal>
  </Container>
}
