'use client';

import { useState, useEffect } from 'react';
import Container from "@components/Container";
import { Button, Flex, Modal, Text, LoadingOverlay, Input, Box } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import toast from 'react-hot-toast';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { ActionIcon } from '@mantine/core';
import { FaTrashAlt, FaPlus } from 'react-icons/fa';
import apiClient from '@utils/apiClient';
type AddPainPointTrackerProps = {
    lensId: number;
    modalController: ReturnType<typeof useDisclosure>
    accessType: string
}
export default function AddPainPointTracker({ lensId, modalController }: AddPainPointTrackerProps) {
    const [loading, setLoading] = useState(false);
    const [opened, { close }] = modalController;
    const supabase = createClientComponentClient();
    const [name, updateName] = useState("")
    const [insightAreas, setInsightAreas] = useState<string[]>([]);
    const [numberOfPainPoints, setNumberOfPainPoints] = useState<number>(0); // New state for the number of pain points

    const handleNumberOfPainPointsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(event.target.value);
        setNumberOfPainPoints(value);
    };
    const startPainpointAnalysis = async(spreadsheet_id) => {
        const body = { spreadsheet_id: spreadsheet_id, lens_id: lensId, painpoints: insightAreas, num_clusters: numberOfPainPoints }
        let queued = false
        await apiClient('/painpointAnalysis', 'POST', body)
          .then(result => {
            console.log('Painpoint analysis queued successfully', result);
            queued = true
          })
          .catch(error => {
            console.log('Error doing painpoint analysis: ' + error.message);
          });
        return queued;

    }


    useEffect(() => {
        updateName("");
        setInsightAreas([]);
        setNumberOfPainPoints(0);
    }, [opened])

    const handleCreateSpreadsheet = async () => {
        setLoading(true);
        try {
            const response = await fetch("/api/spreadsheet", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name,
                    lens_id: lensId,
                    dataSource: [],
                    plugin: {
                        name: "pain-point-tracker",
                        data: {},
                        state: { status: "success" }
                    }
                }),
            });
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data = await response.json();
            // make a call to backend
            const spreadsheet_id = data["data"][0]["spreadsheet_id"]
            const queued_request = await startPainpointAnalysis(spreadsheet_id)
            if (!queued_request) {
                const { error } = await supabase
                .from('spreadsheet')
                .delete()
                .eq('spreadsheet_id', spreadsheet_id)
                console.log("Error in deleting", error)
                return
            }
            close();
            toast.success("Spreadsheet created successfully.", data);
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
    return (
        <Container className="max-w-3xl absolute">
            <Modal zIndex={299} closeOnClickOutside={true} opened={opened} onClose={close} title={<Text size='md' fw={600}>New Pain Point Tracker</Text>} centered>
                <Modal.Body p={2} pt={0}>
                    <LoadingOverlay visible={loading} zIndex={1000} overlayProps={{ radius: "sm", blur: 2 }} />
                    <Flex key="name" className="w-full mb-5">
                        <Input.Wrapper label="Spreadsheet name" className="w-full">
                            <Input
                                id="whiteboardName"
                                className="mt-0.5 w-full"
                                placeholder="Enter name of the spreadsheet"
                                value={name}
                                onChange={(event) => updateName(event.currentTarget.value)}
                            />
                        </Input.Wrapper>
                    </Flex>
                    <Box className="w-full flex flex-col items-center gap-2 mb-2">
                        <Text className="w-full" size="18px" fw="bold">Pain Points</Text>
                        <Text className="w-full mb-5 text-gray-300" size="xs">
                            If you would like to autogenerate painpoints from the reviews, enter the number of painpoints you wish to extract.
                        </Text>
                    </Box>
                    <Flex mt={10} className = "flex-1 w-full flex-col">
                        <Input
                            type="number"
                            min={1}
                            max={9}
                            value={numberOfPainPoints.toString()}
                            onChange={handleNumberOfPainPointsChange}
                            className="w-full"
                        />
                    </Flex>

                    <Box mt={10} className="w-full flex flex-col items-center gap-2 mb-2">
                        <Text className="w-full" size="18px" fw="bold">Pain Points</Text>
                        <Text className="w-full mb-5 text-gray-300" size="xs">
                            If you would like to provide your own painpoints, enter the painpoints you wish to extract from reviews.
                        </Text>
                    </Box>

                    <Flex className="flex-1 w-full flex-col">
                        {insightAreas.map((area, index) => (
                            <Flex key={index} className="w-full mb-3" gap="10px" align="flex-end">
                                <Input
                                    className="mt-0.5 flex-1"
                                    placeholder={`Painpoint ${index + 1}`}
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

                    <Flex mt={10} gap="xs">
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

                    <Flex mt={20} gap="xs">
                        <Button h={26} style={{ flex: 1 }} size='xs' onClick={handleCreateSpreadsheet}>
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
