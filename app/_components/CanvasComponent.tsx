import formatDate from "@lib/format-date";
import clsx from "clsx";
import { useEffect, useState, createRef, forwardRef, ForwardedRef, useMemo, useRef, MouseEventHandler, MouseEvent, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import { Block } from "app/_types/block";
import { FaArchive, FaFolder } from "react-icons/fa";
import BlockLenses from "@components/BlockLenses";
import apiClient from "@utils/apiClient";
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import load from "@lib/load";
import toast from "react-hot-toast";
import { Text, Flex, Box, Center } from '@mantine/core';

import GridLayout, { ItemCallback, Layout, Layouts, Responsive, WidthProvider } from "react-grid-layout";
import { useRouter } from 'next/navigation'
import 'react-grid-layout/css/styles.css';


/* TODO
+ Storing layout in localStorage
+ Fix the overlapping issue with the sidebar Context block
+ Storing layout preference in localStorage
+ Allow users to enter folders with double click

- Prevent initially moving blocks
*/

interface CanvasComponentProps {
  blocks: Block[];
  lens_id: string;
}

export default function CanvasComponent({ blocks, lens_id }: CanvasComponentProps) {
  const router = useRouter();
  const [layouts, setLayouts] = useState<Layouts>(getLayoutFromStorage(lens_id) || generateLayoutFromBlocks(blocks));
  const $lastClick = useRef<number>(0);

  const ResponsiveReactGridLayout = useMemo(() => WidthProvider(Responsive), []);

  const onDoubleClick = (block: Block) => {
    router.push(`/block/${block.block_id}`)
  }

  const onChangeLayout = (layout: Layout[], layouts: Layouts) => {
    setLayouts(layouts)
    setLayoutToStorage(lens_id, layouts)
  }

  const calculateDoubleClick: ItemCallback = useCallback((layout, oldItem, newItem, placeholder, event, element) => {
    const block = blocks.find(block => block.block_id.toString() === newItem.i)
    if (block) {
      const now = Date.now();
      if ($lastClick.current && (now - $lastClick.current) < 300) {
        onDoubleClick(block)
      }
      $lastClick.current = now;
    }
  }, [])

  return (
    <ResponsiveReactGridLayout
      layouts={layouts}
      cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
      rowHeight={80}
      onLayoutChange={onChangeLayout}
      useCSSTransforms={true}
      autoSize={false}
      onDragStart={calculateDoubleClick}
      verticalCompact={false}>
      {blocks.map((block, index) => {
        return <div key={block.block_id}>
          <CanvasItem block={block} />
        </div>
      })}
    </ResponsiveReactGridLayout>
  );
}

type CanvasItemProps = { block: Block }
const CanvasItem = ({ block }: CanvasItemProps) => {
  return <Flex
    mih={70} gap="lg"
    justify="center" align="center"
    direction="column" wrap="nowrap">
    <FaFolder size={32} color="#007AFF" />
    <Box w={70} h={30} style={{ textAlign: "center" }}>
      <Text size="sm" c="dimmed" truncate="end">{block.title}</Text>
    </Box>
  </Flex>
}

function getLayoutFromStorage(lens_id: string): null | Layouts {
  let layout = null;
  if (global.localStorage) {
    try {
      layout = JSON.parse(global.localStorage.getItem("gridlayout")) || null;
    } catch (e) {
      /*Ignore*/
    }
  }
  return layout ? layout[lens_id] : null;
}

function setLayoutToStorage(lens_id: string, value: Layouts) {
  if (global.localStorage) {
    const layout = JSON.parse(global.localStorage.getItem("gridlayout"))
    global.localStorage.setItem(
      "gridlayout",
      JSON.stringify({
        ...layout,
        [lens_id]: value
      })
    );
  }
}

const generateLayoutFromBlocks = (blocks: Block[]): Layouts => {
  const layout: Layout[] = blocks.map(block => ({
    i: block.block_id.toString(),
    x: 0, y: 0, w: 1, h: 1, isResizable: false
  }))
  return {
    lg: layout,
    md: layout,
    sm: layout,
    xs: layout,
    xxs: layout
  }
}