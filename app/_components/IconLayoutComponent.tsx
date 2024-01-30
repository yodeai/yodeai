import { useState, useMemo, useRef, useCallback, useEffect, Fragment } from "react";
import { Block } from "app/_types/block";
import { FaCube, FaFileLines, FaFilePdf, FaRegTrashCan, FaLink, FaGoogleDrive, FaChalkboard, FaUsersGear, FaMagnifyingGlassChart } from "react-icons/fa6";
import { AiOutlineLoading, AiOutlinePushpin } from "react-icons/ai";

import { Text, Flex, Box, Textarea, Tooltip, Breadcrumbs } from '@mantine/core';
import { Layout, Layouts } from "react-grid-layout";

import { ItemCallback, Responsive, WidthProvider } from "react-grid-layout";
import { useRouter } from 'next/navigation'
import 'react-grid-layout/css/styles.css';
import { LensLayout, Subspace, Lens } from "app/_types/lens";
import { ContextMenuContent, useContextMenu } from 'mantine-contextmenu';
import { FaCog, FaHome, FaICursor, FaShare } from "react-icons/fa";
import { modals } from '@mantine/modals';
import { useAppContext } from "@contexts/context";
import { useDebouncedCallback } from "@utils/hooks";

import ShareLensComponent from './ShareLensComponent';
import { useDisclosure } from "@mantine/hooks";
import { Tables } from "app/_types/supabase";
import { Breadcrumb } from "./Breadcrumb";
import { WhiteboardPluginParams } from "app/_types/whiteboard";
import { cn } from "@utils/style";

const ResponsiveReactGridLayout = WidthProvider(Responsive);

interface IconLayoutComponentProps {
  blocks: Block[];
  subspaces: (Subspace | Lens)[];
  whiteboards: Tables<"whiteboard">[]
  layouts: LensLayout["icon_layout"]
  onChangeLayout: (layoutName: keyof LensLayout, layoutData: LensLayout[keyof LensLayout]) => void,
  handleBlockChangeName: (block_id: number, newBlockName: string) => Promise<any>
  handleBlockDelete: (block_id: number) => Promise<any>
  handleLensDelete: (lens_id: number) => Promise<any>
  handleWhiteboardDelete: (whiteboard_id: number) => Promise<any>
}
export default function IconLayoutComponent({
  blocks,
  subspaces,
  whiteboards,
  layouts,
  onChangeLayout,
  handleBlockChangeName,
  handleBlockDelete,
  handleLensDelete,
  handleWhiteboardDelete
}: IconLayoutComponentProps) {
  const router = useRouter();
  const [breakpoint, setBreakpoint] = useState<string>("lg");
  const $lastClick = useRef<number>(0);
  const $gridContainer = useRef<HTMLDivElement>(null);
  const {
    lensName, lensId, layoutRefs,
    pinnedLenses, setPinnedLenses,
    sortingOptions, setDraggingNewBlock,
    zoomLevel
  } = useAppContext();

  const pinnedLensIds = useMemo(() => pinnedLenses.map(lens => lens.lens_id), [pinnedLenses]);

  const fileTypeIcons = useMemo(() => ({
    pdf: <FaFilePdf size={32} color="#228be6" />,
    note: <FaFileLines size={32} color="#888888" />,
    whiteboard: <FaChalkboard size={32} color="#888888" />,
    subspace: <FaCube size={32} color="#fd7e14" />,
    sharedSubspace: <FaCube size={32} color="#d92e02" />,
    google_doc: <FaGoogleDrive size={32} color="#0F9D58" />,
    plugins: {
      "user-insight": <FaUsersGear size={32} color="#888888" />,
      "competitive-analysis": <FaMagnifyingGlassChart size={32} color="#888888" />,
    }
  }), []);

  const cols = useMemo(() => ({ lg: 12, md: 8, sm: 6, xs: 4, xxs: 3 }), []);
  const breakpoints = useMemo(() => ({ lg: 996, md: 768, sm: 576, xs: 480, xxs: 240 }), []);
  const [selectedItems, setSelectedItems] = useState<(Block["block_id"] | Subspace["lens_id"])[]>([]);

  const [breadcrumbLoading, setBreadcrumbLoading] = useState(true);
  const [breadcrumbData, setBreadcrumbData] = useState<{ lens_id: number, name: string }[]>(null);

  const items: (Block | Subspace | Lens | Tables<"whiteboard">)[] = useMemo(() => [].concat(blocks, subspaces, whiteboards), [blocks, subspaces, whiteboards])

  const breadcrumbs = useMemo<{ title: string, href?: string }[]>(() => {
    let elements = [].concat(
      [{ name: 'Spaces', lens_id: null }],
      breadcrumbData || lensId && [{ lens_id: lensId, name: lensName }] || []
    )
    elements = elements.reduce((acc, lens, index, arr) => {
      return [...acc,
      { title: lens.name, href: lens.lens_id ? `/lens/${lens.lens_id}` : "/" }
      ]
    }, []);

    if (selectedItems.length === 0) {
      return elements;
    } else if (selectedItems.length === 1) {
      const selectedItem = items.find(item => {
        if ("whiteboard_id" in item) return selectedItems[0] === item.whiteboard_id;
        if ("lens_id" in item) return selectedItems[0] === item.lens_id;
        if ("block_id" in item) return selectedItems[0] === item.block_id;
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
  }, [breadcrumbData, items, lensName, lensId, selectedItems])

  const getLensParents = () => {
    if (!lensId) {
      setBreadcrumbLoading(false);
      return;
    }
    return fetch(`/api/lens/${lensId}/getParents`)
      .then(res => {
        if (!res.ok) {
          throw new Error("Couldn't get parents of the lens.")
        } else {
          return res.json();
        }
      })
      .then(res => {
        setBreadcrumbData(res.data)
      })
      .catch(err => {
        console.log(err.message);
      })
      .finally(() => {
        setBreadcrumbLoading(false);
      })
  }

  useEffect(() => {
    getLensParents()
  }, [lensId]);

  const onDoubleClick = (itemType: "bl" | "ss" | "wb", itemId: number) => {
    if (itemType === "bl") return router.push(`/block/${itemId}`);

    if (itemType === "wb") return router.push(`/whiteboard/${itemId}`);

    if (itemType === "ss") {
      if (window.location.pathname === "/") {
        return router.push(`/lens/${itemId}`);
      }
      return router.push(`${window.location.pathname}/${itemId}`);
    }
  }

  const calculateDoubleClick: ItemCallback = useCallback((layout, oldItem, newItem, placeholder, event, element) => {
    const [itemType, itemId] = newItem.i.split("_") as [
      "bl" | "ss" | "wb",
      Block["block_id"] | Subspace["lens_id"] | Tables<"whiteboard">["whiteboard_id"]
    ];

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

  const sortedItems = useMemo(() => {
    if (sortingOptions.sortBy === null) return items;

    let _sorted_items = [...items].sort((a, b) => {
      if (sortingOptions.sortBy === "name") {
        let aName = "lens_id" in a ? a.name : a.title;
        let bName = "lens_id" in b ? b.name : b.title;
        return aName.localeCompare(bName);
      } else if (sortingOptions.sortBy === "createdAt") {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      } else if (sortingOptions.sortBy === "updatedAt") {
        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      }
    });

    if (sortingOptions.order === "desc") {
      _sorted_items = _sorted_items.reverse();
    }
    return _sorted_items;

  }, [items, sortingOptions])

  const layoutItems = useMemo(() => sortedItems.map((item, index) => {
    const defaultDataGrid = {
      x: index % cols[breakpoint],
      y: Math.floor(index / cols[breakpoint]),
      w: 1, h: 1, isResizable: false
    };
    const dataGrid = sortingOptions.sortBy === null ? layouts?.[breakpoint]?.[index] || defaultDataGrid : defaultDataGrid;

    let key: string;
    let item_id: number;
    let content: JSX.Element;

    if ("whiteboard_id" in item) {
      key = `wb_${item.whiteboard_id}`;
      item_id = item.whiteboard_id;
      const icon = (item.plugin as any)?.name && (item.plugin as any)?.name in fileTypeIcons.plugins
        ? fileTypeIcons.plugins[(item.plugin as any)?.name]
        : fileTypeIcons.whiteboard;
      content = <WhiteboardIconItem
        handleWhiteboardDelete={handleWhiteboardDelete}
        selected={selectedItems.includes(item_id)}
        unselectBlocks={() => setSelectedItems([])}
        icon={icon} whiteboard={item} />
    } else if ("lens_id" in item) {
      key = `ss_${item.lens_id}`;
      item_id = item.lens_id;
      content = <SubspaceIconItem
        selected={selectedItems.includes(item_id)}
        unselectBlocks={() => setSelectedItems([])}
        handleLensDelete={handleLensDelete}
        icon={
          (item.access_type === "owner" || !item?.access_type)
            ? fileTypeIcons.subspace
            : fileTypeIcons.sharedSubspace
        } subspace={item} />
    } else {
      key = `bl_${item.block_id}`;
      item_id = item.block_id;
      content = <BlockIconItem
        selected={selectedItems.includes(item_id)}
        handleBlockChangeName={handleBlockChangeName}
        handleBlockDelete={handleBlockDelete}
        unselectBlocks={() => setSelectedItems([])}
        icon={fileTypeIcons[item.block_type]} block={item} />
    }

    return <div key={key} data-grid={dataGrid}
      className={`block-item ${selectedItems.includes(item_id) ? "bg-gray-100" : ""}`}>
      {content}
    </div>
  }), [subspaces, breakpoint, blocks, whiteboards, layouts, cols, selectedItems, sortedItems, sortingOptions, zoomLevel])

  const onPinLens = async (lens_id: string) => {
    try {
      const pinResponse = await fetch(`/api/lens/${lens_id}/pin`, { method: "PUT" });
      if (pinResponse.ok) {
        const subspace = subspaces.find(subspace => subspace.lens_id === Number(lens_id));
        if (subspace) {
          setPinnedLenses((pinnedLenses) => [...pinnedLenses, subspace as Lens])
        }

        console.log("Lens pinned");
      }
      if (!pinResponse.ok) console.error("Failed to pin lens");
    } catch (error) {
      console.error("Error pinning lens:", error);
    }
  }

  const checkOverlap = (target: HTMLElement, target2: HTMLElement) => {
    const rect1 = target?.getBoundingClientRect();
    const rect2 = target2?.getBoundingClientRect();
    if (!rect1 || !rect2) return false;
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

      const [_, lens_id] = newItem.i?.split("_");
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
      const [_, lens_id] = newItem.i?.split("_");
      onPinLens(String(lens_id))
      setDraggingNewBlock(false);
    }
  }

  const onLayoutChange = useCallback((layout: Layout[], layouts: Layouts) => {
    if (sortingOptions.sortBy !== null) return;
    onChangeLayout("icon_layout", layouts)
  }, [sortingOptions]);

  const ROW_HEIGHT = 100;

  return <div className="flex flex-col justify-between z-50">
    <div ref={$gridContainer} style={{
      transform: `scale(${zoomLevel / 100}) translateZ(0)`,
      transformOrigin: 'top left',
      height: "calc(100vh - 160px)"
    }}>
      <ResponsiveReactGridLayout
        maxRows={$gridContainer.current?.clientHeight ? Math.floor($gridContainer.current.clientHeight / ROW_HEIGHT) : 0}
        layouts={layouts}
        cols={cols}
        breakpoint={breakpoint}
        breakpoints={breakpoints}
        rowHeight={ROW_HEIGHT}
        onLayoutChange={onLayoutChange}
        isResizable={false}
        onWidthChange={onWidthChange}
        onDragStart={calculateDoubleClick}
        onDrag={onDrag}
        onDragStop={onDragStop}
        preventCollision={true}
        verticalCompact={false}
        transformScale={zoomLevel / 100}>
        {layoutItems}
      </ResponsiveReactGridLayout>
    </div>
    <Breadcrumb loading={breadcrumbLoading} breadcrumbs={breadcrumbs} />
  </div >
}

type BlockIconItemProps = {
  icon: JSX.Element,
  block: Block
  selected?: boolean;
  handleBlockChangeName?: (block_id: number, newBlockName: string) => Promise<any>
  handleBlockDelete?: (block_id: number) => Promise<any>
  unselectBlocks?: () => void
}
const BlockIconItem = ({ block, icon, selected, handleBlockChangeName, handleBlockDelete, unselectBlocks }: BlockIconItemProps) => {
  const { showContextMenu } = useContextMenu();
  const $textarea = useRef<HTMLTextAreaElement>(null);
  const { accessType, zoomLevel } = useAppContext();
  const router = useRouter();

  const [titleText, setTitleText] = useState<string>(block.title);
  const [editMode, setEditMode] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [showPreview, setShowPreview] = useState<boolean>(false);

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

  const blockPreviewContent = useMemo(() => {
    if (zoomLevel < 125 || !block.preview) {
      return <Box variant="unstyled">
        {loading
          ? <AiOutlineLoading size={32} fill="#999" className="animate-spin" />
          : <SpaceIconHint>{icon}</SpaceIconHint>}
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

  return <Flex
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
}

type SubspaceIconItemProps = {
  icon: JSX.Element,
  subspace: Subspace | Lens
  selected?: boolean;
  unselectBlocks?: () => void
  handleLensDelete: (lens_id: number) => Promise<any>
}
const SubspaceIconItem = ({ subspace, icon, handleLensDelete, unselectBlocks }: SubspaceIconItemProps) => {
  const { showContextMenu } = useContextMenu();
  const router = useRouter();
  const { pinnedLenses, accessType, zoomLevel } = useAppContext();
  const isPinned = useMemo(() => pinnedLenses.map(lens => lens.lens_id).includes(subspace.lens_id), [pinnedLenses, subspace]);
  const [loading, setLoading] = useState<boolean>(false);

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
      if (window.location.pathname === "/") return router.push(`/lens/${subspace.lens_id}`)
      else router.push(`${window.location.pathname}/${subspace.lens_id}`)
    }
  },
  {
    key: 'share',
    color: "#228be6",
    icon: <FaShare size={14} />,
    title: "Share",
    onClick: () => shareModalController.open()
  },
  {
    key: 'remove',
    color: "#ff6b6b",
    icon: <FaRegTrashCan size={16} />,
    title: "Delete",
    onClick: openDeleteModal,
    disabled: ["owner", "editor"].includes(subspace.access_type || accessType) === false,
  },
  {
    key: 'pin',
    color: "#228be6",
    icon: isPinned ? <AiOutlinePushpin size={16} /> : <FaLink size={16} />,
    title: isPinned ? "Unpin" : "Pin",
    onClick: isPinned ? onUnpinLens : onPinLens
  }], [isPinned, accessType]);

  const onContextMenu = showContextMenu(actions);

  const subIcons = useMemo(() => {
    let subIcons: JSX.Element[] = [];
    if (isPinned) subIcons.push(
      <Tooltip label="Pinned Item" events={{ hover: true, focus: true, touch: false }}>
        <div>
          <AiOutlinePushpin size={18} stroke="2" color="#eeeeee" className="bg-slate-500 rounded-full p-1 opacity-60 hover:opacity-100" />
        </div>
      </Tooltip>
    );

    if (subspace.access_type === "editor") subIcons.push(
      <Tooltip label="Shared" events={{ hover: true, focus: true, touch: false }}>
        <div>
          <FaICursor size={16} stroke="2" color="#eeeeee" className="bg-slate-700 rounded-full opacity-60 hover:opacity-100" />
        </div>
      </Tooltip>
    );
    return subIcons;
  }, [isPinned, zoomLevel]);

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
          : <SpaceIconHint>{icon}</SpaceIconHint>
        }
      </Box>
      <Box w={100} h={40} variant="unstyled" className="text-center">
        <Text inline={true} size={`${7 * 200 / zoomLevel}px`} ta="center" c="dimmed" className="break-words line-clamp-2 leading-none select-none">
          {subspace.name}
        </Text>
      </Box>
    </Flex>
  </>
}

type WhiteboardIconItemProps = {
  icon: JSX.Element,
  whiteboard: Tables<"whiteboard">
  selected?: boolean;
  unselectBlocks?: () => void
  handleWhiteboardDelete: (whiteboard_id: number) => Promise<any>
}
const WhiteboardIconItem = ({ whiteboard, icon, handleWhiteboardDelete }: WhiteboardIconItemProps) => {
  const { showContextMenu } = useContextMenu();
  const whiteboardPluginState = useMemo(() => (whiteboard?.plugin as WhiteboardPluginParams)?.state, [whiteboard?.plugin]);

  const [loading, setLoading] = useState<boolean>(["waiting", "queued", "processing"].includes(whiteboardPluginState?.status));
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
  }, {
    key: 'remove',
    color: "#ff6b6b",
    icon: <FaRegTrashCan size={16} />,
    title: "Delete",
    onClick: openDeleteModal
  }], []);

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
      <Box w={100} h={40} variant="unstyled" className="text-center">
        <Text inline={true} ta="center" c="dimmed" className="break-words line-clamp-2 leading-none select-none">
          {whiteboard.name}
        </Text>
      </Box>
    </Flex>
  </>
}

type SpaceIconHintProps = {
  children: JSX.Element
  subIcons?: JSX.Element[]
}
const SpaceIconHint = ({ children, subIcons }: SpaceIconHintProps) => {
  return <>
    {children}
    <div className={"absolute top-1 right-1"}>
      {subIcons}
    </div>
  </>
}