import { useState, useMemo, useRef, useEffect } from "react";
import { Block } from "app/_types/block";
import { AiOutlineLoading } from "@react-icons/all-files/ai/AiOutlineLoading";

import { Text, Flex, Box, Textarea, Tooltip } from '@mantine/core';

import { useProgressRouter } from 'app/_hooks/useProgressRouter'
import 'react-grid-layout/css/styles.css';
import { ContextMenuContent, useContextMenu } from 'mantine-contextmenu';
import { FaICursor } from "@react-icons/all-files/fa/FaICursor";
import { modals } from '@mantine/modals';
import { useAppContext } from "@contexts/context";
import { useDebouncedCallback } from "app/_hooks/useDebouncedCallback";

import { FaRegTrashCan } from "@react-icons/all-files/fa6/FaRegTrashCan";
import { FaLink } from "@react-icons/all-files/fa6/FaLink";
import { useClickOutside } from "@mantine/hooks";

type BlockIconItemProps = {
  icon: JSX.Element,
  block: Block
  selected?: boolean;
  handleBlockChangeName?: (block_id: number, newBlockName: string) => Promise<any>
  handleBlockDelete?: (block_id: number) => Promise<any>
  unselectBlocks?: () => void
}
export const BlockIconItem = ({ block, icon, selected, handleBlockChangeName, handleBlockDelete, unselectBlocks }: BlockIconItemProps) => {
  const { showContextMenu } = useContextMenu();
  const { accessType, zoomLevel } = useAppContext();
  const router = useProgressRouter();

  const defaultTitle = useMemo(() => block.title || "Untitled", [block.title]);

  const [titleText, setTitleText] = useState<string>(block.title);
  const [editMode, setEditMode] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [showPreview, setShowPreview] = useState<boolean>(false);

  const onClickBlock = () => {
    router.push(`/block/${block.block_id}`)
  }

  const handleSubmit = () => {
    setEditMode(false);
    setLoading(true);
    handleBlockChangeName(block.block_id, titleText).then(res => setLoading(false));
  }
  const $inputContainer = useClickOutside<HTMLTextAreaElement>(handleSubmit);

  useEffect(() => {
    setTitleText(block.title);
  }, [block])

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
    handleBlockDelete(block.block_id).then(res => setLoading(false));
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

  const actions: ContextMenuContent = useMemo(() => [{
    key: 'open',
    color: "#228be6",
    icon: <FaLink size={16} />,
    title: "Open",
    onClick: () => {
      router.push(`/block/${block.block_id}`)
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
  }], [accessType]);

  const onContextMenu = showContextMenu(actions);

  const blockPreviewContent = useMemo(() => {
    if (zoomLevel < 125 || !block.preview) {
      return <Box variant="unstyled">
        {loading
          ? <AiOutlineLoading size={32} fill="#999" className="animate-spin" />
          : icon
        }
      </Box>
    } else {
      return <Tooltip
        position="bottom"
        maw={300}
        opened={showPreview}
        label={
          <Text component="div" size={`${20 * zoomLevel / 200}px`} className="w-full break-words select-none whitespace-break-spaces">
            {block.preview}
          </Text>
        }>
        <Box h={70} className="w-full border border-gray-200 p-1 rounded-lg mx-1 overflow-hidden" variant="unstyled">
          <Text component="span" size={`${6 * 200 / zoomLevel}px`} c="dimmed" lineClamp={15} className="break-words select-none whitespace-break-spaces">
            {block.preview}
          </Text>
        </Box>
      </Tooltip>
    }
  }, [zoomLevel, showPreview, loading]);

  const $mouseEnter = useRef<boolean>(false);
  const onMouseEnter = useDebouncedCallback((event: React.MouseEvent<HTMLDivElement, MouseEvent>, value) => {
    setShowPreview(value);
  }, 1000);

  return (
    <>
      <Flex
        onContextMenu={onContextMenu}
        onMouseEnter={(event) => {
          $mouseEnter.current = true;
          onMouseEnter(event, true)
        }}
        onMouseDown={() => setShowPreview(false)}
        onMouseMove={() => {
          if ($mouseEnter.current) setShowPreview(false)
        }}
        onMouseLeave={(event) => {
          $mouseEnter.current = false;
          onMouseEnter(event, false)
        }}
        mih={100} gap="6px"
        align="center" justify="flex-end"
        direction="column" wrap="nowrap">
        {blockPreviewContent}
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
    </>
  );
}
