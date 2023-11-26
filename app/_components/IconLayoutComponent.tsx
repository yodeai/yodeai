import { useState, useMemo, useRef, useCallback, useEffect, Fragment } from "react";
import { Block } from "app/_types/block";
import { FaFolder, FaFileLines, FaFilePdf, FaRegTrashCan } from "react-icons/fa6";
import { AiOutlineLoading } from "react-icons/ai";

import { Text, Flex, Box, TextProps, Textarea, Popover, Button } from '@mantine/core';

import { truncateText } from "@utils/index";
import { ItemCallback, Responsive, WidthProvider } from "react-grid-layout";
import { useRouter } from 'next/navigation'
import 'react-grid-layout/css/styles.css';
import { LensLayout } from "../_types/lens";
import { ContextMenuContent, useContextMenu } from 'mantine-contextmenu';
import { FaICursor } from "react-icons/fa";
import { modals } from '@mantine/modals';
import { Breadcrumbs, Anchor } from '@mantine/core';
import { useAppContext } from "@contexts/context";

interface IconLayoutComponentProps {
  blocks: Block[];
  layouts: LensLayout["icon_layout"]
  lens_id: string;
  onChangeLayout: (layoutName: keyof LensLayout, layoutData: LensLayout[keyof LensLayout]) => void,
  handleBlockChangeName: (block_id: number, newBlockName: string) => Promise<any>
  handleBlockDelete: (block_id: number) => Promise<any>
}

const ResponsiveReactGridLayout = WidthProvider(Responsive);

export default function IconLayoutComponent({
  blocks, layouts, lens_id, onChangeLayout,
  handleBlockChangeName, handleBlockDelete
}: IconLayoutComponentProps) {
  const router = useRouter();
  const [breakpoint, setBreakpoint] = useState<string>("lg");
  const $lastClick = useRef<number>(0);
  const { lensName, lensId } = useAppContext();

  const fileTypeIcons = useMemo(() => ({
    pdf: <FaFilePdf size={32} color="#228be6" />,
    note: <FaFileLines size={32} color="#888888" />,
    space: <FaFolder size={32} color="#fd7e14" />,
  }), []);

  const cols = useMemo(() => ({ lg: 12, md: 8, sm: 6, xs: 4, xxs: 2 }), []);
  const breakpoints = useMemo(() => ({ lg: 996, md: 768, sm: 576, xs: 480, xxs: 240 }), []);
  const [selectedBlocks, setSelectedBlocks] = useState<Block["block_id"][]>([]);

  const breadcrumbs = useMemo(() => {
    let elements = [
      { title: 'Lens' },
      { title: lensName, href: `/lens/${lensId}` }
    ];

    if (selectedBlocks.length === 0) {
      return elements;
    } else if (selectedBlocks.length === 1) {
      const selectedBlock = blocks.find(block => block.block_id === selectedBlocks[0]);
      elements.push({ title: selectedBlock.title, href: `/block/${selectedBlock.block_id}` })
    } else if (selectedBlocks.length > 1) {
      elements.push({ title: `${selectedBlocks.length} blocks selected` })
    }

    return elements;
  }, [lensName, lensId, selectedBlocks]);

  const onDoubleClick = (block: Block) => {
    router.push(`/block/${block.block_id}`)
  }

  const calculateDoubleClick: ItemCallback = useCallback((layout, oldItem, newItem, placeholder, event, element) => {
    const block = blocks.find(block => block.block_id.toString() === newItem.i)
    if (!block) return;

    const now = Date.now();
    if ($lastClick.current && (now - $lastClick.current) < 300) {
      onDoubleClick(block)
      return;
    }
    $lastClick.current = now;

    setSelectedBlocks((selectedBlocks) => (
      event.ctrlKey
        ? selectedBlocks.includes(block.block_id)
          ? selectedBlocks.filter(block_id => block_id !== block.block_id)
          : [...selectedBlocks, block.block_id]
        : [block.block_id]
    ))
  }, [])

  const onWidthChange = (width: number, margin: [number, number], cols: number) => {
    const breakpoint = Object.entries(breakpoints).find(([key, value]) => value <= width + margin.reduce((a, b) => a + b, 0) + cols);
    if (breakpoint === undefined) return;
    setBreakpoint(breakpoint[0])
  }

  const blockItems = useMemo(() =>
    blocks.map((block, index) => {
      const defaultDataGrid = {
        index,
        x: index % cols[breakpoint],
        y: Math.floor(index / cols[breakpoint]),
        w: 1, h: 1, isResizable: false
      };
      const dataGrid = layouts?.[breakpoint]?.[index] || defaultDataGrid;
      return <div key={block.block_id} data-grid={dataGrid} className={`block-item ${selectedBlocks.includes(block.block_id) ? "bg-gray-100" : ""}`}>
        <IconLayoutItem
          selected={selectedBlocks.includes(block.block_id)}
          handleBlockChangeName={handleBlockChangeName}
          handleBlockDelete={handleBlockDelete}
          unselectBlocks={() => setSelectedBlocks([])}
          icon={fileTypeIcons[block.block_type]} block={block} />
      </div>
    }), [breakpoint, blocks, layouts, cols, selectedBlocks])

  return <div className="h-full flex flex-col justify-between">
    <ResponsiveReactGridLayout
      layouts={layouts}
      cols={cols}
      breakpoint={breakpoint}
      breakpoints={breakpoints}
      rowHeight={95}
      onLayoutChange={(layout, layouts) => onChangeLayout("icon_layout", layouts)}
      isResizable={false}
      onWidthChange={onWidthChange}
      onDragStart={calculateDoubleClick}
      verticalCompact={false}>
      {blockItems}
    </ResponsiveReactGridLayout>
    <Breadcrumbs className="overflow bottom-0 left-0 z-50">{
      breadcrumbs.map(({ title, href }, index) => (
        <Fragment key={index}>
          {href
            ? <Anchor href={href} size="sm" c="dimmed">{title}</Anchor>
            : <Text size="sm" c="dimmed">{title}</Text>
          }
        </Fragment>
      ))
    }</Breadcrumbs>
  </div>
}

type IconLayoutItemProps = {
  block: Block;
  icon: JSX.Element,
  selected?: boolean;
  handleBlockChangeName?: (block_id: number, newBlockName: string) => Promise<any>
  handleBlockDelete?: (block_id: number) => Promise<any>
  unselectBlocks?: () => void
}
const IconLayoutItem = ({ block, icon, selected, handleBlockChangeName, handleBlockDelete, unselectBlocks }: IconLayoutItemProps) => {
  const { showContextMenu } = useContextMenu();
  const $textarea = useRef<HTMLTextAreaElement>(null);

  const [textTruncate, setTextTruncate] = useState<TextProps["truncate"]>(true);
  const [titleText, setTitleText] = useState<string>(block.title);
  const [editMode, setEditMode] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    setTitleText(block.title);
  }, [block.title])

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
    key: 'rename',
    color: "#228be6",
    icon: <FaICursor size={16} />,
    title: 'Rename',
    onClick: () => {
      setEditMode(true);
    }
  },
  {
    key: 'remove',
    color: "#ff6b6b",
    icon: <FaRegTrashCan size={16} />,
    title: "Delete",
    onClick: () => openDeleteModal()
  }], []);

  const onContextMenu = showContextMenu(actions);

  return <Flex
    onContextMenu={onContextMenu}
    mih={95} gap="lg"
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
        : <Text size="xs" ta="center" c="dimmed" className="break-words">{
          textTruncate ? truncateText(titleText, { from: "center" }) : titleText
        }</Text>
      }
    </Box>
  </Flex>
}