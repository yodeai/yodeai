'use client';

import { useState, useRef, } from "react";
import { Flex, Text, Box, Input, ActionIcon, Menu, UnstyledButton } from "@mantine/core";
import { FaAngleDown, FaCheck } from "react-icons/fa";
import { modals } from "@mantine/modals";
import load from "@lib/load";
import { useDebouncedCallback } from '@utils/hooks';

type WhiteboardHeaderProps = {
    title: string
    accessType: "owner" | "editor" | "reader";
    onSave: (title: string) => Promise<Response>
    onDelete: () => Promise<Response>
}

export default function WhiteboardHeader(props: WhiteboardHeaderProps) {
    const { title, accessType, onSave, onDelete } = props;

    const [isEditing, setIsEditing] = useState(false);

    const [newTitle, setNewTitle] = useState(title);
    const titleInputRef = useRef(null);

    const onClickSave = useDebouncedCallback(async () => {
        const savePromise = onSave(newTitle);
        await load(savePromise, {
            loading: "Changing name...",
            success: "Name changed.",
            error: "Failed to change name."
        });
        setIsEditing(false);
    }, 150, [newTitle])

    const onKeyDown = (event) => {
        if (event.key === "Enter") onClickSave();
    }

    const openDeleteModal = () => modals.openConfirmModal({
        title: 'Confirm whiteboard deletion',
        centered: true,
        confirmProps: { color: 'red' },
        children: (
            <Text size="sm">
                Are you sure you want to delete this whiteboard? This action cannot be undone.
            </Text>
        ),
        labels: { confirm: 'Delete whiteboard', cancel: "Cancel" },
        onCancel: () => console.log('Canceled deletion'),
        onConfirm: onDelete
    });

    return <>
        <Flex className="border-b border-gray-200 px-4 py-2" justify="space-between">
            <Box className="flex items-center">
                <Menu>
                    {isEditing && <>
                        <Input
                            ref={titleInputRef}
                            unstyled
                            px={2}
                            className="inline-block text-xl border border-gray-400 rounded-md outline-none focus:border-gray-500"
                            fw={700}
                            c={"gray.7"}
                            size="xl"
                            value={newTitle || ""}
                            onChange={e => setNewTitle(e.currentTarget.value)}
                            onKeyDown={onKeyDown}
                        />
                        <ActionIcon
                            size="md"
                            color="green"
                            variant="gradient"
                            ml={5}
                            gradient={{ from: 'green', to: 'lime', deg: 116 }}
                            onClick={onClickSave}
                        >
                            <FaCheck size={14} />
                        </ActionIcon>
                    </> || ""}
                    {!isEditing && <div className="flex justify-center align-middle">
                        <Text span={true} c={"gray.7"} size="xl" fw={700}>{title}</Text>
                        <Menu.Target>
                            <UnstyledButton>
                                <FaAngleDown size={18} className="mt-2 ml-1 text-gray-500" />
                            </UnstyledButton>
                        </Menu.Target>
                    </div> || ""}

                    <Menu.Dropdown>
                        <Menu.Item disabled={!["owner", "editor"].includes(accessType)} onClick={() => setIsEditing(true)}>Rename</Menu.Item>
                        <Menu.Item disabled={!["owner", "editor"].includes(accessType)} color="red" onClick={openDeleteModal}>Delete</Menu.Item>
                    </Menu.Dropdown>
                </Menu>
            </Box>
        </Flex>
    </>
}