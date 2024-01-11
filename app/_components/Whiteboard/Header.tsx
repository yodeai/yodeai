'use client';

import { useState, useRef } from "react";
import { Flex, Text, Box, Input, ActionIcon, Menu, UnstyledButton } from "@mantine/core";
import { FaAngleDown, FaCheck } from "react-icons/fa";
import LoadingSkeleton from "@components/LoadingSkeleton";

type WhiteboardHeaderProps = {
    title: string
}

export default function WhiteboardHeader(props: WhiteboardHeaderProps) {
    const { title } = props;

    const [loading, setLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    const [newTitle, setNewTitle] = useState(title);
    const titleInputRef = useRef(null);

    return <>
        <Flex className="border-b border-gray-200 px-4 py-2" justify="space-between">
            <Box className="flex items-center">
                <Menu>
                    {!loading && isEditing && <>
                        <Input
                            ref={titleInputRef}
                            unstyled
                            px={2}
                            className="inline-block text-xl border border-gray-400 rounded-md outline-none focus:border-gray-500"
                            fw={700}
                            c={"gray.7"}
                            size="xl"
                            value={newTitle || ""}
                        />
                        <ActionIcon
                            size="md"
                            color="green"
                            variant="gradient"
                            ml={5}
                            gradient={{ from: 'green', to: 'lime', deg: 116 }}
                        >
                            <FaCheck size={14} />
                        </ActionIcon>
                    </> || ""}
                    {
                        !loading && !isEditing && <div className="flex justify-center align-middle">
                            <Text span={true} c={"gray.7"} size="xl" fw={700}>{title}</Text>

                            {!loading && <Menu.Target>
                                <UnstyledButton>
                                    <FaAngleDown size={18} className="mt-2 ml-1 text-gray-500" />
                                </UnstyledButton>
                            </Menu.Target> || ""}
                        </div> || ""
                    }

                    <Menu.Dropdown>
                        <Menu.Item onClick={() => setIsEditing(true)}>Rename</Menu.Item>
                    </Menu.Dropdown>
                </Menu>
                {loading && <LoadingSkeleton w={"150px"} boxCount={1} m={3} lineHeight={30} /> || ""}
            </Box>
        </Flex>
    </>
}