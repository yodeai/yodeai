'use client';

import { useState, useEffect } from 'react';
import Container from "@components/Container";
import { Button, Flex, Modal, Text, LoadingOverlay, Input, Box } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import toast from 'react-hot-toast';

import WhiteboardMockData from 'app/_assets/whiteboard.userinsight.mock.raw.json';
import { WhiteboardPluginParams } from 'app/_types/whiteboard';
import apiClient from '@utils/apiClient';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { ActionIcon, MultiSelect } from '@mantine/core';

import { FaTrashAlt} from '@react-icons/all-files/fa/FaTrashAlt';
import { FaPlus } from '@react-icons/all-files/fa/FaPlus';

import { useContentContext } from '@contexts/content';

type AddUserInsightProps = {
  lensId: number;
  modalController: ReturnType<typeof useDisclosure>
  accessType: string
}
export default function AddUserInsight({ lensId, modalController }: AddUserInsightProps) {
  const [loading, setLoading] = useState(false);
  const [opened, { close }] = modalController;
  const supabase = createClientComponentClient();
  const [name, updateName] = useState("User Analysis")
  const [insightAreas, setInsightAreas] = useState<string[]>([]);
  const [blockIds, setBlockIds] = useState({});
  const [selectedPages, setSelectedPages] = useState<string[]>([]);

  const { blocks } = useContentContext();

  const selectCustomBlocks = async () => {
    let blockIdsObject = {};
    let selectedPagesArray = [];
    blocks.forEach(block => {
      blockIdsObject[block.title] = block.block_id;
      selectedPagesArray.push(block.title);
    });
    setBlockIds(blockIdsObject);
    setSelectedPages(selectedPagesArray);
  };

  useEffect(() => {
    setBlockIds({});
    setSelectedPages([]);
    setInsightAreas([]);

    selectCustomBlocks();
  }, [opened]);

  const startUserAnalysis = async (whiteboard_id, lensId) => {
    const body = { whiteboard_id: whiteboard_id, lens_id: lensId, topics: insightAreas, block_ids: selectedPages.map(selectedPage => blockIds[selectedPage]) }
    let queued = false
    await apiClient('/userAnalysis', 'POST', body)
      .then(result => {
        console.log('User analysis queued successfully', result);
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
          name: name,
          lens_id: lensId,
          payload: WhiteboardMockData,
          plugin: {
            name: "user-insight",
            rendered: false,
            data: {
              insightAreas,
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
  const addInsightArea = () => {
    setInsightAreas((prevAreas) => [...prevAreas, ""]);
  };

  const updateInsightArea = (index: number, value: string) => {
    setInsightAreas((prevAreas) => {
      const updatedAreas = [...prevAreas];
      updatedAreas[index] = value;
      return updatedAreas;
    });
  };

  const handleDeleteInsightArea = (index: number) => {
    setInsightAreas((prevAreas) => {
      const updatedAreas = [...prevAreas];
      updatedAreas.splice(index, 1);
      return updatedAreas;
    });
  };
  const handleSelectChange = (value: string[]) => {
    setSelectedPages(value);
  };
  return (
    <Container className="max-w-3xl absolute">
      <Modal zIndex={299} closeOnClickOutside={true} opened={opened} onClose={close} title={<Text size='md' fw={600}>New User Analysis</Text>} centered>
        <Modal.Body p={2} pt={0}>
          <LoadingOverlay visible={loading} zIndex={1000} overlayProps={{ radius: "sm", blur: 2 }} />
          
          <Flex key="name" className="w-full mb-5">
            <Input.Wrapper label="Analysis Name" className="w-full">
              <Input
                id="whiteboardName"
                className="mt-0.5 w-full"
                placeholder="Enter user analysis name"
                onChange={(event) => updateName(event.currentTarget.value)}
              />
            </Input.Wrapper>
          </Flex>


          <Box className="w-full flex flex-col items-center gap-2 mb-2">
            <Text className="w-full" size="18px" fw="bold">User Insight Areas</Text>
            <Text className="w-full mb-2 text-gray-500" size="xs">
              Enter the topics you wish to extract from these user interviews. If left blank, then topics will be auto extracted.
            </Text>
          </Box>

          <Flex className="flex-1 w-full flex-col">
            {insightAreas.map((area, index) => (
              <Flex key={index} className="w-full mb-3" gap="10px" align="flex-end">
                <Input
                  className="mt-0.5 flex-1"
                  placeholder={`Topic ${index + 1}`}
                  value={area}
                  onChange={(event) => updateInsightArea(index, event.currentTarget.value)}
                />

                <ActionIcon
                  onClick={() => handleDeleteInsightArea(index)}
                  size="md"
                  color="red"
                  variant="gradient"
                  gradient={{ from: 'red', to: 'pink', deg: 255 }}
                  mb={4}
                >
                  <FaTrashAlt size={14} />
                </ActionIcon>
              </Flex>
            ))}
          </Flex>

          <Flex mt={10} mb={20} gap="xs">
            <Button unstyled
              leftSection={<FaPlus size="14px" />}
              classNames={{
                section: "h-[14px]",
                inner: "flex items-center justify-center gap-2"
              }}
              onClick={addInsightArea}
              className="border border-gray-400 text-gray-400 rounded-md border-dashed bg-transparent px-3 py-1.5 text-xs cursor-pointer hover:bg-gray-100 w-full">
              Add more
            </Button>
          </Flex>

          <Box className="w-full flex flex-col items-center gap-2 mb-2">
            <Text className="w-full" size="18px" fw="bold">Pages to include</Text>
            <Text className="w-full mb-2 text-gray-500" size="xs">
              Adjust the pages you would like to include in the analysis.
            </Text>
            <Flex className="flex-1 w-full flex-col">
              <MultiSelect
                data={Object.keys(blockIds)}
                value={selectedPages}
                searchable
                onChange={handleSelectChange}
              />
            </Flex>
          </Box>

          <Flex mt={20} gap="xs">
            <Button h={26} style={{ flex: 1 }} size='xs' onClick={handleCreateWhiteBoard}>
              Create
            </Button>
            <Button h={26} style={{ flex: 1 }} size='xs' color="gray" onClick={() => close()}>
              Cancel
            </Button>
          </Flex>
        </Modal.Body>
      </Modal>
    </Container>
  );
}
