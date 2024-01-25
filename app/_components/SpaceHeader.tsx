'use client';

import { FaArrowDown, FaArrowUp, FaCaretDown, FaCaretUp, FaFolder, FaList } from "react-icons/fa";
import { FaMagnifyingGlassPlus } from "react-icons/fa6";
import {
    Flex, Button, Text, Tooltip, Box,
    Menu, UnstyledButton, Select, HoverCard, Slider
} from "@mantine/core";
import AddSubspace from "@components/AddSubspace";
import { useAppContext, contextType } from "@contexts/context";
import AddWhiteBoard from "./AddWhiteboard";
import AddUserInsight from "./AddUserInsight";

type SpaceHeaderProps = {
    title: string;
    staticLayout?: boolean;
    staticSortBy?: boolean;
    staticZoomLevel?: boolean;
    selectedLayoutType: "block" | "icon",
    handleChangeLayoutView?: any
}

export default function SpaceHeader(props: SpaceHeaderProps) {
    const {
        title,
        staticLayout = false,
        staticSortBy = false,
        staticZoomLevel = true,
        selectedLayoutType,
        handleChangeLayoutView,
    } = props;

    const { subspaceModalDisclosure, whiteboardModelDisclosure, userInsightsDisclosure, sortingOptions, setSortingOptions, zoomLevel, setZoomLevel } = useAppContext();

    return <>
        <Flex className="border-b border-gray-200 px-4 py-2" justify="space-between">
            <Box className="flex items-center">
                <div className="flex justify-center align-middle m-1">
                    <Text span={true} c={"gray.7"} size="xl" fw={700}>{title}</Text>
                </div>
            </Box>

            <Box className="flex flex-row items-center align-middle">
                {staticSortBy === false && <Select
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
                />}
                {staticLayout === false && <Tooltip position="bottom-end" color="gray.7" offset={10} label={selectedLayoutType === "block"
                    ? "Switch to icon view."
                    : "Switch to list view."
                }>
                    <Button
                        size="sm"
                        variant="subtle"
                        color="gray.7"
                        p={7}
                        ml={5}
                        onClick={() => handleChangeLayoutView(selectedLayoutType === "block" ? "icon" : "block")}
                    >
                        {selectedLayoutType === "icon" ? <FaFolder size={18} /> : <FaList size={18} />}
                    </Button>
                </Tooltip> || ""}
                {staticZoomLevel === false && <HoverCard width={320} shadow="md" position="left">
                    <HoverCard.Target>
                        <Button
                            size="sm"
                            variant="subtle"
                            color="gray.7"
                            p={7}
                            ml={5}>
                            <FaMagnifyingGlassPlus size={18} />
                        </Button>
                    </HoverCard.Target>
                    <HoverCard.Dropdown>
                        <Slider
                            className="my-4 mx-2"
                            color="blue"
                            value={zoomLevel}
                            onChange={value => setZoomLevel(value, "default")}
                            min={100}
                            max={200}
                            step={25}
                            marks={[
                                { value: 100, label: '1x' },
                                { value: 125, label: '1.25x' },
                                { value: 150, label: '1.5x' },
                                { value: 175, label: '1.75x' },
                                { value: 200, label: '2x' },
                            ]}
                        />
                    </HoverCard.Dropdown>
                </HoverCard>
                }
            </Box>
        </Flex>

        <Flex justify={"center"} align={"center"}>
            <Flex justify={"center"} align={"center"} gap={"sm"}>
                <AddSubspace modalController={subspaceModalDisclosure} lensId={-1} accessType={"owner"} />
                <AddWhiteBoard modalController={whiteboardModelDisclosure} lensId={-1} accessType={"owner"} />
                <AddUserInsight modalController={userInsightsDisclosure} lensId={-1} accessType={"owner"} />
            </Flex>
        </Flex>
    </>
}