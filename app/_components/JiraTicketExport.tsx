'use client';
import React, { useEffect, useState } from 'react';
import Container from "@components/Container";
import { Button, Select, Flex, Modal, Text, LoadingOverlay, Box } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Block } from "app/_types/block";
import { getUserInfo } from "@utils/googleUtils";

type JiraTicketExportProps = {
  lensId: number;
  modalController: ReturnType<typeof useDisclosure>
  accessType: string
}

function JiraTicketExport({ lensId, modalController }: JiraTicketExportProps) {
  const [opened, { close }] = modalController;
  const [isBlocksLoading, setIsBlocksLoading] = useState<boolean>(true);
  const [isProjectsLoading, setIsProjectsLoading] = useState<boolean>(true);
  const [blocks, setBlocks] = useState([]);
  const [jiraProjects, setJiraProjects] = useState([]);
  const [prdBlockId, setPRDBlockId] = useState<string | null>(null);
  const [projectId, setProjectId] = useState<string | null>(null);

  const handleJiraTicketExport = async () => {
    let prdBlock: Block = null;

    try {
      const response = await getBlock(Number(prdBlockId));
      if (!response.ok) {
        throw new Error(response.statusText);
      }
      const data = await response.json();
      prdBlock = data.data;
    } catch (error) {
      console.error("Failed to create Jira issue:", error);
    }

    if (prdBlock !== null) {
      try {
        const issueBody = JSON.stringify({
          fields: {
            summary: prdBlock.title,
            description: prdBlock.content,
            project: {
                id: projectId
            },
            issuetype: {
                id: 10001 // todo: 10001 is "Task" type. see documentation for issue types. https://confluence.atlassian.com/jirakb/finding-the-id-for-issue-types-646186508.html
            },
          }
        });
        const response = await fetch(`/api/jira/createIssue`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: issueBody,
        });
        if (!response.ok) {
          throw new Error(response.statusText);
        }
      } catch (error) {
        console.error("Failed to create Jira issue:", error);
      }
    }
  };

  const getBlock = async (blockId: number) => {
    try {
      const response = await fetch(`/api/block/${blockId}`);
      if (!response.ok) {
          throw new Error("Error fetching blockId");
      }
      return response;
    } catch (error) {
      console.error("JiraTicketExport:", error);
    }
  }

  const getLensBlocks = async (lensId: number) => {
    setIsBlocksLoading(true);
    let googleUserId = await getUserInfo();
    try {
      const response = await fetch(`/api/lens/${lensId}/getBlocks/${googleUserId}`);
      if (!response.ok) {
          throw new Error("Failed to fetching lens blocks");
      }
      const data = await response.json();
      setBlocks(data.data.map((elem) => ({
        value: String(elem.block_id),
        label: String(elem.title),
      })) || []);
    } catch (error) {
      console.error("JiraTicketExport:", error);
    } finally {
      setIsBlocksLoading(false);
    }
  }

  const fetchProjects = async () => {
    setIsProjectsLoading(true);
    try {
        const response = await fetch(`/api/jira/fetchProjects`);
        if (!response.ok) {
            throw new Error('Failed to fetch Jira projects');
        }
        const data = await response.json();
        setJiraProjects(data.values.map((elem) => ({
          value: elem.id,
          label: elem.name,
        })) || []);
    } catch (error) {
        console.error('JiraTicketExport:', error);
    } finally {
      setIsProjectsLoading(false);
    }
  }

  useEffect(() => {
    getLensBlocks(lensId);
  }, [lensId]);

  useEffect(() => {
    fetchProjects();
  }, []);

  return (
    <Container className="max-w-3xl absolute">
      <Modal zIndex={299} closeOnClickOutside={true} opened={opened} onClose={close} title={<Text size='md' fw={600}>Export New Jira Tickets from PRD</Text>} centered>
        <Modal.Body p={2} pt={0} className="flex flex-col items-end">
          <LoadingOverlay visible={(isBlocksLoading || isProjectsLoading)} zIndex={1000} overlayProps={{ radius: "sm", blur: 2, style: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 } }} />
          <Flex className="flex flex-col w-full mb-3" gap="10px" align="flex-end">
            <Box className="w-full flex flex-col items-center gap-2 mb-5">
              <Text className="w-full" size="18px" fw="bold">Product Requirements Document</Text>
              <Text className="w-full mb-5 text-gray-300" size="xs">
                Select the Product Requirements Document you want to export to Jira.
              </Text>
              <Select
                className="w-full"
                value={prdBlockId}
                placeholder="Enter block title..."
                data={blocks}
                onChange={setPRDBlockId}
                maxDropdownHeight={150}
                searchable
                nothingFoundMessage="None found"
              />
            </Box>
            <Box className="w-full flex flex-col items-center gap-2">
              <Text className="w-full" size="18px" fw="bold">Jira Project</Text>
              <Text className="w-full mb-5 text-gray-300" size="xs">
                Select the Jira Project you want your tickets to be exported to.
              </Text>
              <Select
                className="w-full"
                value={projectId}
                placeholder="Enter Jira project name..."
                data={jiraProjects}
                onChange={setProjectId}
                maxDropdownHeight={150}
                searchable
                nothingFoundMessage="None found"
              />
            </Box>
          </Flex>
          <Flex mt={20} gap="xs" className="w-full flex-1 mt-5">
            <Button size='sm' onClick={handleJiraTicketExport} className="flex-1" disabled={(prdBlockId === null || projectId === null)}>
              Create
            </Button>
            <Button size='sm' color="gray" onClick={close} className="flex-1">
              Cancel
            </Button>
          </Flex>
        </Modal.Body>
      </Modal>
    </Container>
  );
}

export default JiraTicketExport;
