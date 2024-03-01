'use client';

import { FaArrowDown, FaArrowUp, FaList } from "react-icons/fa";
import { FaMagnifyingGlassPlus } from "react-icons/fa6";
import { BsFillGrid3X3GapFill } from 'react-icons/bs';
import {
    Flex, Button, Text, Box,
    Select, HoverCard, Slider, SegmentedControl, Center
} from "@mantine/core";
import AddSubspace from "@components/AddSubspace";
import { useAppContext, contextType } from "@contexts/context";
import AddWhiteBoard from "./AddWhiteboard";
import AddUserInsight from "./AddUserInsight";
import AddCompetitiveAnalysis from "./AddCompetitiveAnalysis";
import AddSpreadsheetModal from "./Spreadsheet/AddSpreadsheet";
import AddPainPointTracker from "./Spreadsheet/AddPainPointTracker";

type SpaceHeaderProps = {
    title: string;
    staticLayout?: boolean;
    staticSortBy?: boolean;
    staticZoomLevel?: boolean;
    selectedLayoutType: "block" | "icon",
    handleChangeLayoutView?: any,
    rightItem?: JSX.Element
}

export default function SpaceHeader(props: SpaceHeaderProps) {
    const {
        title,
        staticLayout = false,
        staticSortBy = false,
        staticZoomLevel = true,
        selectedLayoutType,
        handleChangeLayoutView,
        rightItem
    } = props;

    const {
        subspaceModalDisclosure, whiteboardModelDisclosure, userInsightsDisclosure,
        spreadsheetModalDisclosure, competitiveAnalysisDisclosure, iconItemDisclosure,
        painPointTrackerModalDisclosure,
        sortingOptions, setSortingOptions, zoomLevel, setZoomLevel
    } = useAppContext();

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
                        { value: "type", label: "Type" }
                    ]}
                    allowDeselect={true}
                    value={sortingOptions.sortBy}
                    onChange={(value: contextType["sortingOptions"]["sortBy"]) => {
                        setSortingOptions({ ...sortingOptions, sortBy: value })
                    }}
                />}
                {staticLayout === false && <SegmentedControl
                    className="ml-3"
                    value={selectedLayoutType}
                    onChange={handleChangeLayoutView}
                    data={[{
                        value: "block", label: (
                            <Center className="gap-[10px]">
                                <FaList color={selectedLayoutType === "block" ? "#228be6" : "#555"} size={18} />
                            </Center>
                        )
                    }, {
                        value: "icon", label: (
                            <Center className="gap-[10px]">
                                <BsFillGrid3X3GapFill color={selectedLayoutType === "icon" ? "#228be6" : "#555"} size={18} />
                            </Center>
                        )
                    }]}
                /> || ""}
                {staticZoomLevel === false && <HoverCard width={320} shadow="md" position="bottom-end">
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
                </HoverCard>}
                {rightItem}
            </Box>
        </Flex>

        <Flex justify={"center"} align={"center"}>
            <Flex justify={"center"} align={"center"} gap={"sm"}>
                <AddSubspace modalController={subspaceModalDisclosure} lensId={-1} accessType={"owner"} />
                <AddWhiteBoard modalController={whiteboardModelDisclosure} lensId={-1} accessType={"owner"} />
                <AddUserInsight modalController={userInsightsDisclosure} lensId={-1} accessType={"owner"} />
                <AddCompetitiveAnalysis modalController={competitiveAnalysisDisclosure} lensId={-1} accessType={"owner"} />
                <AddSpreadsheetModal modalController={spreadsheetModalDisclosure} lensId={-1} accessType={"owner"} />
                <AddPainPointTracker modalController={painPointTrackerModalDisclosure} lensId={-1} accessType={"owner"} />
            </Flex>
        </Flex>
    </>
}