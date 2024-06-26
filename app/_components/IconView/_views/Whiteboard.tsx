import { useState, useMemo, useRef, useEffect } from "react";

import { AiOutlineLoading } from "@react-icons/all-files/ai/AiOutlineLoading";
import { FaICursor } from "@react-icons/all-files/fa/FaICursor";
import { FaCog } from "@react-icons/all-files/fa/FaCog";
import { FaRegTrashCan } from "@react-icons/all-files/fa6/FaRegTrashCan";
import { FaLink } from "@react-icons/all-files/fa6/FaLink";
import { MdCancel } from "@react-icons/all-files/md/MdCancel";

import { Text, Flex, Box, Textarea } from '@mantine/core';

import { useProgressRouter } from 'app/_hooks/useProgressRouter'
import 'react-grid-layout/css/styles.css';
import { ContextMenuContent, useContextMenu } from 'mantine-contextmenu';
import { modals } from '@mantine/modals';
import { useAppContext } from "@contexts/context";

import { Tables } from "app/_types/supabase";
import { WhiteboardPluginParams } from "app/_types/whiteboard";
import { cn } from "@utils/style";
import { Lens, Subspace } from "app/_types/lens";
import { useClickOutside } from "@mantine/hooks";

type WhiteboardIconItemProps = {
  icon: JSX.Element
  whiteboard: Tables<"whiteboard">
  selected?: boolean;
  unselectBlocks?: () => void
  handleWhiteboardDelete: (whiteboard_id: number) => Promise<any>,
  handleWhiteboardChangeName: (whiteboard_id: number, newWhiteboardName: string) => Promise<any>
  handleItemSettings?: (item: Lens | Subspace | Tables<"block"> | Tables<"whiteboard">) => void
}
export const WhiteboardIconItem = ({
  whiteboard, icon, unselectBlocks,
  handleWhiteboardDelete, handleWhiteboardChangeName, handleItemSettings,
}: WhiteboardIconItemProps) => {
  const { accessType, zoomLevel, iconItemDisclosure } = useAppContext();
  const { showContextMenu } = useContextMenu();

  const whiteboardPlugin = useMemo(() => (whiteboard?.plugin as WhiteboardPluginParams), [whiteboard]);
  const whiteboardPluginState = useMemo(() => whiteboardPlugin?.state, [whiteboardPlugin]);

  const defaultTitle = useMemo(() => whiteboard.name || "Untitled", [whiteboard.name]);
  const [editMode, setEditMode] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(["waiting", "queued", "processing"].includes(whiteboardPluginState?.status));
  const [titleText, setTitleText] = useState<string>(whiteboard.name);

  const handleSubmit = () => {
    setEditMode(false);
    setLoading(true);
    handleWhiteboardChangeName(whiteboard.whiteboard_id, titleText).then(res => setLoading(false));
  }
  const $inputContainer = useClickOutside<HTMLTextAreaElement>(handleSubmit);

  // const [loading, setLoading] = useState<boolean>(false);
  const router = useProgressRouter();

  useEffect(() => {
    setLoading(["waiting", "queued", "processing"].includes(whiteboardPluginState?.status));
  }, [whiteboardPluginState?.status])

  const openDeleteModal = () => modals.openConfirmModal({
    title: 'Confirm whiteboard deletion',
    centered: true,
    confirmProps: { color: 'red' },
    children: (
      <Text size="sm">
        Are you sure you want to delete this whiteboard? This action cannot be undone.
      </Text>
    ),
    labels: { confirm: 'Delete Whiteboard', cancel: "Cancel" },
    onCancel: () => console.log('Canceled deletion'),
    onConfirm: onConfirmDelete,
  });

  const onConfirmDelete = () => {
    setLoading(true);
    handleWhiteboardDelete(whiteboard.whiteboard_id).then(res => setLoading(false));
  }

  const actions: ContextMenuContent = useMemo(() => {
    if (whiteboardPluginState?.status && ["waiting", "queued", "processing"].includes(whiteboardPluginState?.status)) {
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
        router.push(`/whiteboard/${whiteboard.whiteboard_id}`)
      }
    },
    {
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
      key: 'changeIcon',
      color: "#228be6",
      icon: <FaCog size={16} />,
      title: "Settings",
      disabled: ["owner", "editor"].includes(accessType) === false,
      onClick: () => {
        handleItemSettings(whiteboard);
      }
    },
    {
      key: 'remove',
      color: "#ff6b6b",
      icon: <FaRegTrashCan size={16} />,
      title: "Delete",
      onClick: openDeleteModal,
      disabled: ["owner", "editor"].includes(accessType) === false,
    }];
  }, [accessType, whiteboardPluginState]);

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


  const onContextMenu = showContextMenu(actions);

  return <>
    <Flex
      onContextMenu={onContextMenu}
      mih={100} gap="6px"
      className="relative"
      justify="flex-end" align="center"
      direction="column" wrap="nowrap">
      <Box className="absolute top-1">
        {loading
          ? <>
            {whiteboardPluginState?.status && ["waiting", "queued", "processing"].includes(whiteboardPluginState?.status) && <Text size="xs" fw="bold" c="dimmed" className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              {((whiteboardPluginState?.progress || 0) * 100).toFixed(1)}%
            </Text>}
            <AiOutlineLoading size={48} fill="#999" className="animate-spin" />
          </>
          : ""
        }
      </Box>
      <Box className={cn(loading && "opacity-10" || "")}>{icon}</Box>
      <Box w={100} h={40} variant="unstyled" className="text-center">
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
  </>
}