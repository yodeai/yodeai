'use client';

import { useEffect, useRef, useMemo } from "react";
import { FaCheck, FaTrashAlt, FaFolder, FaList, FaCaretDown, FaCaretUp, FaArrowDown, FaArrowUp } from "react-icons/fa";
import { CiGlobe } from "react-icons/ci";
import {
    Flex, Button, Text, Input, ActionIcon, Tooltip, Box,
    Menu, rem, UnstyledButton, Divider, Select, HoverCard, Slider
} from "@mantine/core";
import ShareLensComponent from "@components/ShareLensComponent";
import { modals } from '@mantine/modals';
import { Lens } from "app/_types/lens";
import { FaAngleDown, FaMagnifyingGlassPlus, FaUserGroup } from "react-icons/fa6";
import { useDisclosure } from "@mantine/hooks";
import LoadingSkeleton from "./LoadingSkeleton";
import { useAppContext, contextType } from "@contexts/context";

import AddWhiteBoard from "./AddWhiteboard";
import AddUserInsight from "./AddUserInsight";
import AddCompetitiveAnalysis from "./AddCompetitiveAnalysis";

import AddSubspace from "@components/AddSubspace";
import AddSpreadsheet from "@components/Spreadsheet/AddSpreadsheet";
import AddPainPointTracker from "./Spreadsheet/AddPainPointTracker";
import AddWidget from "./Widgets/ModalForm";

type DynamicSpaceHeaderProps = {
    loading: boolean,
    lens: Lens,
    lensName: string,
    accessType: string,
    editingLensName: string,
    isEditingLensName: boolean,
    setIsEditingLensName: any,
    handleNameChange: any,
    handleKeyPress: any,
    saveNewLensName: any,
    handleDeleteLens: any,
    selectedLayoutType: string,
    handleChangeLayoutView: any
}
export default function DynamicSpaceHeader(props: DynamicSpaceHeaderProps) {
    const {
        loading,
        lens,
        lensName,
        accessType,
        isEditingLensName,
        setIsEditingLensName,
        editingLensName,
        handleNameChange,
        handleKeyPress,
        saveNewLensName,
        handleDeleteLens,
        selectedLayoutType,
        handleChangeLayoutView,
    } = props;

    const titleInputRef = useRef<HTMLInputElement>(null);

    const shareModalDisclosure = useDisclosure(false);
    const [shareModalState, shareModalController] = shareModalDisclosure;

    const {
        lensId, pinnedLenses, subspaceModalDisclosure, whiteboardModelDisclosure,
        spreadsheetModalDisclosure, painPointTrackerModalDisclosure,
        userInsightsDisclosure, competitiveAnalysisDisclosure,
        widgetFormDisclosure,
        sortingOptions, setSortingOptions,
        zoomLevel, setZoomLevel, setPinnedLenses
    } = useAppContext();

    const isPinned = useMemo(() => pinnedLenses.map(lens => lens.lens_id).includes(lens?.lens_id), [pinnedLenses, lens]);

    const openDeleteModal = () => modals.openConfirmModal({
        title: 'Confirm page deletion',
        centered: true,
        confirmProps: { color: 'red' },
        children: (
            <Text size="sm">
                Are you sure you want to delete this block? This action cannot be undone.
            </Text>
        ),
        labels: { confirm: 'Delete page', cancel: "Cancel" },
        onCancel: () => console.log('Canceled deletion'),
        onConfirm: handleDeleteLens
    });

    const onPinLens = async () => {
        try {
            const pinResponse = await fetch(`/api/lens/${lens.lens_id}/pin`, { method: "PUT" });
            if (pinResponse.ok) {
                console.log("Pinned spaces", lens.lens_id)
                setPinnedLenses(pinnedLenses => [...pinnedLenses, lens])
            }
            if (!pinResponse.ok) console.error("Failed to pin lens");
        } catch (error) {
            console.error("Error pinning spaces:", error);
        }
    }

    const onUnpinLens = async () => {
        try {
            const pinResponse = await fetch(`/api/lens/${lens.lens_id}/pin`, { method: "DELETE" });
            if (pinResponse.ok) {
                console.log("Unpinned lens", lens.lens_id)
                setPinnedLenses(pinnedLenses => pinnedLenses.filter(pinnedLens => pinnedLens.lens_id !== lens.lens_id))
            }
            if (!pinResponse.ok) console.error("Failed to unpin spaces");
        } catch (error) {
            console.error("Error unpinning spaces:", error);
        }
    }

    useEffect(() => {
        if (isEditingLensName) {
            titleInputRef.current?.focus();
            titleInputRef.current?.setSelectionRange(0, titleInputRef.current?.value.length);
        }
    }, [isEditingLensName])

    return <>
        <Flex className="border-b border-gray-200 px-4 py-2" justify="space-between">
            <Menu shadow="md" position="bottom-start" width={150}>
                <Box className="flex items-center">
                    {
                        !loading && isEditingLensName && <>
                            <Input
                                ref={titleInputRef}
                                unstyled
                                px={2}
                                className="inline-block text-xl border border-gray-400 rounded-md outline-none focus:border-gray-500"
                                fw={700}
                                c={"gray.7"}
                                size="xl"
                                value={editingLensName || ""}
                                onChange={handleNameChange}
                                onKeyUp={handleKeyPress}
                            />
                            <ActionIcon
                                onClick={() => { saveNewLensName().then(result => { console.log("Success", result); if (result) setIsEditingLensName(false); }); }}
                                size="md"
                                color="green"
                                variant="gradient"
                                ml={5}
                                gradient={{ from: 'green', to: 'lime', deg: 116 }}
                            >
                                <FaCheck size={14} />
                            </ActionIcon>
                        </> || ""
                    }
                    {
                        !loading && !isEditingLensName && <div className="flex justify-center align-middle">
                            <Text span={true} c={"gray.7"} size="xl" fw={700}>{lensName}</Text>

                            {!loading && <Menu.Target>
                                <UnstyledButton>
                                    <FaAngleDown size={18} className="mt-2 ml-1 text-gray-500" />
                                </UnstyledButton>
                            </Menu.Target> || ""}
                            {(lens.public || lens.shared) && <Divider orientation="vertical" className="mx-3" /> || ""}
                            {lens.public && <>
                                <Tooltip position="bottom" offset={0} label="Public Space">
                                    <UnstyledButton onClick={shareModalController.open}>
                                        <CiGlobe size={18} className="mt-2 ml-[5px]" />
                                    </UnstyledButton>
                                </Tooltip>
                            </> || ""}
                            {!lens.public && lens.shared && <>
                                <Tooltip position="bottom" offset={0} label={`Shared Space, Collaborative: ${accessType}`}>
                                    <UnstyledButton>
                                        <FaUserGroup size={18} className="mt-2 ml-[5px] text-gray-600" />
                                    </UnstyledButton>
                                </Tooltip>
                            </> || ""}
                        </div> || ""
                    }
                    {loading && <LoadingSkeleton w={"150px"} boxCount={1} m={3} lineHeight={30} /> || ""}
                </Box>

                <Menu.Dropdown>
                    <Menu.Item disabled={["owner", "editor"].includes(accessType) === false} onClick={() => setIsEditingLensName(true)}>Rename</Menu.Item>
                    <Menu.Item disabled={accessType !== 'owner'} onClick={shareModalController.open}>Share</Menu.Item>
                    <Menu.Divider />
                    <Menu.Item onClick={isPinned ? onUnpinLens : onPinLens}>
                        {isPinned ? "Unpin" : "Pin"} this space
                    </Menu.Item>
                    <Menu.Item disabled={["owner", "editor"].includes(accessType) === false} color="red" onClick={openDeleteModal}>Delete</Menu.Item>
                </Menu.Dropdown >
            </Menu>

            <Box className="flex flex-row items-center align-middle">
                {!loading && <>
                    <Select
                        variant="filled"
                        className="inline w-[150px]"
                        leftSection={<Box>
                            <Button
                                size="xs"
                                variant="subtle"
                                p={8}
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
                            ml={5}
                            onClick={() => handleChangeLayoutView(selectedLayoutType === "block" ? "icon" : "block")}
                        >
                            {selectedLayoutType === "icon" ? <FaFolder size={18} /> : <FaList size={18} />}
                        </Button>
                    </Tooltip>
                    <HoverCard width={320} shadow="md" position="bottom-end">
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
                                onChange={value => setZoomLevel(value, lensId)}
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
                </> || ""}
                {loading && <LoadingSkeleton w={"200px"} boxCount={1} m={3} lineHeight={30} /> || ""}
            </Box>
        </Flex>

        {!loading && lens && !lens?.shared || accessType == 'owner' || accessType == 'editor'
            ? <Flex justify={"center"} align={"center"}>
                <Flex justify={"center"} align={"center"} gap={"sm"}>
                    <AddSubspace modalController={subspaceModalDisclosure} lensId={Number(lensId)} accessType={accessType} />
                    <AddWhiteBoard modalController={whiteboardModelDisclosure} lensId={Number(lensId)} accessType={accessType} />
                    <AddUserInsight modalController={userInsightsDisclosure} lensId={Number(lensId)} accessType={accessType} />
                    <AddCompetitiveAnalysis modalController={competitiveAnalysisDisclosure} lensId={Number(lensId)} accessType={accessType} />
                    {shareModalState && <ShareLensComponent modalController={shareModalDisclosure} lensId={lens?.lens_id} />}
                    <AddSpreadsheet modalController={spreadsheetModalDisclosure} lensId={Number(lensId)} accessType={accessType} />
                    <AddPainPointTracker modalController={painPointTrackerModalDisclosure} lensId={Number(lensId)} accessType={accessType} />
                    <AddWidget modalController={widgetFormDisclosure} lensId={Number(lensId)} accessType={accessType} />
                </Flex>
            </Flex>
            : <span className="text-xl font-semibold">
                {/* <div className="flex items-center mt-4 text-gray-600 gap-2 justify-start">
            <FaThLarge className="iconStyle spaceIconStyle" />
            <span className="text-xl font-semibold ">{lensName}</span>
                </div> */}
            </span>
        }
    </>
}