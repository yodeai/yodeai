import { useState, useMemo, useRef, useEffect } from "react";

import { AiOutlineLoading } from "@react-icons/all-files/ai/AiOutlineLoading";
import { FaICursor } from "@react-icons/all-files/fa/FaICursor";
import { FaRegTrashCan } from "@react-icons/all-files/fa6/FaRegTrashCan";
import { FaLink } from "@react-icons/all-files/fa6/FaLink";
import { MdCancel } from "@react-icons/all-files/md/MdCancel";

import { Text, Flex, Box, Textarea, Tooltip, Breadcrumbs } from '@mantine/core';
import { useRouter } from 'next/navigation'
import 'react-grid-layout/css/styles.css';
import { Tables } from "app/_types/supabase";
import { ContextMenuContent, useContextMenu } from 'mantine-contextmenu';
import { modals } from '@mantine/modals';
import { useAppContext } from "@contexts/context";
import { cn } from "@utils/style";


type WidgetProps = {
    icon: JSX.Element,
    widget: Tables<"widget">
    selected?: boolean;
    handleWidgetChangeName: (widget_id: number, newWidgetName: string) => Promise<any>
    handleWidgetDelete: (widget_id: number) => Promise<any>
    unselectBlocks?: () => void
}
export const WidgetIconItem = ({
    widget, icon, selected,
    handleWidgetChangeName, handleWidgetDelete, unselectBlocks
}: WidgetProps) => {
    const { showContextMenu } = useContextMenu();
    const $textarea = useRef<HTMLTextAreaElement>(null);
    const { accessType, zoomLevel } = useAppContext();
    const router = useRouter();

    const widgetPluginState = useMemo(() => widget?.state as any, [widget]);

    useEffect(() => {
        setLoading(["waiting", "queued", "processing"].includes(widgetPluginState?.status));
    }, [widgetPluginState])

    const [titleText, setTitleText] = useState<string>(widget.name);
    const [editMode, setEditMode] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        setTitleText(widget.name);
    }, [widget])

    const openDeleteModal = () => modals.openConfirmModal({
        title: 'Confirm widget deletion',
        centered: true,
        confirmProps: { color: 'red' },
        children: (
            <Text size="sm">
                Are you sure you want to delete this widget? This action cannot be undone.
            </Text>
        ),
        labels: { confirm: 'Delete widget', cancel: "Cancel" },
        onCancel: () => console.log('Canceled deletion'),
        onConfirm: onConfirmDelete,
    });

    const onChangeTitle = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setTitleText(event.target.value);
    }

    const onKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (event.key === "Escape") {
            setEditMode(false);
            return;
        }
        if (event.key === "Enter") {
            setEditMode(false)
            setLoading(true)
            handleWidgetChangeName(widget.widget_id, (event.target as HTMLTextAreaElement).value.trim())
                .then(res => setLoading(false))
            return;
        }
    }

    const onConfirmDelete = () => {
        setLoading(true);
        handleWidgetDelete(widget.widget_id).then(res => setLoading(false));
    }

    useEffect(() => {
        if (editMode) {
            $textarea.current?.focus();
            $textarea.current?.setSelectionRange(0, $textarea.current.value.length);
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
    }, [$textarea, editMode])

    const actions: ContextMenuContent = useMemo(() => {
        if (widgetPluginState?.status && ["waiting", "queued", "processing"]
            .includes(widgetPluginState?.status)) {
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
                router.push(`/widget/${widget.widget_id}`)
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
    }, [accessType, widgetPluginState]);

    const onContextMenu = showContextMenu(actions);

    return <Flex
        onContextMenu={onContextMenu}
        mih={100} gap="6px"
        align="center" justify="flex-end"
        direction="column" wrap="nowrap">
        <Box className="absolute top-1">
            {loading
                ? <>
                    {widgetPluginState?.status && ["waiting", "queued", "processing"]
                        .includes(widgetPluginState?.status) &&
                        <Text size="xs" fw="bold" c="dimmed" className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                            {`${((widgetPluginState.progress || 0) * 100).toFixed(1)}%`}
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
                    ref={$textarea}
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