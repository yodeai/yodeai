import { useState, useMemo, useRef, useEffect } from "react";
import { AiOutlineLoading } from "react-icons/ai";

import { Text, Flex, Box, Textarea } from '@mantine/core';
import { useRouter } from 'next/navigation'
import 'react-grid-layout/css/styles.css';
import { Subspace, Lens } from "app/_types/lens";
import { ContextMenuContent, useContextMenu } from 'mantine-contextmenu';
import { FaICursor, FaShare } from "react-icons/fa";
import { modals } from '@mantine/modals';
import { useAppContext } from "@contexts/context";

import ShareLensComponent from '../../ShareLensComponent';
import { useDisclosure } from "@mantine/hooks";
import { FaRegTrashCan, FaLink } from "react-icons/fa6";
import { RiPushpinFill, RiUnpinFill } from "react-icons/ri";

type SubspaceIconItemProps = {
  icon: JSX.Element
  subspace: Subspace | Lens
  selected?: boolean;
  unselectBlocks?: () => void
  handleLensDelete: (lens_id: number) => Promise<any>
  handleLensChangeName: (lens_id: number, newLensName: string) => Promise<any>
}
export const SubspaceIconItem = ({ subspace, icon, handleLensDelete, handleLensChangeName, unselectBlocks }: SubspaceIconItemProps) => {
  const { showContextMenu } = useContextMenu();
  const router = useRouter();
  const { pinnedLenses, accessType, zoomLevel, setPinnedLenses } = useAppContext();
  const isPinned = useMemo(() => pinnedLenses.map(lens => lens.lens_id).includes(subspace.lens_id), [pinnedLenses, subspace]);
  const [loading, setLoading] = useState<boolean>(false);

  const $textarea = useRef<HTMLTextAreaElement>(null);
  const [titleText, setTitleText] = useState<string>(subspace.name);
  const [editMode, setEditMode] = useState<boolean>(false);

  const shareModalDisclosure = useDisclosure(false);
  const [shareModalState, shareModalController] = shareModalDisclosure;

  const openDeleteModal = () => modals.openConfirmModal({
    title: 'Confirm space deletion',
    centered: true,
    confirmProps: { color: 'red' },
    children: (
      <Text size="sm">
        Are you sure you want to delete this space? This action cannot be undone.
      </Text>
    ),
    labels: { confirm: 'Delete Space', cancel: "Cancel" },
    onCancel: () => console.log('Canceled deletion'),
    onConfirm: onConfirmDelete,
  });

  const onConfirmDelete = () => {
    setLoading(true);
    handleLensDelete(subspace.lens_id).then(res => setLoading(false));
  }

  const onPinLens = async () => {
    try {
      const pinResponse = await fetch(`/api/lens/${subspace.lens_id}/pin`, { method: "PUT" });
      if (pinResponse.ok) {
        setPinnedLenses((pinnedLenses) => [...pinnedLenses, subspace as Lens])
      }
      if (!pinResponse.ok) console.error("Failed to pin lens");
    } catch (error) {
      console.error("Error pinning lens:", error);
    }
  }

  const onUnpinLens = async () => {
    try {
      const pinResponse = await fetch(`/api/lens/${subspace.lens_id}/pin`, { method: "DELETE" });
      if (pinResponse.ok) {
        setPinnedLenses(pinnedLenses.filter((lens) => lens.lens_id !== subspace.lens_id));
      }
      if (!pinResponse.ok) console.error("Failed to unpin lens");
    } catch (error) {
      console.error("Error pinning lens:", error);
    }
  }

  const actions: ContextMenuContent = useMemo(() => [{
    key: 'open',
    color: "#228be6",
    icon: <FaLink size={16} />,
    title: "Open",
    onClick: () => {
      if (window.location.pathname === "/") return router.push(`/lens/${subspace.lens_id}`)
      else router.push(`${window.location.pathname}/${subspace.lens_id}`)
    }
  },
  {
    key: 'share',
    color: "#228be6",
    icon: <FaShare size={14} />,
    title: "Share",
    disabled: ["owner"].includes(subspace.access_type || accessType) === false,
    onClick: () => shareModalController.open()
  },
  {
    key: 'pin',
    color: "#228be6",
    icon: isPinned ? <RiUnpinFill size={16} /> : <RiPushpinFill size={16} />,
    title: isPinned ? "Unpin" : "Pin",
    onClick: isPinned ? onUnpinLens : onPinLens
  },
  {
    key: 'rename',
    color: "#228be6",
    icon: <FaICursor size={16} />,
    title: 'Rename',
    onClick: () => setEditMode(true),
  },
  {
    key: 'remove',
    color: "#ff6b6b",
    icon: <FaRegTrashCan size={16} />,
    title: "Delete",
    onClick: openDeleteModal,
    disabled: ["owner", "editor"].includes(subspace.access_type || accessType) === false,
  }

  ], [isPinned, accessType]);

  const onContextMenu = showContextMenu(actions);

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
      handleLensChangeName(subspace.lens_id, (event.target as HTMLTextAreaElement).value.trim())
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

  return <>
    {shareModalState && <ShareLensComponent modalController={shareModalDisclosure} lensId={subspace.lens_id} />}
    <Flex
      onContextMenu={onContextMenu}
      mih={100} gap="6px"
      justify="flex-end" align="center"
      direction="column" wrap="nowrap">
      <Box>
        {loading
          ? <AiOutlineLoading size={32} fill="#999" className="animate-spin" />
          : icon
        }
      </Box>
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
        {/* <Text inline={true} size={`${7 * 200 / zoomLevel}px`} ta="center" c="dimmed" className="break-words line-clamp-2 leading-none select-none">
          {subspace.name}
        </Text> */}
      </Box>
    </Flex>
  </>
}
