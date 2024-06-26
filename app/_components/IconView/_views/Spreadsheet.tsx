import { useState, useMemo, useRef, useEffect } from "react";

import { AiOutlineLoading } from "@react-icons/all-files/ai/AiOutlineLoading";
import { MdCancel } from "@react-icons/all-files/md/MdCancel";
import { FaRegTrashCan } from "@react-icons/all-files/fa6/FaRegTrashCan";
import { FaLink } from "@react-icons/all-files/fa6/FaLink";
import { FaICursor } from "@react-icons/all-files/fa/FaICursor";

import { Text, Flex, Box, Textarea, Tooltip, Breadcrumbs } from '@mantine/core';
import { useProgressRouter } from 'app/_hooks/useProgressRouter'
import { Tables } from "app/_types/supabase";
import { ContextMenuContent, useContextMenu } from 'mantine-contextmenu';
import { modals } from '@mantine/modals';
import { useAppContext } from "@contexts/context";
import { cn } from "@utils/style";

import { SpreadsheetPluginParams } from "app/_types/spreadsheet";
import { useClickOutside } from "@mantine/hooks";

type SpreadsheetProps = {
    icon: JSX.Element,
    spreadsheet: Tables<"spreadsheet"> & {
        plugin: SpreadsheetPluginParams
    }
    selected?: boolean;
    handleSpreadsheetChangeName: (spreadsheet_id: number, newSpreadsheetName: string) => Promise<any>
    handleSpreadsheetDelete: (spreadsheet_id: number) => Promise<any>
    unselectBlocks?: () => void
}
export const SpreadsheetIconItem = ({
    spreadsheet, icon, selected,
    handleSpreadsheetChangeName, handleSpreadsheetDelete, unselectBlocks
}: SpreadsheetProps) => {
    const { showContextMenu } = useContextMenu();
    const { accessType, zoomLevel } = useAppContext();
    const router = useProgressRouter();

    const spreadsheetPlugin = useMemo(() => (spreadsheet?.plugin), [spreadsheet]);
    const spreadsheetPluginState = useMemo(() => spreadsheetPlugin?.state, [spreadsheetPlugin]);

    useEffect(() => {
        setLoading(["waiting", "queued", "processing"].includes(spreadsheetPluginState?.status));
    }, [spreadsheetPluginState?.status])

    const defaultTitle = useMemo(() => spreadsheet.name || "Untitled", [spreadsheet.name]);
    const [titleText, setTitleText] = useState<string>(spreadsheet.name);
    const [editMode, setEditMode] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);

    const handleSubmit = () => {
        setEditMode(false);
        setLoading(true);
        handleSpreadsheetChangeName(spreadsheet.spreadsheet_id, titleText).then(res => setLoading(false));
    }
    const $inputContainer = useClickOutside<HTMLTextAreaElement>(handleSubmit);

    useEffect(() => {
        setTitleText(spreadsheet.name);
    }, [spreadsheet])

    const openDeleteModal = () => modals.openConfirmModal({
        title: 'Confirm spreadsheet deletion',
        centered: true,
        confirmProps: { color: 'red' },
        children: (
            <Text size="sm">
                Are you sure you want to delete this spreadsheet? This action cannot be undone.
            </Text>
        ),
        labels: { confirm: 'Delete spreadsheet', cancel: "Cancel" },
        onCancel: () => console.log('Canceled deletion'),
        onConfirm: onConfirmDelete,
    });

    const onChangeTitle = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setTitleText(event.target.value);
    }

    const onKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (event.key === "Escape") {
            setTitleText(defaultTitle);
            setEditMode(false);
            return;
        }
        if (event.key === "Enter") {
            handleSubmit();
            return;
        }
    }

    const onConfirmDelete = () => {
        setLoading(true);
        handleSpreadsheetDelete(spreadsheet.spreadsheet_id).then(res => setLoading(false));
    }

    useEffect(() => {
        if (editMode) {
            $inputContainer.current?.focus();
            $inputContainer.current?.setSelectionRange(0, $inputContainer.current.value.length);
        }

        const onClick = (event: MouseEvent) => {
            if ((event.target as HTMLElement).classList.contains("mantine-ScrollArea-viewport")) {
                setEditMode(false);
                unselectBlocks();
            }
        }

        window.addEventListener("click", onClick);

        return () => {
            window.removeEventListener("click", onClick);
        }
    }, [$inputContainer, editMode])

    const actions: ContextMenuContent = useMemo(() => {
        if (spreadsheetPluginState?.status && ["waiting", "queued", "processing"]
            .includes(spreadsheetPluginState?.status)) {
            return [{
                key: 'cancel',
                color: "#ff6b6b",
                icon: <MdCancel size={16} color="#ff6b6b" />,
                title: "Cancel",
                onClick: onConfirmDelete
            }]
        }
        return [{
            key: 'open',
            color: "#228be6",
            icon: <FaLink size={16} />,
            title: "Open",
            onClick: () => {
                router.push(`/spreadsheet/${spreadsheet.spreadsheet_id}`)
            }
        }, {
            key: 'rename',
            color: "#228be6",
            icon: <FaICursor size={16} />,
            title: 'Rename',
            disabled: ["owner", "editor"].includes(accessType) === false,
            onClick: () => {
                setEditMode(true);
            }
        },
        {
            key: 'remove',
            color: "#ff6b6b",
            icon: <FaRegTrashCan size={16} />,
            title: "Delete",
            disabled: ["owner", "editor"].includes(accessType) === false,
            onClick: () => openDeleteModal()
        }]
    }, [accessType, spreadsheetPluginState]);

    const onContextMenu = showContextMenu(actions);

    return <Flex
        onContextMenu={onContextMenu}
        mih={100} gap="6px"
        align="center" justify="flex-end"
        direction="column" wrap="nowrap">
        <Box className="absolute top-1">
            {loading
                ? <>
                    {spreadsheetPluginState?.status && ["waiting", "queued", "processing"]
                        .includes(spreadsheetPluginState?.status) &&
                        <Text size="xs" fw="bold" c="dimmed" className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                            {`${((spreadsheetPluginState.progress || 0) * 100).toFixed(1)}%`}
                        </Text>}
                    <AiOutlineLoading size={48} fill="#999" className="animate-spin" />
                </>
                : ""
            }
        </Box>
        <Box className={cn(loading && "opacity-10" || "")}>{icon}</Box>
        <Box w={70} h={40} variant="unstyled" className="text-center">
            {editMode
                ? <Textarea
                    rows={1}
                    className="z-50 block-input leading-4 w-full"
                    maxRows={2}
                    ref={$inputContainer}
                    variant="unstyled" ta="center" c="dimmed"
                    onKeyDown={onKeyDown}
                    size={`${7 * 200 / zoomLevel}px`}
                    p={0} m={0}
                    h={20}
                    onChange={onChangeTitle} placeholder="Title" value={titleText} />
                : <Text inline={true} size={`${7 * 200 / zoomLevel}px`} ta="center" c="dimmed" className="break-words line-clamp-2 leading-none select-none whitespace-break-spaces">{titleText}</Text>
            }
        </Box>
    </Flex>
}