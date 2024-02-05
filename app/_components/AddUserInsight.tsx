'use client';

import { useState, useEffect } from 'react';
import Container from "@components/Container";
import { Button, Flex, Modal, Text, LoadingOverlay, Textarea } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import toast from 'react-hot-toast';

import WhiteboardMockData from 'app/_assets/whiteboard.userinsight.mock.raw.json';
import { WhiteboardPluginParams } from 'app/_types/whiteboard';
import apiClient from '@utils/apiClient';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

type AddUserInsightProps = {
  lensId: number;
  modalController: ReturnType<typeof useDisclosure>
  accessType: string
}
export default function AddUserInsight({ lensId, modalController }: AddUserInsightProps) {
  const [loading, setLoading] = useState(false);
  const [opened, { close }] = modalController;
  const [text, setText] = useState("");
  const supabase = createClientComponentClient();

  useEffect(() => {
    setText("");
  }, [opened])

  const startUserAnalysis = async(whiteboard_id, lensId) => {
    const body = { whiteboard_id: whiteboard_id, lens_id: lensId, topics: text.split(",")}
    let queued = false
    await apiClient('/userAnalysis', 'POST', body)
      .then(result => {
        console.log('Competitive analysis queued successfully', result);
        queued = true
      })
      .catch(error => {
        console.log('Error doing competitive analysis: ' + error.message);
      });
    return queued;
  }
  const handleCreateWhiteBoard = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/whiteboard", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: "User Insight",
          lens_id: lensId,
          payload: WhiteboardMockData,
          plugin: {
            name: "user-insight",
            rendered: false,
            data: {
              text,
            },
            state: {
              status: "waiting"
            }
          } as WhiteboardPluginParams
        }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      // make a call to backend
      const whiteboard_id = data["data"][0]["whiteboard_id"]
      const queued_request = await startUserAnalysis(whiteboard_id, lensId)
      if (!queued_request) {
        const { error } = await supabase
          .from('whiteboard')
          .delete()
          .eq('whiteboard_id', whiteboard_id)
        console.log("Error in deleting", error)
        return
      }
      close();
      toast.success("User analysis created successfully.", data);
    } catch (e) {
      toast.error("Something went wrong. Please try again later.");
    } finally {
      setLoading(false);
    }
  }

  return <Container className="max-w-3xl absolute">
    <Modal zIndex={299} closeOnClickOutside={true} opened={opened} onClose={close} title={<Text size='md' fw={600}>New User Insight</Text>} centered>
      <Modal.Body p={2} pt={0}>
        <LoadingOverlay visible={loading} zIndex={1000} overlayProps={{ radius: "sm", blur: 2 }} />

        <Flex className="flex-1 w-full">
          <Textarea
            className="w-full"
            autosize
            minRows={4}
            placeholder=""
            description=""
            label="Add insight areas, separating each area by a comma."
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
