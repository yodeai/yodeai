'use client';

import { FaArrowDown, FaArrowUp, FaCaretDown, FaCaretUp, FaFolder, FaList } from "react-icons/fa";
import {
    Flex, Button, Text, Tooltip, Box,
    Menu, UnstyledButton, Select
} from "@mantine/core";
import { FaAngleDown } from "react-icons/fa6";
import Link from "next/link";
import AddSubspace from "@components/AddSubspace";
import { useDisclosure } from "@mantine/hooks";
import { useAppContext, contextType } from "@contexts/context";

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

    const { sortingOptions, setSortingOptions } = useAppContext();

    const subspaceModalDisclosure = useDisclosure(false);
    const [subspaceModalState, subspaceModalController] = subspaceModalDisclosure;

    return <>
        <Flex className="border-b border-gray-200 px-4 py-2" justify="space-between">
            <Menu shadow="md" position="bottom-start" width={150}>
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

                <Menu.Dropdown>
                    <Link className="decoration-transparent text-inherit" href="/new" prefetch>
                        <Menu.Item>Add Block</Menu.Item>
                    </Link>
                    <Menu.Item onClick={subspaceModalController.open}>Add Subspace</Menu.Item>
                </Menu.Dropdown>
            </Menu>

            <Box className="flex flex-row items-center align-middle">
                <Select
                    variant="filled"
                    className="inline w-[150px]"
                    leftSection={<Box>
                        <Button
                            size="xs"
                            variant="subtle"
                            px={8}
                            mr={5}
                            onClick={() => {
                                setSortingOptions({
                                    ...sortingOptions,
                                    order: sortingOptions.order === "asc" ? "desc" : "asc"
                                })
                            }}>
                            {sortingOptions.order === "asc"
                                ? <FaArrowDown size={12} className="text-gray-500" />
                                : <FaArrowUp size={12} className="text-gray-500" />}
                        </Button>
                    </Box>}
                    placeholder="Sort by"
                    size="sm"
                    data={[
                        { value: "name", label: "Name" },
                        { value: "createdAt", label: "Created At" },
                        { value: "updatedAt", label: "Updated At" },
                    ]}
                    allowDeselect={true}
                    value={sortingOptions.sortBy}
                    onChange={(value: contextType["sortingOptions"]["sortBy"]) => {
                        setSortingOptions({ ...sortingOptions, sortBy: value })
                    }}
                />
                <Tooltip position="bottom-end" color="gray.7" offset={10} label={selectedLayoutType === "block"
                    ? "Switch to icon view."
                    : "Switch to list view."
                }>
                    <Button
                        size="sm"
                        variant="subtle"
                        color="gray.7"
                        p={7}
                        mx={10}
                        onClick={() => handleChangeLayoutView(selectedLayoutType === "block" ? "icon" : "block")}
                    >
                        {selectedLayoutType === "icon" ? <FaFolder size={18} /> : <FaList size={18} />}
                    </Button>
                </Tooltip>
            </Box>
        </Flex>

        <Flex justify={"center"} align={"center"}>
            <Flex justify={"center"} align={"center"} gap={"sm"}>
                <AddSubspace modalController={subspaceModalDisclosure} lensId={-1} accessType={"owner"} />
            </Flex>
        </Flex>
    </>
}