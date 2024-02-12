'use client';

import { useState, useEffect } from 'react';
import Container from "@components/Container";
import { Button, Flex, Modal, Text, LoadingOverlay, Input, Box } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import toast from 'react-hot-toast';

import { SpreadsheetPluginParams } from 'app/_types/spreadsheet';
import SpreadsheetData from '@components/Spreadsheet/chart.json'

type AddSpreadsheetModalProps = {
    lensId: number;
    modalController: ReturnType<typeof useDisclosure>
    accessType: string
}
export default function AddSpreadsheetModal({ lensId, modalController }: AddSpreadsheetModalProps) {
    const [loading, setLoading] = useState(false);
    const [opened, { close }] = modalController;
    const [name, updateName] = useState("")

    useEffect(() => {
        
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
                    name: name,
                    lens_id: lensId,
                    dataSource: [],
                    columns: [],
                    plugin: {}
                }),
            });
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data = await response.json();
            close();
            toast.success("Spreadsheet created successfully.", data);
        } catch (e) {
            toast.error("Something went wrong. Please try again later.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <Container className="max-w-3xl absolute">
            <Modal zIndex={299} closeOnClickOutside={true} opened={opened} onClose={close} title={<Text size='md' fw={600}>New Spreadsheet</Text>} centered>
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
