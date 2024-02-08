import { useState, useMemo, useRef, useEffect } from "react";
import { AiOutlineLoading } from "react-icons/ai";

import { Text, Flex, Box, Textarea } from '@mantine/core';

import { useRouter } from 'next/navigation'
import 'react-grid-layout/css/styles.css';
import { ContextMenuContent, useContextMenu } from 'mantine-contextmenu';
import { FaCog, FaICursor, FaIcons } from "react-icons/fa";
import { modals } from '@mantine/modals';
import { useAppContext } from "@contexts/context";

import { Tables } from "app/_types/supabase";
import { WhiteboardPluginParams } from "app/_types/whiteboard";
import { cn } from "@utils/style";
import { FaRegTrashCan, FaLink } from "react-icons/fa6";
import { Lens, Subspace } from "app/_types/lens";

type WhiteboardIconItemProps = {
  icon: JSX.Element
  whiteboard: Tables<"whiteboard">
  selected?: boolean;
  unselectBlocks?: () => void
  handleWhiteboardDelete: (whiteboard_id: number) => Promise<any>,
  handleWhiteboardChangeName: (whiteboard_id: number, newWhiteboardName: string) => Promise<any>
  handleItemIconChange?: (item_id: number, newIcon: string) => Promise<any>
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

  const [editMode, setEditMode] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(["waiting", "queued", "processing"].includes(whiteboardPluginState?.status));
  const [titleText, setTitleText] = useState<string>(whiteboard.name);
  const $textarea = useRef<HTMLTextAreaElement>(null);

  // const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

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

  const actions: ContextMenuContent = useMemo(() => [{
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
    onClick: () => {
      setEditMode(true);
    }
  },
  {
    key: 'changeIcon',
    color: "#228be6",
    icon: <FaCog size={16} />,
    title: "Settings",
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
  }], []);

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
      handleWhiteboardChangeName(whiteboard.whiteboard_id, (event.target as HTMLTextAreaElement).value.trim())
        .then(res => setLoading(false))
      return;
    }
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
            {whiteboardPluginState?.status === "processing" && <Text size="xs" fw="bold" c="dimmed" className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              {(whiteboardPluginState?.progress * 100).toFixed(1)}%
            </Text>}
            <AiOutlineLoading size={48} fill="#999" className="animate-spin" />
          </>
          : ""
        }
      </Box>
      <Box className={cn(loading && "opacity-10" || "")}>{icon}</Box>
      {/* <Box className={cn("flex flex-col items-center align-bottom", loading && "opacity-10" || "")}>
        <div className="mt-2">
          {icon}
        </div>
        <Text size="8" p={0} lh="xs" c="dimmed" className="select-none">{whiteboardPlugin?.name?.replace(/-/g, " ")}</Text>
      </Box> */}
      <Box w={100} h={40} variant="unstyled" className="text-center">
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
          : <Text inline={true} size={`${7 * 200 / zoomLevel}px`} ta="center" c="dimmed" className="break-words line-clamp-2 leading-none select-none">{titleText}</Text>
        }
      </Box>
    </Flex>
  </>
}