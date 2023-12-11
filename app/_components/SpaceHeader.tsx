'use client';

import { FaFolder, FaList } from "react-icons/fa";
import {
    Flex, Button, Text, Tooltip, Box,
    Menu, UnstyledButton
} from "@mantine/core";
import { FaAngleDown } from "react-icons/fa6";
import Link from "next/link";
import AddSubspace from "@components/AddSubspace";
import { useDisclosure } from "@mantine/hooks";

type SpaceHeaderProps = {
    title: string;
    selectedLayoutType: string,
    handleChangeLayoutView: any,
}
export default function SpaceHeader(props: SpaceHeaderProps) {
    const {
        title,
        selectedLayoutType,
        handleChangeLayoutView,
    } = props;

    const subspaceModalDisclosure = useDisclosure(false);
    const [subspaceModalState, subspaceModalController] = subspaceModalDisclosure;

    return <>
        <Menu shadow="md" position="bottom-start" width={150}>
            <Flex className="border-b border-gray-200 px-4 py-2" justify="space-between">
                <Box className="flex items-center">
                    <div className="flex justify-center align-middle">
                        <Text span={true} c={"gray.7"} size="xl" fw={700}>{title}</Text>
                        <Menu.Target>
                            <UnstyledButton>
                                <FaAngleDown size={18} className="mt-2 ml-1 text-gray-500" />
                            </UnstyledButton>
                        </Menu.Target>
                    </div>
                </Box >
                <Box>
                    <Tooltip position="bottom-end" color="gray.7" offset={10} label={selectedLayoutType === "block"
                        ? "Switch to icon view."
                        : "Switch to list view."
                    }>
                        <Button
                            size="md"
                            c="gray.6"
                            variant="subtle"
                            onClick={() => handleChangeLayoutView(selectedLayoutType === "block" ? "icon" : "block")}
                        >
                            {selectedLayoutType === "icon" ? <FaFolder size={20} /> : <FaList size={20} />}
                        </Button>
                    </Tooltip>
                </Box>
            </Flex >

            <Menu.Dropdown>
                <Link className="decoration-transparent text-inherit" href="/new" prefetch>
                    <Menu.Item>Add Block</Menu.Item>
                </Link>
                <Menu.Item onClick={subspaceModalController.open}>Add Subspace</Menu.Item>
            </Menu.Dropdown>
        </Menu>

        <Flex justify={"center"} align={"center"}>
            <Flex justify={"center"} align={"center"} gap={"sm"}>
                <AddSubspace modalController={subspaceModalDisclosure} lensId={-1} />
            </Flex>
        </Flex>
    </>
}