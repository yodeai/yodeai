'use client';

import { useState, useEffect } from 'react';
import Container from "@components/Container";
import { Button, Flex, Modal, Text, LoadingOverlay, Input, Box, Checkbox, Select } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import toast from 'react-hot-toast';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import apiClient from '@utils/apiClient';
import { useContentContext } from '@contexts/content';

type AddWidgetModalProps = {
    lensId: number;
    modalController: ReturnType<typeof useDisclosure>
    accessType: string
}
export default function AddWidgetModal({ lensId, modalController }: AddWidgetModalProps) {
    const [loading, setLoading] = useState(false);
    const [opened, { close }] = modalController;
    const [prdBlockId, setPRDBlockId] = useState<string | null>(null);
    const { blocks } = useContentContext();
    const [formattedBlocks, setFormattedBlocks] = useState([]);
    const [isBlocksLoading, setIsBlocksLoading] = useState<boolean>(true);
    const supabase = createClientComponentClient();
    const defaultFormValue = {
        name: "",
        fields: []
    }


    const [form, setForm] = useState(defaultFormValue);




    const startJiraGeneration = async (widget_id) => {
        const body = { widget_id, prd_block_id: prdBlockId, fields: form["fields"]}
        let queued = false
        await apiClient('/jiraGeneration', 'POST', body)
          .then(result => {
            console.log('Jira generation queued successfully', result);
            queued = true
          })
          .catch(error => {
            console.log('Error doing jira generation: ' + error.message);
          });
        return queued;
    
      }

    const formatBlocks = async () => {
        setIsBlocksLoading(true);
        try {
          setFormattedBlocks(blocks.map((elem) => ({
            value: String(elem.block_id),
            label: String(elem.title),
          })) || []);
        } catch (error) {
          console.error("JiraTicketExport:", error);
        } finally {
          setIsBlocksLoading(false);
        }
      }

    useEffect(() => {
        setForm(defaultFormValue);
    }, [opened])

    useEffect(() => {
        formatBlocks();
      }, [blocks]);
    const handleCreateWidget = async () => {
        setLoading(true);
        try {
            const response = await fetch("/api/widget", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: form.name,
                    input: {
                        fields: form.fields
                    },
                    type: "prd-to-tickets",
                    lens_id: lensId,
                    state: {
                        status: "waiting"
                    }
                }),
            });
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data = await response.json();
            const widget_id = data["data"][0]["widget_id"]
            const queued_request = await startJiraGeneration(widget_id)
            if (!queued_request) {
              const { error } = await supabase
                .from('widget')
                .delete()
                .eq('widget_id', widget_id)
              console.log("Error in deleting", error)
              return
            }

            close();
            toast.success("Widget created successfully.", data);
        } catch (e) {
            toast.error("Something went wrong. Please try again later.");
        } finally {
            setLoading(false);
        }
    }

    const onFormChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    }

    const onFormFieldsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = event.target;
        if (checked) {
            setForm((prev) => ({ ...prev, fields: [...prev.fields, name] }));
        } else {
            setForm((prev) => ({ ...prev, fields: prev.fields.filter((field) => field !== name) }));
            return;
        }
    }

    return (
        <Container className="max-w-3xl absolute">
            <Modal zIndex={299} closeOnClickOutside={true} opened={opened} onClose={close} title={<Text size='md' fw={600}>New Widget</Text>} centered>
                <Modal.Body p={2} pt={0}>
                    <LoadingOverlay visible={loading} zIndex={1000} overlayProps={{ radius: "sm", blur: 2 }} />
                    <Flex key="name" className="w-full mb-5">
                        <Input.Wrapper label="Widget name" className="w-full">
                            <Input
                                id="whiteboardName"
                                className="mt-0.5 w-full"
                                name="name"
                                placeholder="Enter name of the widget"
                                value={form.name}
                                onChange={onFormChange}
                            />
                        </Input.Wrapper>
                    </Flex>
                    <LoadingOverlay visible={isBlocksLoading} zIndex={1000} overlayProps={{ radius: "sm", blur: 2, style: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 } }} />
                    <Flex className="flex flex-col w-full mb-3" gap="10px" align="flex-end">

                        <Box className="w-full flex flex-col items-center gap-2 mb-5">
                        <Input.Wrapper label="Product Requirements Document" className="w-full">
                            <Text className="w-full mb-5 text-gray-300" size="xs">
                                Select the Product Requirements Document you want to create Tickets from.
                            </Text>
                            <Select
                                className="w-full"
                                value={prdBlockId}
                                placeholder="Enter block title..."
                                data={formattedBlocks}
                                onChange={setPRDBlockId}
                                maxDropdownHeight={150}
                                searchable
                                nothingFoundMessage="None found"
                            />
                             </Input.Wrapper>

                            </Box>
                            
                        </Flex>

                    {/* 
                    [“Acceptance criteria/scope”, “Background”, “Priority level”, “In and out of scope”,“User story”, “Technical considerations”, “Design field”, “Questions”]
                    */}

                    <Input.Wrapper label="Fields" className="flex flex-col gap-2">
                        <Checkbox icon={() => <></>} name="Acceptance criteria/scope" label="Acceptance criteria/scope" checked={form.fields.includes("Acceptance criteria/scope")} onChange={onFormFieldsChange} />
                        <Checkbox icon={() => <></>} name="Background" label="Background" checked={form.fields.includes("Background")} onChange={onFormFieldsChange} />
                        <Checkbox icon={() => <></>} name="In and out of scope" label="In and out of scope" checked={form.fields.includes("In and out of scope")} onChange={onFormFieldsChange} />
                        <Checkbox icon={() => <></>} name="Priority level" label="Priority level" checked={form.fields.includes("Priority level")} onChange={onFormFieldsChange} />
                        <Checkbox icon={() => <></>} name="User story" label="User story" checked={form.fields.includes("User story")} onChange={onFormFieldsChange} />
                        <Checkbox icon={() => <></>} name="Technical considerations" label="Technical considerations" checked={form.fields.includes("Technical considerations")} onChange={onFormFieldsChange} />
                        <Checkbox icon={() => <></>} name="Design field" label="Design field" checked={form.fields.includes("Design field")} onChange={onFormFieldsChange} />
                        <Checkbox icon={() => <></>} name="Questions" label="Questions" checked={form.fields.includes("Questions")} onChange={onFormFieldsChange} />
                    </Input.Wrapper>

                    <Flex mt={20} gap="xs">
                        <Button h={26} style={{ flex: 1 }} size='xs' onClick={handleCreateWidget}>
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
