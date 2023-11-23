import { useState, useMemo, useRef, useCallback, useEffect } from "react";
import { Block } from "app/_types/block";
import { FaFolder, FaFileLines, FaFilePdf } from "react-icons/fa6";
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Text, Flex, Box, Center, TextProps } from '@mantine/core';

import { ItemCallback, Layout, Layouts, Responsive, WidthProvider } from "react-grid-layout";
import { useRouter } from 'next/navigation'
import 'react-grid-layout/css/styles.css';
import { LensLayout } from "../_types/lens";
import { set } from 'date-fns';

interface CanvasComponentProps {
  blocks: Block[];
  layouts: LensLayout["canvas_layout"]
  lens_id: string;
  onChangeLayout: (layoutName: keyof LensLayout, layoutData: LensLayout[keyof LensLayout]) => void
}

export default function CanvasComponent({ blocks, layouts, lens_id, onChangeLayout }: CanvasComponentProps) {
  const router = useRouter();
  const [breakpoint, setBreakpoint] = useState<string>("md");
  const $lastClick = useRef<number>(0);

  const ResponsiveReactGridLayout = useMemo(() => WidthProvider(Responsive), [breakpoint]);

  const onDoubleClick = (block: Block) => {
    router.push(`/block/${block.block_id}`)
  }

  const onBreakpointChange = useCallback((newBreakpoint: string, newCols: number) => {
    setBreakpoint(newBreakpoint)
  }, [breakpoint])

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

  const fileTypeIcons = useMemo(() => ({
    pdf: <FaFilePdf size={32} color="#228be6" />,
    note: <FaFileLines size={32} color="#888888" />,
    space: <FaFolder size={32} color="#fd7e14" />,
  }), []);

  const cols = useMemo(() => ({ lg: 12, md: 12, sm: 8, xs: 4, xxs: 2 }), [])

  const blockItems = useMemo(() => {
    return blocks.map((block, index) => {
      const defaultDataGrid = {
        index,
        x: index % cols[breakpoint],
        y: Math.floor((index + 1) / cols[breakpoint]),
        w: 1, h: 1, isResizable: false
      };
      const dataGrid = layouts?.[breakpoint]?.[index] || defaultDataGrid;
      return <div key={block.block_id} data-grid={dataGrid}>
        <CanvasItem icon={fileTypeIcons[block.block_type]} block={block} />
      </div>
    })
  }, [breakpoint, blocks, layouts])

  return (
    <ResponsiveReactGridLayout
      layouts={layouts}
      cols={cols}
      rowHeight={80}
      onBreakpointChange={onBreakpointChange}
      onLayoutChange={(layout, layouts) => onChangeLayout("canvas_layout", layouts)}
      useCSSTransforms={false}
      autoSize={false}
      isResizable={false}
      onDragStart={calculateDoubleClick}
      verticalCompact={false}>
      {blockItems}
    </ResponsiveReactGridLayout>
  );
}

type CanvasItemProps = {
  block: Block;
  icon: JSX.Element
}
const CanvasItem = ({ block, icon }: CanvasItemProps) => {
  const [textTruncate, setTextTruncate] = useState<TextProps["truncate"]>(false);

  const onMouseEnter = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    setTextTruncate(false);
  }

  const onMouseLeave = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    setTextTruncate("end");
  }

  return <Flex
    onMouseEnter={onMouseEnter}
    onMouseLeave={onMouseLeave}
    mih={70} gap="lg"
    justify="center" align="center"
    direction="column" wrap="nowrap">
    {icon}
    <Box w={70} h={30} style={{ textAlign: "center" }}>
      <Text size="xs" c="dimmed" truncate={textTruncate}>{block.title}</Text>
    </Box>
  </Flex>
}

// function getLayoutFromStorage(lens_id: string): null | Layouts {
//   let layout = null;
//   if (global.localStorage) {
//     try {
//       layout = JSON.parse(global.localStorage.getItem("gridlayout")) || null;
//     } catch (e) {
//       /*Ignore*/
//     }
//   }
//   return layout ? layout[lens_id] : null;
// }

// function setLayoutToStorage(lens_id: string, value: Layouts) {
//   if (global.localStorage) {
//     const layout = JSON.parse(global.localStorage.getItem("gridlayout"))
//     global.localStorage.setItem(
//       "gridlayout",
//       JSON.stringify({
//         ...layout,
//         [lens_id]: value
//       })
//     );
//   }
// }

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