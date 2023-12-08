import { useState, useMemo, useRef, useCallback, useEffect, Fragment } from "react";
import { Block } from "app/_types/block";
import { FaCube, FaFileLines, FaFilePdf, FaRegTrashCan, FaLink } from "react-icons/fa6";
import { AiOutlineLoading } from "react-icons/ai";
import { AiOutlinePushpin } from 'react-icons/ai';

import { Text, Flex, Box, Textarea } from '@mantine/core';
import { Layout } from "react-grid-layout";

import { ItemCallback, Responsive, WidthProvider } from "react-grid-layout";
import { useRouter } from 'next/navigation'
import 'react-grid-layout/css/styles.css';
import { LensLayout, Subspace } from "app/_types/lens";
import { ContextMenuContent, useContextMenu } from 'mantine-contextmenu';
import { FaICursor } from "react-icons/fa";
import { modals } from '@mantine/modals';
import { Breadcrumbs, Anchor } from '@mantine/core';
import { useAppContext } from "@contexts/context";
import { set } from "date-fns";
import { useDebouncedCallback } from "@utils/hooks";

const ResponsiveReactGridLayout = WidthProvider(Responsive);

interface IconLayoutComponentProps {
  blocks: Block[];
  subspaces: Subspace[];
  layouts: LensLayout["icon_layout"]
  lens_id: string;
  onChangeLayout: (layoutName: keyof LensLayout, layoutData: LensLayout[keyof LensLayout]) => void,
  handleBlockChangeName: (block_id: number, newBlockName: string) => Promise<any>
  handleBlockDelete: (block_id: number) => Promise<any>
}
export default function IconLayoutComponent({
  blocks,
  layouts,
  lens_id,
  subspaces,
  onChangeLayout,
  handleBlockChangeName,
  handleBlockDelete
}: IconLayoutComponentProps) {
  const router = useRouter();
  const [breakpoint, setBreakpoint] = useState<string>("lg");
  const $lastClick = useRef<number>(0);
  const { lensName, lensId, layoutRefs, setDraggingNewBlock } = useAppContext();

  const { pinnedLenses } = useAppContext();
  const pinnedLensIds = useMemo(() => pinnedLenses.map(lens => lens.lens_id), [pinnedLenses]);

  const fileTypeIcons = useMemo(() => ({
    pdf: <FaFilePdf size={32} color="#228be6" />,
    note: <FaFileLines size={32} color="#888888" />,
    subspace: <FaCube size={32} color="#fd7e14" />,
  }), []);

  const cols = useMemo(() => ({ lg: 12, md: 8, sm: 6, xs: 4, xxs: 3 }), []);
  const breakpoints = useMemo(() => ({ lg: 996, md: 768, sm: 576, xs: 480, xxs: 240 }), []);
  const [selectedItems, setSelectedItems] = useState<(Block["block_id"] | Subspace["lens_id"])[]>([]);

  const items: (Block | Subspace)[] = useMemo(() => [].concat(blocks, subspaces), [blocks, subspaces])

  const breadcrumbs = useMemo(() => {
    let elements = [
      { title: 'Space' },
      { title: lensName, href: `/lens/${lensId}` }
    ];

    if (selectedItems.length === 0) {
      return elements;
    } else if (selectedItems.length === 1) {
      const selectedItem = items.find(item => {
        return "lens_id" in item
          ? item.lens_id === selectedItems[0]
          : item.block_id === selectedItems[0]
      });
      if (!selectedItem) return elements;
      elements.push({
        title: "lens_id" in selectedItem ? selectedItem.name : selectedItem.title,
        href: "lens_id" in selectedItem ? `/lens/${selectedItem.lens_id}` : `/block/${selectedItem.block_id}`
      })
    } else if (selectedItems.length > 1) {
      elements.push({ title: `${selectedItems.length} items selected` })
    }

    return elements;
  }, [items, lensName, lensId, selectedItems]);

  const onDoubleClick = (itemType: string, itemId: number) => {
    const path = itemType === "bl" ? `/block/${itemId}` : `${window.location.pathname}/${itemId}`;
    router.push(path)
  }

  const calculateDoubleClick: ItemCallback = useCallback((layout, oldItem, newItem, placeholder, event, element) => {
    const [itemType, itemId] = newItem.i.split("_") as ["bl" | "ss", Block["block_id"] | Subspace["lens_id"]];

    const now = Date.now();
    if ($lastClick.current && (now - $lastClick.current) < 300) {
      onDoubleClick(itemType, itemId)
      return;
    }
    $lastClick.current = now;

    setSelectedItems((selectedItems) => (
      event.ctrlKey
        ? selectedItems.includes(Number(itemId))
          ? selectedItems.filter(item_id => item_id !== Number(itemId))
          : [...selectedItems, Number(itemId)]
        : [Number(itemId)]
    ))
  }, [])

  const onWidthChange = (width: number, margin: [number, number], cols: number) => {
    const breakpoint = Object.entries(breakpoints).find(([key, value]) => value <= width + margin.reduce((a, b) => a + b, 0) + cols);
    if (breakpoint === undefined) return;
    setBreakpoint(breakpoint[0])
  }

  const layoutItems = useMemo(() => items.map((item, index) => {
    const isSubspace = "lens_id" in item;

    const key = isSubspace ? `ss_${item.lens_id}` : `bl_${item.block_id}`;
    const item_id = isSubspace ? item.lens_id : item.block_id;

    const defaultDataGrid = {
      x: index % cols[breakpoint],
      y: Math.floor(index / cols[breakpoint]),
      w: 1, h: 1, isResizable: false
    };

    const dataGrid = layouts?.[breakpoint]?.[index] || defaultDataGrid;
    return <div key={key} data-grid={dataGrid} className={`block-item ${selectedItems.includes(item_id) ? "bg-gray-100" : ""}`}>
      {isSubspace
        ? <SubspaceIconItem
          selected={selectedItems.includes(item_id)}
          unselectBlocks={() => setSelectedItems([])}
          icon={fileTypeIcons.subspace} subspace={item} />
        : <BlockIconItem
          selected={selectedItems.includes(item_id)}
          handleBlockChangeName={handleBlockChangeName}
          handleBlockDelete={handleBlockDelete}
          unselectBlocks={() => setSelectedItems([])}
          icon={fileTypeIcons[item.block_type]} block={item} />
      }
    </div>
  }), [subspaces, breakpoint, blocks, layouts, cols, selectedItems])

  const onPinLens = async (lens_id: string) => {
    try {
      const pinResponse = await fetch(`/api/lens/${lens_id}/pin`, { method: "PUT" });
      if (pinResponse.ok) console.log("Lens pinned");
      if (!pinResponse.ok) console.error("Failed to pin lens");
    } catch (error) {
      console.error("Error pinning lens:", error);
    }
  }

  const checkOverlap = (target: HTMLElement, target2: HTMLElement) => {
    const rect1 = target?.getBoundingClientRect();
    const rect2 = target2?.getBoundingClientRect();
    if(!rect1 || !rect2) return false;
    return (rect1.left < rect2.right &&
      rect1.right > rect2.left &&
      rect1.top < rect2.bottom &&
      rect1.bottom > rect2.top)
  }

  const onDrag = useDebouncedCallback(
    (
      layout: Layout[],
      oldItem: Layout,
      newItem: Layout,
      placeholder: Layout,
      event: MouseEvent,
      element: HTMLElement
    ) => {
      const target = event.target as HTMLElement;
      if (!newItem.i.startsWith("ss")) return;

      const [_, lens_id] = newItem.i.split("_");
      if (pinnedLensIds.includes(Number(lens_id))) return;

      if (checkOverlap(target, layoutRefs.sidebar.current)) {
        setDraggingNewBlock(true);
      } else {
        setDraggingNewBlock(false);
      }
    },
    10,
    [pinnedLensIds]
  );

  const onDragStop = (layout: Layout[], oldItem: any, newItem: any, placeholder: any, event: MouseEvent, element: HTMLElement) => {
    const target = event.target as HTMLElement;
    if (checkOverlap(target, layoutRefs.sidebar.current)) {
      if (!newItem.i.startsWith("ss")) return;
      const [_, lens_id] = newItem.i.split("_");
      onPinLens(String(lens_id))
      setDraggingNewBlock(false);
    }
  }

  return <div className="flex flex-col p-2 justify-between h-[calc(100%-50px)]">
    <ResponsiveReactGridLayout
      layouts={layouts}
      cols={cols}
      breakpoint={breakpoint}
      breakpoints={breakpoints}
      rowHeight={75}
      onLayoutChange={(layout, layouts) => onChangeLayout("icon_layout", layouts)}
      isResizable={false}
      onWidthChange={onWidthChange}
      onDragStart={calculateDoubleClick}
      onDrag={onDrag}
      onDragStop={onDragStop}
      preventCollision={true}
      verticalCompact={false}>
      {layoutItems}
    </ResponsiveReactGridLayout>
    {/* <Breadcrumbs className="overflow bottom-0 left-0 z-50">{
      breadcrumbs.map(({ title, href }, index) => (
        <Fragment key={index}>
          {href
            ? <Anchor href={href} size="sm" c="dimmed">{title}</Anchor>
            : <Text size="sm" c="dimmed">{title}</Text>
          }
        </Fragment>
      ))
    }</Breadcrumbs> */}
  </div>
}

type BlockIconItemProps = {
  icon: JSX.Element,
  block: Block
  selected?: boolean;
  handleBlockChangeName?: (block_id: number, newBlockName: string) => Promise<any>
  handleBlockDelete?: (block_id: number) => Promise<any>
  unselectBlocks?: () => void
}
const BlockIconItem = ({ block, icon, handleBlockChangeName, handleBlockDelete, unselectBlocks }: BlockIconItemProps) => {
  const { showContextMenu } = useContextMenu();
  const $textarea = useRef<HTMLTextAreaElement>(null);
  const { accessType } = useAppContext();
  const router = useRouter();

  const [titleText, setTitleText] = useState<string>(block.title);
  const [editMode, setEditMode] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

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
      setEditMode(false);
      return;
    }
    if (event.key === "Enter") {
      setEditMode(false)
      setLoading(true)
      handleBlockChangeName(block.block_id, (event.target as HTMLTextAreaElement).value.trim())
        .then(res => setLoading(false))
      return;
    }
  }

  const onConfirmDelete = () => {
    setLoading(true);
    handleBlockDelete(block.block_id).then(res => setLoading(false));
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

  return <Flex
    onContextMenu={onContextMenu}
    mih={75} gap="6px"
    justify="normal" align="center"
    direction="column" wrap="nowrap">
    {loading ? <AiOutlineLoading size={32} fill="#999" className="animate-spin" /> : icon}
    <Box w={70} h={30} variant="unstyled" className="text-center">
      {editMode
        ? <Textarea
          className="z-50"
          minRows={1} maxRows={2} ref={$textarea}
          variant="unstyled" size="xs" ta="center" c="dimmed"
          onKeyDown={onKeyDown}
          onChange={onChangeTitle} placeholder="Title" value={titleText} autosize />
        : <Text inline={true} size="xs" ta="center" c="dimmed" className="break-words line-clamp-2 leading-none">{titleText}</Text>
      }
    </Box>
  </Flex>
}

type SubspaceIconItemProps = {
  icon: JSX.Element,
  subspace: Subspace
  selected?: boolean;
  unselectBlocks?: () => void
}
const SubspaceIconItem = ({ subspace, icon, unselectBlocks }: SubspaceIconItemProps) => {
  const { showContextMenu } = useContextMenu();
  const router = useRouter();
  const { pinnedLenses, accessType } = useAppContext();
  const isPinned = useMemo(() => pinnedLenses.map(lens => lens.lens_id).includes(subspace.lens_id), [pinnedLenses, subspace]);

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

  const onConfirmDelete = async () => {
    try {
      const deleteResponse = await fetch(`/api/lens/${subspace.lens_id}`, { method: "DELETE" });
      if (deleteResponse.ok) console.log("Lens deleted");
      if (!deleteResponse.ok) console.error("Failed to delete lens");
    } catch (error) {
      console.error("Error deleting lens:", error);
    }
  }

  const onPinLens = async () => {
    try {
      const pinResponse = await fetch(`/api/lens/${subspace.lens_id}/pin`, { method: "PUT" });
      if (pinResponse.ok) console.log("Lens pinned");
      if (!pinResponse.ok) console.error("Failed to pin lens");
    } catch (error) {
      console.error("Error pinning lens:", error);
    }
  }

  const onUnpinLens = async () => {
    try {
      const pinResponse = await fetch(`/api/lens/${subspace.lens_id}/pin`, { method: "DELETE" });
      if (pinResponse.ok) console.log("Lens unpinned");
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
      router.push(`${window.location.pathname}/${subspace.lens_id}`)
    }
  }, {
    key: 'remove',
    color: "#ff6b6b",
    icon: <FaRegTrashCan size={16} />,
    title: "Delete",
    onClick: openDeleteModal,
    disabled: ["owner", "editor"].includes(accessType) === false
  }, {
    key: 'pin',
    color: "#228be6",
    icon: isPinned ? <AiOutlinePushpin size={16} /> : <FaLink size={16} />,
    title: isPinned ? "Unpin" : "Pin",
    onClick: isPinned ? onUnpinLens : onPinLens
  }], [isPinned, accessType]);

  const onContextMenu = showContextMenu(actions);

  return <Flex
    onContextMenu={onContextMenu}
    mih={75} gap="6px"
    justify="normal" align="center"
    direction="column" wrap="nowrap">
    {icon}
    <Box w={75} h={30} variant="unstyled" className="text-center">
      <Text inline={true} size="xs" ta="center" c="dimmed" className="break-words line-clamp-2 leading-none">
        {subspace.name}
      </Text>
    </Box>
  </Flex>
}