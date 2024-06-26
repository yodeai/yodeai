import { useState, useMemo, useRef, useCallback, useEffect } from "react";
import { Layout, Layouts } from "react-grid-layout";

import { ItemCallback, Responsive, WidthProvider } from "react-grid-layout";
import 'react-grid-layout/css/styles.css';
import { LensLayout, Subspace, Lens } from "app/_types/lens";
import { useAppContext } from "@contexts/context";
import { useDebouncedCallback } from "app/_hooks/useDebouncedCallback";

import { useSort } from "app/_hooks/useSort";

import { Tables } from "app/_types/supabase";
import { Block } from "app/_types/block";
import { WhiteboardPluginParams } from "app/_types/whiteboard";
import { SpreadsheetPluginParams } from "app/_types/spreadsheet";

import {
  BlockIconItem,
  SubspaceIconItem,
  WhiteboardIconItem,
  SpreadsheetIconItem
} from "./_views/index";

import { ViewController } from "@components/Layout/LayoutController";
import fileTypeIcons from "./_icons/index";
import { useProgressRouter } from "app/_hooks/useProgressRouter";
import { WidgetIconItem } from "./_views/Widget";
import { getInnerHeight } from "@utils/style";

type IconViewItemType = Block | Subspace | Lens
  | (Tables<"whiteboard"> & {
    plugin?: WhiteboardPluginParams
  })
  | (Tables<"spreadsheet"> & {
    plugin?: SpreadsheetPluginParams
  })
  | Tables<"widget">;


const ResponsiveReactGridLayout = WidthProvider(Responsive);

interface IconLayoutComponentProps extends ViewController {
  layouts: LensLayout["icon_layout"]
}

type IconViewItemChars = "bl" | "ss" | "wb" | "sp" | "wd";

export default function IconLayoutComponent({
  blocks,
  subspaces,
  whiteboards,
  spreadsheets,
  widgets,
  layouts,
  itemIcons,
  onChangeLayout,
  handleBlockChangeName,
  handleBlockDelete,
  handleLensDelete,
  handleLensChangeName,
  handleWhiteboardDelete,
  handleWhiteboardChangeName,
  handleSpreadsheetChangeName,
  handleSpreadsheetDelete,
  handleWidgetChangeName,
  handleWidgetDelete,
  handleItemSettings
}: IconLayoutComponentProps) {
  const router = useProgressRouter();
  const [breakpoint, setBreakpoint] = useState<string>("lg");
  const $lastClick = useRef<number>(0);
  const $gridContainer = useRef<HTMLDivElement>(null);
  const {
    lensId, layoutRefs,
    pinnedLenses, setPinnedLenses,
    sortingOptions, setDraggingNewBlock,
    zoomLevel,
    setBreadcrumbActivePage
  } = useAppContext();

  const $mounted = useRef(false);

  const pinnedLensIds = useMemo(() => pinnedLenses.map(lens => lens.lens_id), [pinnedLenses]);

  const cols = useMemo(() => ({ xlg: 12, lg: 12, md: 8, sm: 6, xs: 4, xxs: 3, xxxs: 1 }), []);
  const breakpoints = useMemo(() => ({ xlg: 1200, lg: 996, md: 768, sm: 576, xs: 480, xxs: 240, xxxs: 120 }), []);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);

  const items: IconViewItemType[] = useMemo(() => [].concat(blocks, subspaces, whiteboards, spreadsheets, widgets),
    [blocks, subspaces, whiteboards, spreadsheets, widgets])

  useEffect(() => {
    if ($gridContainer.current) {
      const [container, grid] = [$gridContainer.current, $gridContainer.current.children[0]];
      if (container.clientHeight < grid.clientHeight) {
        (grid as HTMLDivElement).style.height = `${grid.clientHeight + 50}px`;
      }
    }

    return () => {
      setBreadcrumbActivePage(null);
    }
  }, [lensId]);

  const onDoubleClick = (itemType: IconViewItemChars, itemId: number) => {
    if (itemType === "bl") return router.push(`/block/${itemId}`)

    if (itemType === "wb") return router.push(`/whiteboard/${itemId}`);

    if (itemType === "ss") {
      if (window.location.pathname === "/") return router.push(`/lens/${itemId}`);
      return router.push(`${window.location.pathname}/${itemId}`);
    }

    if (itemType === "wd") return router.push(`/widget/${itemId}`)

    if (itemType === "sp") return router.push(`/spreadsheet/${itemId}`);
  }

  const onHoverItem = (itemType: IconViewItemChars, itemId: number) => {
    if (itemType === "bl") return router.prefetch(`/block/${itemId}`);
    if (itemType === "wb") return router.prefetch(`/whiteboard/${itemId}`);
    if (itemType === "ss") {
      if (window.location.pathname === "/") return router.prefetch(`/lens/${itemId}`);
      return router.prefetch(`${window.location.pathname}/${itemId}`);
    }
    if (itemType === "wd") return router.prefetch(`/widget/${itemId}`);
    if (itemType === "sp") return router.prefetch(`/spreadsheet/${itemId}`);
  }

  const checkIfClickable = (itemType: IconViewItemChars, itemId: number, item: IconViewItemType) => {
    if ("whiteboard_id" in item && item?.plugin && item?.plugin?.state?.status !== "success") {
      return false;
    }

    return true;
  }

  const onDragStart: ItemCallback = useCallback((layout, oldItem, newItem, placeholder, event, element) => {
    const [itemType, itemId] = newItem.i.split("_") as [IconViewItemChars, number];

    const selectedItem = items.find(item => {
      if ("whiteboard_id" in item) return Number(itemId) === item.whiteboard_id;
      if ("spreadsheet_id" in item) return Number(itemId) === item.spreadsheet_id;
      if ("widget_id" in item) return Number(itemId) === item.widget_id;
      if ("block_id" in item) return Number(itemId) === item.block_id;
      if ("lens_id" in item) return Number(itemId) === item.lens_id;
    });

    calculateDoubleClick(layout, oldItem, newItem, placeholder, event, element);
    if (!selectedItem) {
      setBreadcrumbActivePage(null);
      return;
    }

    let title = "", href = "";
    if ("block_id" in selectedItem) { href = `/block/${itemId}`; title = selectedItem.title }
    if ("spreadsheet_id" in selectedItem) { href = `/spreadsheet/${itemId}`; title = selectedItem.name }
    if ("widget_id" in selectedItem) { href = `/widget/${itemId}`; title = selectedItem.name }
    if ("whiteboard_id" in selectedItem) { href = `/whiteboard/${itemId}`; title = selectedItem.name }
    if ("name" in selectedItem) { href = `/lens/${itemId}`; title = selectedItem.name }

    setBreadcrumbActivePage({ title, href });

  }, [selectedItems])

  const calculateDoubleClick: ItemCallback = useCallback((layout, oldItem, newItem, placeholder, event, element) => {
    const [itemType, itemId] = newItem.i.split("_") as [IconViewItemChars, number];

    const item = items.find(item => {
      if ("whiteboard_id" in item) return Number(itemId) === item.whiteboard_id;
      if ("spreadsheet_id" in item) return Number(itemId) === item.spreadsheet_id;
      if ("widget_id" in item) return Number(itemId) === item.widget_id;
      if ("block_id" in item) return Number(itemId) === item.block_id;
      if ("lens_id" in item) return Number(itemId) === item.lens_id;
    })

    const now = Date.now();
    if ($lastClick.current && (now - $lastClick.current) < 300) {
      const ifClickable = checkIfClickable(itemType, itemId, item);
      if (ifClickable) onDoubleClick(itemType, itemId)
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
  }, [items])

  const onWidthChange = (width: number, margin: [number, number], cols: number) => {
    const breakpoint = Object.entries(breakpoints).find(([key, value]) => value <= width + margin.reduce((a, b) => a + b, 0) + cols);
    if (breakpoint === undefined) return;
    setBreakpoint(breakpoint[0])
  }

  const sortedItems = useSort<IconViewItemType>({ sortingOptions, items });

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
      // whiteboard item
      key = `wb_${item.whiteboard_id}`;
      item_id = item.whiteboard_id;
      let icon = <fileTypeIcons.whiteboard />;
      if ((item.plugin as any)?.name && `plugin_${(item.plugin as any)?.name}` in fileTypeIcons) {
        const whiteboardPluginName = `plugin_${(item.plugin as any)?.name}`;
        const fileTypeIcon = fileTypeIcons[whiteboardPluginName];
        icon = fileTypeIcon({})
      }
      if (itemIcons && itemIcons[item_id]) icon = fileTypeIcons[itemIcons[item_id]]({});
      content = <WhiteboardIconItem
        handleWhiteboardDelete={handleWhiteboardDelete}
        handleWhiteboardChangeName={handleWhiteboardChangeName}
        handleItemSettings={handleItemSettings}
        selected={selectedItems.includes(item_id)}
        unselectBlocks={() => setSelectedItems([])}
        icon={icon} whiteboard={item} />

    } else if ("block_id" in item) {
      // block item
      key = `bl_${item.block_id}`;
      item_id = item.block_id;

      let icon = <fileTypeIcons.note />;
      if (item.block_type in fileTypeIcons) {
        const fileTypeIcon = fileTypeIcons[item.block_type];
        icon = fileTypeIcon({})
      }
      content = <BlockIconItem
        selected={selectedItems.includes(item_id)}
        handleBlockChangeName={handleBlockChangeName}
        handleBlockDelete={handleBlockDelete}
        unselectBlocks={() => setSelectedItems([])}
        icon={icon} block={item} />

    } else if ("spreadsheet_id" in item) {
      // spreadsheet item
      key = `sp_${item.spreadsheet_id}`;
      item_id = item.spreadsheet_id
      let icon = <fileTypeIcons.spreadsheet />;
      if ((item.plugin as any)?.name && `plugin_${(item.plugin as any)?.name}` in fileTypeIcons) {
        const spreadsheetPluginName = `plugin_${(item.plugin as any)?.name}`;
        const fileTypeIcon = fileTypeIcons[spreadsheetPluginName];
        icon = fileTypeIcon({})
      }
      content = <SpreadsheetIconItem
        selected={selectedItems.includes(item_id)}
        handleSpreadsheetChangeName={handleSpreadsheetChangeName}
        handleSpreadsheetDelete={handleSpreadsheetDelete}
        unselectBlocks={() => setSelectedItems([])}
        icon={icon}
        spreadsheet={item} />
    } else if ("widget_id" in item) {
      // widget item
      key = `wd_${item.widget_id}`;
      item_id = item.widget_id;
      let icon = <fileTypeIcons.plugin_default />;
      // if ((item.plugin as any)?.name && `plugin_${(item.plugin as any)?.name}` in fileTypeIcons) {
      //   const spreadsheetPluginName = `plugin_${(item.plugin as any)?.name}`;
      //   const fileTypeIcon = fileTypeIcons[spreadsheetPluginName];
      //   icon = fileTypeIcon({})
      // }
      content = <WidgetIconItem
        selected={selectedItems.includes(item_id)}
        handleWidgetChangeName={handleWidgetChangeName}
        handleWidgetDelete={handleWidgetDelete}
        unselectBlocks={() => setSelectedItems([])}
        icon={icon}
        widget={item} />

    } else {
      // subspace item
      key = `ss_${item.lens_id}`;
      item_id = item.lens_id;
      content = <SubspaceIconItem
        selected={selectedItems.includes(item_id)}
        unselectBlocks={() => setSelectedItems([])}
        handleLensDelete={handleLensDelete}
        handleLensChangeName={handleLensChangeName}
        icon={
          item.shared
            ? <fileTypeIcons.shared_subspace color="#fd7e14" />
            : <fileTypeIcons.subspace color="#fd7e14" />
        } subspace={item} />
    }

    return <div key={key} data-grid={dataGrid}
      onMouseEnter={() => onHoverItem(key.split("_")[0] as IconViewItemChars, item_id)}
      className={`block-item ${selectedItems.includes(item_id) ? "bg-gray-100" : ""}`}>
      {content}
    </div>
  }), [subspaces, widgets, breakpoint, blocks, whiteboards, spreadsheets, layouts, cols, selectedItems, sortedItems, sortingOptions, zoomLevel, itemIcons])

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
      $mounted.current = true;

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

  const onLayoutChange = useCallback((layout: Layout[], newLayouts: Layouts) => {
    if(!$mounted.current) return;

    if (sortingOptions.sortBy !== null) return;
    onChangeLayout("icon_layout", newLayouts)
  }, [sortingOptions]);

  const ROW_HEIGHT = 100;

  useEffect(() => {
    if (layoutRefs.navbar.current) {
      $gridContainer.current.style.height = `${getInnerHeight(layoutRefs.navbar.current) - 60}px`
    }
  }, [layoutRefs.navbar])

  return <div ref={$gridContainer}>
    <ResponsiveReactGridLayout
      layouts={layouts}
      cols={cols}
      breakpoint={breakpoint}
      style={{
        transform: `scale(${zoomLevel / 100}) translateZ(0)`,
        transformOrigin: 'top left'
      }}
      breakpoints={breakpoints}
      rowHeight={ROW_HEIGHT}
      onLayoutChange={onLayoutChange}
      isResizable={false}
      onWidthChange={onWidthChange}
      onDragStart={onDragStart}
      onDrag={onDrag}
      onDragStop={onDragStop}
      preventCollision={true}
      verticalCompact={false}
      transformScale={zoomLevel / 100}>
      {layoutItems}
    </ResponsiveReactGridLayout>
  </div>
}