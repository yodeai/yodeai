'use client';

import { useState, useEffect } from 'react';
import Container from "@components/Container";
import { Button, Flex, Modal, Text, LoadingOverlay, Input, Box, Checkbox } from '@mantine/core';
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
    const [appName, updateAppName] = useState("");
    const [insightAreas, setInsightAreas] = useState<string[]>([]);
    const [numberOfPainPoints, setNumberOfPainPoints] = useState<number>(1); // New state for the number of pain points
    const [generatePainPoints, setGeneratePainPoints] = useState(false);
    const [gatherReviews, setGatherReviews] = useState(false);


    const handleNumberOfPainPointsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(event.target.value);
        setNumberOfPainPoints(value);
    };
    const startPainpointAnalysis = async (spreadsheet_id) => {
        const { data: { user } } = await supabase.auth.getUser()

        const user_id = user.id;
        const body = { owner_id: user_id, spreadsheet_id: spreadsheet_id, lens_id: lensId, painpoints: insightAreas, num_clusters: numberOfPainPoints, app_name: appName }
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
                    dataSource: {},
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
            <Modal zIndex={299} closeOnClickOutside={true} opened={opened} onClose={close} title={<Text size='md' fw={600}>New Pain Points Tracker</Text>} centered>
                <Modal.Body p={2} pt={0}>
                    <LoadingOverlay visible={loading} zIndex={1000} overlayProps={{ radius: "sm", blur: 2 }} />
                    <Flex key="name" className="w-full mb-5">
                        <Input.Wrapper label="Spreadsheet name" className="w-full mt-2">
                            <Input
                                id="whiteboardName"
                                className="w-full"
                                placeholder="Enter name of the spreadsheet"
                                value={name}
                                onChange={(event) => updateName(event.currentTarget.value)}
                            />
                        </Input.Wrapper>
                    </Flex>
                    {/* <Flex mt={10} className="flex-1 w-full flex-col">
                        <Checkbox
                            icon={() => <></>}
                            checked={gatherReviews}
                            onChange={(event) => setGatherReviews(event.currentTarget.checked)}
                            label="Gather reviews to populate this current space"
                        />
                    </Flex> */}
                    {gatherReviews ?
                        <Flex key="app_name" className="w-full mb-5 mt-3">
                            <Input.Wrapper label="App Name" className="w-full">
                                <Input
                                    id="appName"
                                    className="mt-0.5 w-full"
                                    placeholder="Enter the name of the app from the Apple App Store"
                                    value={appName}
                                    onChange={(event) => updateAppName(event.currentTarget.value)}
                                />
                            </Input.Wrapper>
                        </Flex>
                        : null
                    }
                    <Flex mb={20} className="flex-1 w-full flex-col">
                        <Checkbox
                            icon={() => <></>}
                            checked={generatePainPoints}
                            onChange={(event) => {setGeneratePainPoints(event.currentTarget.checked); setNumberOfPainPoints(1); setInsightAreas([])}}
                            label="Autogenerate Painpoints"
                        />
                    </Flex>

                    {generatePainPoints ?
                        <div>
                            <Box className="w-full flex flex-col items-center gap-2 mb-2">
                                <Text className="w-full" size="18px" fw="bold">Pain Points</Text>
                                <Text className="w-full mb-5 text-gray-300" size="xs">
                                    Enter the max number of painpoints you wish to extract.
                                </Text>
                            </Box>
                            <Flex mt={10} className="flex-1 w-full flex-col">
                                <Input
                                    type="number"
                                    min={1}
                                    max={9}
                                    value={numberOfPainPoints.toString()}
                                    onChange={handleNumberOfPainPointsChange}
                                    className="w-full"
                                />
                            </Flex>
                        </div>
                        :
                        <div>
                            <Box className="w-full flex flex-col items-center gap-2 mb-2">
                                <Text className="w-full" size="18px" fw="bold">Pain Points</Text>
                                <Text className="w-full mb-5 text-gray-300" size="xs">
                                    Enter the painpoints you wish to extract from reviews.
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
                        </div>}



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