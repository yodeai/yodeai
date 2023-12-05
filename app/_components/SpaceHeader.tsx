'use client';

import { useEffect, useRef } from "react";
import { FaCheck, FaTrashAlt, FaFolder, FaList } from "react-icons/fa";
import { CiGlobe } from "react-icons/ci";
import {
    Flex, Button, Text, Input, ActionIcon, Tooltip, Box,
    Menu, rem, UnstyledButton, Divider
} from "@mantine/core";
import ShareLensComponent from "@components/ShareLensComponent";
import AddSubspace from "@components/AddSubspace";
import { modals } from '@mantine/modals';
import { Lens } from "app/_types/lens";
import { FaAngleDown, FaUserGroup } from "react-icons/fa6";
import { useDisclosure } from "@mantine/hooks";
import Link from "next/link";

type SpaceHeaderProps = {
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
    handleChangeLayoutView: any,
    lens_ids: any
}
export default function SpaceHeader(props: SpaceHeaderProps) {
    const {
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
        lens_ids
    } = props;

    const titleInputRef = useRef<HTMLInputElement>(null);

    const subspaceModalDisclosure = useDisclosure(false);
    const [subspaceModalState, subspaceModalController] = subspaceModalDisclosure;

    const shareModalDisclosure = useDisclosure(false);
    const [shareModalState, shareModalController] = shareModalDisclosure;

    const openDeleteModal = () => modals.openConfirmModal({
        title: 'Confirm block deletion',
        centered: true,
        confirmProps: { color: 'red' },
        children: (
            <Text size="sm">
                Are you sure you want to delete this block? This action cannot be undone.
            </Text>
        ),
        labels: { confirm: 'Delete block', cancel: "Cancel" },
        onCancel: () => console.log('Canceled deletion'),
        onConfirm: handleDeleteLens
    });

    useEffect(() => {
        if (isEditingLensName) {
            titleInputRef.current?.focus();
            titleInputRef.current?.setSelectionRange(0, titleInputRef.current.value.length);
        }
    }, [isEditingLensName])

    return <>
        <Menu shadow="md" position="bottom-start" width={150}>
            <Flex className="border-b border-gray-200 px-4 py-2" justify="space-between">
                <Box>
                    {isEditingLensName
                        ? <>
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
                        </>
                        : <div className="flex items-center align-middle">
                            <Text span={true} c={"gray.7"} size="xl" fw={700}>{lensName}</Text>
                            {accessType !== "reader" && <Menu.Target>
                                <UnstyledButton>
                                    <FaAngleDown size={18} className="mt-2 ml-1 text-gray-500" />
                                </UnstyledButton>
                            </Menu.Target> || ""}
                            {(lens.public || lens.shared) && <Divider orientation="vertical" className="mx-3" /> || ""}
                            {lens.public && <>
                                <Tooltip position="bottom" offset={0} label="Public Lens">
                                    <UnstyledButton onClick={shareModalController.open}>
                                        <CiGlobe size={18} className="mt-2 ml-[5px]" />
                                    </UnstyledButton>
                                </Tooltip>
                            </> || ""}
                            {!lens.public && lens.shared && <>
                                <Tooltip position="bottom" offset={0} label={`Shared lens, collaborative: ${accessType}`}>
                                    <UnstyledButton>
                                        <FaUserGroup size={18} className="mt-2 ml-[5px] text-gray-600" />
                                    </UnstyledButton>
                                </Tooltip>
                            </> || ""}
                        </div>
                    }
                </Box>
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
            </Flex>

            <Menu.Dropdown>
                <Link className="decoration-transparent text-inherit" href="/new" prefetch>
                    <Menu.Item>
                        Add Block
                    </Menu.Item>
                </Link>
                <Menu.Item onClick={subspaceModalController.open}>Add Subspace</Menu.Item>
                <Menu.Item disabled={accessType !== 'owner'} onClick={() => setIsEditingLensName(true)}>Rename</Menu.Item>
                <Menu.Item disabled={accessType !== 'owner'} onClick={shareModalController.open}>Share</Menu.Item>
                <Menu.Divider />
                <Menu.Item disabled>Pin this lens</Menu.Item>
                <Menu.Item disabled={accessType !== 'owner'} color="red" onClick={openDeleteModal}>Delete</Menu.Item>
            </Menu.Dropdown>
        </Menu>

        {!lens.shared || accessType == 'owner' || accessType == 'editor'
            ? <Flex justify={"center"} align={"center"}>
                <Flex justify={"center"} align={"center"} gap={"sm"}>
                    <AddSubspace modalController={subspaceModalDisclosure} lensId={lens_ids[lens_ids.length - 1]} />
                    <ShareLensComponent modalController={shareModalDisclosure} lensId={lens.lens_id} />
                </Flex>
            </Flex>
            : <span className="text-xl font-semibold">
                {/* <div className="flex items-center mt-4 text-gray-600 gap-2 justify-start">
            <FaThLarge className="iconStyle spaceIconStyle" />
            <span className="text-xl font-semibold ">{lensName}</span>
                </div> */}
            </span>}
    </>
}