import { useState, useMemo, useRef, useCallback, useEffect } from "react";
import { Block } from "app/_types/block";

import { Layout, Layouts } from "react-grid-layout";

import { ItemCallback, Responsive, WidthProvider } from "react-grid-layout";
import 'react-grid-layout/css/styles.css';
import { LensLayout, Subspace, Lens } from "app/_types/lens";
import { useAppContext } from "@contexts/context";
import { useDebouncedCallback } from "@utils/hooks";

import { Tables } from "app/_types/supabase";
import { Breadcrumb } from "../Breadcrumb";
import { WhiteboardPluginParams } from "app/_types/whiteboard";

import {
  BlockIconItem,
  SubspaceIconItem,
  WhiteboardIconItem,
  SpreadsheetIconItem
} from "./_views/index";

import { ViewController } from "../LayoutController";
import fileTypeIcons from "./_icons/index";
import { SpreadsheetPluginParams } from "app/_types/spreadsheet";
import { useProgressRouter } from "@utils/nprogress";

const ResponsiveReactGridLayout = WidthProvider(Responsive);

interface IconLayoutComponentProps extends ViewController {
  layouts: LensLayout["icon_layout"]
}

type IconViewItemType = Block | Subspace | Lens
  | Tables<"whiteboard"> & {
    plugin?: WhiteboardPluginParams
  }
  | Tables<"spreadsheet"> & {
    plugin?: SpreadsheetPluginParams
  };

type IconViewItemChars = "bl" | "ss" | "wb" | "sp";

export default function IconLayoutComponent({
  blocks,
  subspaces,
  whiteboards,
  spreadsheets,
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
  handleItemSettings
}: IconLayoutComponentProps) {
  const router = useProgressRouter();
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

  const cols = useMemo(() => ({ xlg: 12, lg: 12, md: 8, sm: 6, xs: 4, xxs: 3, xxxs: 1 }), []);
  const breakpoints = useMemo(() => ({ xlg: 1200, lg: 996, md: 768, sm: 576, xs: 480, xxs: 240, xxxs: 120 }), []);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);

  const [breadcrumbLoading, setBreadcrumbLoading] = useState(true);
  const [breadcrumbData, setBreadcrumbData] = useState<{ lens_id: number, name: string }[]>(null);

  const items: IconViewItemType[] = useMemo(() => [].concat(blocks, subspaces, whiteboards, spreadsheets),
    [blocks, subspaces, whiteboards, spreadsheets])

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
        if ("block_id" in item) return selectedItems[0] === item.block_id;
        if ("spreadsheet_id" in item) return selectedItems[0] === item.spreadsheet_id;
        if ("lens_id" in item) return selectedItems[0] === item.lens_id;
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

  const onDoubleClick = (itemType: IconViewItemChars, itemId: number) => {
    if (itemType === "bl") return router.push(`/block/${itemId}`);

    if (itemType === "wb") return router.push(`/whiteboard/${itemId}`);

    if (itemType === "ss") {
      if (window.location.pathname === "/") return router.push(`/lens/${itemId}`);
      return router.push(`${window.location.pathname}/${itemId}`);
    }

    if (itemType === "sp") return router.push(`/spreadsheet/${itemId}`);
  }

  const onHoverItem = (itemType: IconViewItemChars, itemId: number) => {
    if (itemType === "bl") return router.prefetch(`/block/${itemId}`);
    if (itemType === "wb") return router.prefetch(`/whiteboard/${itemId}`);
    if (itemType === "ss") {
      if (window.location.pathname === "/") return router.prefetch(`/lens/${itemId}`);
      return router.prefetch(`${window.location.pathname}/${itemId}`);
    }
    if (itemType === "sp") return router.prefetch(`/spreadsheet/${itemId}`);
  }

  const checkIfClickable = (itemType: IconViewItemChars, itemId: number, item: IconViewItemType) => {
    if ("whiteboard_id" in item && item?.plugin && item?.plugin?.state?.status !== "success") {
      return false;
    }

    return true;
  }

  const calculateDoubleClick: ItemCallback = useCallback((layout, oldItem, newItem, placeholder, event, element) => {
    const [itemType, itemId] = newItem.i.split("_") as [IconViewItemChars, number];

    const item = items.find(item => {
      if ("whiteboard_id" in item) return Number(itemId) === item.whiteboard_id;
      if ("spreadsheet_id" in item) return Number(itemId) === item.spreadsheet_id;
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

  }, [items, sortingOptions]);

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
          (item.access_type === "owner" || !item?.access_type)
            ? <fileTypeIcons.subspace color="#fd7e14" />
            : <fileTypeIcons.shared_subspace color="#fd7e14" />
        } subspace={item} />
    }

    return <div key={key} data-grid={dataGrid}
      onMouseEnter={() => onHoverItem(key.split("_")[0] as IconViewItemChars, item_id)}
      className={`block-item ${selectedItems.includes(item_id) ? "bg-gray-100" : ""}`}>
      {content}
    </div>
  }), [subspaces, breakpoint, blocks, whiteboards, spreadsheets, layouts, cols, selectedItems, sortedItems, sortingOptions, zoomLevel, itemIcons])

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