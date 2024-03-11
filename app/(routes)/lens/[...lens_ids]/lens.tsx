"use client";

import { Block } from "app/_types/block";
import { useState, useEffect, ChangeEvent, useCallback, useMemo, useRef } from "react";
import { Lens, LensData, LensLayout, Subspace } from "app/_types/lens";
import load from "@lib/load";
import LoadingSkeleton from '@components/LoadingSkeleton';
import DynamicSpaceHeader from '@components/Layout/Headers/DynamicSpaceHeader';
import { User, createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter, useSearchParams } from "next/navigation";
import { useAppContext } from "@contexts/context";
import LayoutController from "@components/Layout/LayoutController";
import toast from "react-hot-toast";
import { AppShell, Box, Flex, ScrollArea } from "@mantine/core";
import IconItemSettingsModal from "@components/IconView/IconSettingsModal";

export type LensProps = {
  lens_id: number;
  lensData: LensData;
  user: User
}

import { useDebouncedCallback } from "@utils/hooks";
import { getLayoutViewFromLocalStorage, setLayoutViewToLocalStorage } from "@utils/localStorage";
import { Database, Tables } from "app/_types/supabase";
import { ContentProvider } from "@contexts/content";

export default function Lens(props: LensProps) {
  const { lens_id, user, lensData } = props;
  const [loading, setLoading] = useState(false);

  const [lens, setLens] = useState<Lens>(lensData);

  const [blocks, setBlocks] = useState<Block[]>(lensData.blocks);
  const [subspaces, setSubspaces] = useState<Subspace[]>(lensData.subspaces);
  const [whiteboards, setWhiteboards] = useState<Tables<"whiteboard">[]>(lensData.whiteboards);
  const [spreadsheets, setSpreadsheets] = useState<Tables<"spreadsheet">[]>(lensData.spreadsheets);
  const [widgets, setWidgets] = useState<Tables<"widget">[]>(lensData.widgets);
  const [layoutData, setLayoutData] = useState<LensLayout>(lensData.layout)

  const [itemIcons, setItemIcons] = useState<Lens["item_icons"]>({});

  const [editingLensName, setEditingLensName] = useState("");
  const [isEditingLensName, setIsEditingLensName] = useState(false);
  const defaultSelectedLayoutType = getLayoutViewFromLocalStorage("default_layout") || "icon";
  const [selectedLayoutType, setSelectedLayoutType] = useState<"block" | "icon">(defaultSelectedLayoutType);

  const $settingsItem = useRef<
    Lens | Subspace | Tables<"block"> | Tables<"whiteboard">
  >(null);

  const router = useRouter();
  const {
    setLensId, lensName, setLensName,
    reloadLenses, setActiveComponent,
    accessType, setAccessType, sortingOptions,
    iconItemDisclosure
  } = useAppContext();
  const searchParams = useSearchParams();
  const supabase = createClientComponentClient<Database>()

  useEffect(() => {
    setEditingLensName(lensName);
  }, [lensName]);

  useEffect(() => {
    if (!getLayoutViewFromLocalStorage("default_layout")) {
      setLayoutViewToLocalStorage("default_layout", "icon")
    }
  }, [])

  useEffect(() => {
    // (async () => {
    //   setLoading(true);
    //   await Promise.all([
    //     // getLensBlocks(lens_id),
    //     // getLensSubspaces(lens_id),
    //     // getLensWhiteboards(lens_id),
    //     // getLensWidgets(lens_id),
    //     // getLensLayout(lens_id),
    //     // getLensSpreadsheets(lens_id)
    //   ])
    //     .then(() => {
    //       setLoading(false);
    //     })
    //     .catch((error) => {
    //       console.error('Error fetching lens data:', error);
    //     })
    // })();

    if (window.location.hash === "#newLens") {
      setIsEditingLensName(true);
      window.location.hash = "";
    }
  }, [lens_id, searchParams]);

  useEffect(() => {
    setLensName(lensData.name);
    setAccessType(lensData.user_to_access_type[user.id]);
    setLensId(String(lensData.lens_id));
  }, [lensData])

  const getLensData = async (lensId: number) => {
    return fetch(`/api/lens/${lensId}`)
      .then((response) => {
        if (!response.ok) {
          console.log('Error fetching lens');
          router.push('/notFound');
        } else {
          return response.json();
        }
      })
      .then(async (data) => {
        console.log({
          user_to_access_type: data.data.user_to_access_type,
          user_id: user.id
        })
        setLens(data.data);
        setLensName(data.data.name);
        setAccessType(data.data.user_to_access_type[user.id]);
        setLensId(data.data.lens_id);
      })
      .catch((error) => {
        console.error('Error fetching lens:', error);
      })
  }

  const saveLayoutToSupabase = useDebouncedCallback(async (layoutName: keyof LensLayout, layouts: LensLayout[keyof LensLayout]) => {
    return fetch(`/api/lens/${lens_id}/layout`, {
      method: "POST",
      body: JSON.stringify({
        layoutValue: layouts,
        layoutName: "icon_layout"
      })
    }).then(res => res.json()).then(res => {
      if (res.data) {
        console.log("Saved layout to supabase.")
      }
    }).catch(err => {
      console.log("Error saving layout to supabase:", err.message)
    })
  }, 1000);

  const onChangeLensLayout = async (layoutName: keyof LensLayout, layoutData: LensLayout[keyof LensLayout]) => {
    saveLayoutToSupabase(layoutName, layoutData)
    setLayoutData(prevLayout => ({
      ...prevLayout,
      [layoutName]: layoutData
    }))
  };

  // memoized realtime callback functions in order to prevent channel subscription from being called multiple times
  const updateBlocks = useCallback((payload) => {
    let block_id = payload["new"]["block_id"]
    setBlocks(prevBlocks =>
      prevBlocks.map(item => {
        if (item.block_id === block_id) {
          return { ...payload['new'], inLenses: item.inLenses, lens_blocks: item.lens_blocks };
        }
        return item;
      })
    );
  }, []);

  const addBlocks = useCallback((payload) => {
    let block_id = payload["new"]["block_id"]
    console.log("Added a block", block_id)
    let newBlock = payload["new"]
    if (!blocks.some(item => item.block_id === block_id)) {
      setBlocks(prevBlocks => [newBlock, ...prevBlocks]);
    }
  }, [blocks])

  const deleteBlocks = useCallback((payload) => {
    let block_id = payload["old"]["block_id"]
    console.log("Deleting block", block_id);
    setBlocks((prevBlocks) => prevBlocks.filter((block) => block.block_id !== block_id))
  }, [blocks]);

  const addSubspaces = useCallback((payload) => {
    let lens_id = payload["new"]["lens_id"]
    console.log("Added a subspace", lens_id)
    let newSubspace = payload["new"]
    if (!subspaces.some(item => item.lens_id === lens_id)) {
      setSubspaces(prevSubspaces => [newSubspace, ...prevSubspaces]);
    }
  }, [subspaces]);

  const deleteSubspace = useCallback((payload) => {
    let lens_id = payload["old"]["lens_id"]
    console.log("Deleting lens", payload);
    setSubspaces((prevSubspaces) => prevSubspaces.filter((subspace) => subspace.lens_id !== lens_id))
  }, []);

  const addWhiteBoard = useCallback((payload) => {
    let whiteboard_id = payload["new"]["whiteboard_id"]
    console.log("Added a whiteboard", whiteboard_id);
    let newWhiteboard = payload["new"]
    if (!whiteboards.some(item => item.whiteboard_id === whiteboard_id)) {
      setWhiteboards(prevWhiteboards => [newWhiteboard, ...prevWhiteboards]);
    }
  }, []);


  const deleteWhiteboard = useCallback((payload) => {
    let whiteboard_id = payload["old"]["whiteboard_id"]
    console.log("Deleting whiteboard", whiteboard_id);
    setWhiteboards((prevWhiteboards) => prevWhiteboards.filter((whiteboard) => whiteboard.whiteboard_id !== whiteboard_id))
  }, []);

  const updateWhiteboard = useCallback((payload) => {
    let whiteboard_id = payload["new"]["whiteboard_id"]
    console.log("Updating whiteboard", whiteboard_id);
    setWhiteboards(prevWhiteboards =>
      prevWhiteboards.map(item => {
        if (item.whiteboard_id === whiteboard_id) {
          return { ...payload['new'] };
        }
        return item;
      })
    );
  }, []);

  const addSpreadsheet = useCallback((payload) => {
    let spreadsheet_id = payload["new"]["spreadsheet_id"]
    console.log("Added a spreadsheet", spreadsheet_id);
    let newSpreadsheet = payload["new"]
    if (!spreadsheets.some(item => item.spreadsheet_id === spreadsheet_id)) {
      setSpreadsheets(prevSpreadsheets => [newSpreadsheet, ...prevSpreadsheets]);
    }
  }, []);

  const deleteSpreadsheet = useCallback((payload) => {
    let spreadsheet_id = payload["old"]["spreadsheet_id"]
    console.log("Deleting spreadsheet", spreadsheet_id);
    setSpreadsheets((prevSpreadsheets) => prevSpreadsheets.filter((spreadsheet) => spreadsheet.spreadsheet_id !== spreadsheet_id))
  }, []);

  const updateSpreadsheet = useCallback((payload) => {
    let spreadsheet_id = payload["new"]["spreadsheet_id"]
    console.log("Updating spreadsheet", spreadsheet_id);
    setSpreadsheets(prevSpreadsheets =>
      prevSpreadsheets.map(item => {
        if (item.spreadsheet_id === spreadsheet_id) {
          return { ...payload['new'] };
        }
        return item;
      })
    );
  }, []);

  const addWidget = useCallback((payload) => {
    let widget_id = payload["new"]["widget_id"]
    console.log("Added a widget", widget_id);
    let newWidget = payload["new"]
    if (!widgets.some(item => item.widget_id === widget_id)) {
      setWidgets(prevWidgets => [newWidget, ...prevWidgets]);
    }
  }, []);

  const deleteWidget = useCallback((payload) => {
    let widget_id = payload["old"]["widget_id"]
    console.log("Deleting widget", widget_id);
    setWidgets((prevWidgets) => prevWidgets.filter((widget) => widget.widget_id !== widget_id))
  }, []);

  const updateWidget = useCallback((payload) => {
    let widget_id = payload["new"]["widget_id"]
    console.log("Updating widget", widget_id);
    setWidgets(prevWidgets =>
      prevWidgets.map(item => {
        if (item.widget_id === widget_id) {
          return { ...payload['new'] };
        }
        return item;
      })
    );
  }, []);

  const updateLensLayout = useCallback((payload) => {
    console.log(payload)
    setItemIcons(payload["new"]?.item_icons || {});
  }, []);


  useEffect(() => {
    console.log("Subscribing to lens changes...", { lens_id })
    const channel = supabase
      .channel('schema-db-changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'block' }, addBlocks)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'block' }, updateBlocks)
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'block' }, deleteBlocks)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'lens', filter: `parent_id=eq.${lens_id}` }, addSubspaces)
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'lens', filter: `parent_id=eq.${lens_id}` }, deleteSubspace)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'lens', filter: `lens_id=eq.${lens_id}` }, () => getLensData(lens_id))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'lens_published', filter: `lens_id=eq.${lens_id}` }, () => getLensData(lens_id))
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'whiteboard', filter: `lens_id=eq.${lens_id}` }, addWhiteBoard)
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'whiteboard', filter: `lens_id=eq.${lens_id}` }, deleteWhiteboard)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'whiteboard', filter: `lens_id=eq.${lens_id}`, }, updateWhiteboard)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'spreadsheet', filter: `lens_id=eq.${lens_id}` }, addSpreadsheet)
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'spreadsheet', filter: `lens_id=eq.${lens_id}` }, deleteSpreadsheet)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'spreadsheet', filter: `lens_id=eq.${lens_id}`, }, updateSpreadsheet)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'lens_layout', filter: `lens_id=eq.${lens_id}`, }, updateLensLayout)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'widget', filter: `lens_id=eq.${lens_id}` }, addWidget)
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'widget', filter: `lens_id=eq.${lens_id}` }, deleteWidget)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'widget', filter: `lens_id=eq.${lens_id}`, }, updateWidget)
      .subscribe();

    return () => {
      if (channel) {
        channel.unsubscribe();
        console.log("Unsubscribed from lens changes.")
      }
    };
  }, [lens_id]);

  const updateLensName = async (lens_id: number, newName: string) => {
    const updatePromise = fetch(`/api/lens/${lens_id}`, {
      method: "PUT",
      body: JSON.stringify({ name: newName }),
    });
    setLensName(newName); // Update the global context here
    return updatePromise;
  };

  const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    setEditingLensName(e.target.value);
  };

  const saveNewLensName = async () => {
    if (lens) {
      try {
        if (editingLensName === "") {
          throw new Error("Space title cannot be empty");
        }
        const updatePromise = updateLensName(lens.lens_id, editingLensName);
        await load(updatePromise, {
          loading: "Updating space name...",
          success: "Space name updated!",
          error: "Failed to update space name.",
        });
        setLens({ ...lens, name: editingLensName });
        setIsEditingLensName(false);  // Turn off edit mode after successful update
        reloadLenses();
        router.push(`/lens/${lens.lens_id}`);
        return true;
      } catch (error) {
        console.log("error", error.message)
        toast.error('Failed to update space name: ' + error.message);
        return false;
      }
    }
  };

  const handleKeyPress = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      saveNewLensName();
    }
  };

  const handleDeleteLens = async () => {
    try {
      const deleteResponse = await fetch(`/api/lens/${lens.lens_id}`, {
        method: "DELETE"
      });

      if (deleteResponse.ok) {
        setLensId(null);
        setLensName(null);
        setActiveComponent("global");
        reloadLenses();
        router.push("/");
      } else {
        console.error("Failed to delete lens");
      }
    } catch (error) {
      console.error("Error deleting lens:", error);
    }
  };

  const handleChangeLayoutView = (newLayoutView: "block" | "icon") => {
    setSelectedLayoutType(newLayoutView)
    setLayoutViewToLocalStorage("default_layout", newLayoutView)
  }

  // the following two functions are used under layout components
  // the functions return the load promise so that the layout components
  // can use the loading, success, error messages accordingly
  const handleBlockChangeName = async (block_id: number, newBlockName: string) => {
    const updatePromise = fetch(`/api/block/${block_id}`, {
      method: "PUT",
      body: JSON.stringify({ title: newBlockName }),
    });

    return load<Response>(updatePromise, {
      loading: "Updating page name...",
      success: "Page name updated!",
      error: "Failed to update page name.",
    });
  }

  const handleBlockDelete = (block_id: number) => {
    const deletePromise = fetch(`/api/block/${block_id}`, {
      method: "DELETE"
    });
    return load(deletePromise, {
      loading: "Deleting page...",
      success: "Page deleted!",
      error: "Failed to delete page.",
    });
  }

  const handleLensDelete = async (lens_id: number) => {
    const deletePromise = fetch(`/api/lens/${lens_id}`, { method: "DELETE" });
    return load(deletePromise, {
      loading: "Deleting space...",
      success: "Space deleted!",
      error: "Failed to delete space.",
    });
  }

  const handleLensChangeName = async (lens_id: number, newLensName: string) => {
    const updatePromise = fetch(`/api/lens/${lens_id}`, {
      method: "PUT",
      body: JSON.stringify({ name: newLensName }),
    });

    return load<Response>(updatePromise, {
      loading: "Updating space name...",
      success: "Space name updated!",
      error: "Failed to update space name.",
    });
  }

  const handleWhiteboardDelete = async (whiteboard_id: number) => {
    const deletePromise = fetch(`/api/whiteboard/${whiteboard_id}`, { method: "DELETE" });
    return load(deletePromise, {
      loading: "Deleting whiteboard...",
      success: "Whiteboard deleted!",
      error: "Failed to delete whiteboard.",
    });
  }

  const handleWhiteboardChangeName = async (whiteboard_id: number, newWhiteboardName: string) => {
    const updatePromise = fetch(`/api/whiteboard/${whiteboard_id}`, {
      method: "PUT",
      body: JSON.stringify({ name: newWhiteboardName }),
    });

    return load<Response>(updatePromise, {
      loading: "Updating whiteboard name...",
      success: "Whiteboard name updated!",
      error: "Failed to update whiteboard name.",
    });
  }

  const handleSpreadsheetChangeName = async (spreadsheet_id: number, newSpreadsheetName: string) => {
    const updatePromise = fetch(`/api/spreadsheet/${spreadsheet_id}`, {
      method: "PUT",
      body: JSON.stringify({ name: newSpreadsheetName }),
    });

    return load<Response>(updatePromise, {
      loading: "Updating spreadsheet name...",
      success: "Spreadsheet name updated!",
      error: "Failed to update spreadsheet name.",
    });
  }

  const handleSpreadsheetDelete = async (spreadsheet_id: number) => {
    const deletePromise = fetch(`/api/spreadsheet/${spreadsheet_id}`, { method: "DELETE" });
    return load(deletePromise, {
      loading: "Deleting spreadsheet...",
      success: "Spreadsheet deleted!",
      error: "Failed to delete spreadsheet.",
    });
  }

  const handleWidgetChangeName = async (widget_id: number, newWidgetName: string) => {
    const updatePromise = fetch(`/api/widget/${widget_id}`, {
      method: "PUT",
      body: JSON.stringify({ name: newWidgetName }),
    });

    return load<Response>(updatePromise, {
      loading: "Updating widget name...",
      success: "Widget name updated!",
      error: "Failed to update widget name.",
    });
  }

  const handleWidgetDelete = async (widget_id: number) => {
    const deletePromise = fetch(`/api/widget/${widget_id}`, { method: "DELETE" });

    return load(deletePromise, {
      loading: "Deleting widget...",
      success: "Widget deleted!",
      error: "Failed to delete widget.",
    });
  }

  const handleItemSettings = (item: Lens | Subspace | Tables<"block"> | Tables<"whiteboard">) => {
    $settingsItem.current = item;
    iconItemDisclosure[1].open();
  }

  if (!lens && !loading) {
    return (
      <div className="flex flex-col p-4 flex-grow">
        <p>Error fetching space data.</p>
      </div>
    );
  }

  const typeOrder = {
    "whiteboard": 1,
    "whiteboard_plugin": 2,
    "spreadsheet": 3,
    "spreadsheet_plugin": 4,
    "widget": 5,
    "lens": 6,
    "block": 7
  };

  const getType = (item: Tables<"block"> | Tables<"whiteboard"> | Tables<"spreadsheet"> | Tables<"widget"> | Lens | Subspace | Block) => {
    if ("widget_id" in item) {
      return "widget";
    } else if ("block_id" in item) {
      return "block";
    } else if ("whiteboard_id" in item) {
      if (item.plugin) return "whiteboard_plugin";
      return "whiteboard";
    } else if ("spreadsheet_id" in item) {
      if (item.plugin) return "spreadsheet_plugin";
      return "spreadsheet";
    } else {
      return "lens";
    }
  }

  type SortItems = Subspace | Block | Tables<"whiteboard"> | Tables<"spreadsheet"> | Tables<"widget">;

  const sortItems = function <T extends SortItems>
    (items: T[], sortBy: string | null, order: "asc" | "desc" | null = "asc") {
    if (sortBy === null) return items;

    let _sorted_items = [...items].sort((a, b) => {
      if (sortBy === "name") {
        if ("name" in a && "name" in b) {
          return a.name.localeCompare(b.name);
        }
        if ("title" in a && "title" in b) {
          return a.title.localeCompare(b.title)
        }
      } else if (sortBy === "createdAt") {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      } else if (sortBy === "updatedAt") {
        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      } else if (sortingOptions.sortBy === "type") {
        return typeOrder[getType(a)] - typeOrder[getType(b)];
      }
    })

    if (order === "desc") {
      return _sorted_items.reverse();
    }

    return _sorted_items;
  }

  const sortedSubspaces = useMemo(() => {
    return sortItems(subspaces, sortingOptions.sortBy, sortingOptions.order);
  }, [sortingOptions, subspaces])

  const sortedBlocks = useMemo(() => {
    return sortItems(blocks, sortingOptions.sortBy, sortingOptions.order);
  }, [sortingOptions, blocks])

  const sortedWhiteboards = useMemo(() => {
    return sortItems(whiteboards, sortingOptions.sortBy, sortingOptions.order);
  }, [sortingOptions, whiteboards])

  const sortedSpreadsheets = useMemo(() => {
    return sortItems(spreadsheets, sortingOptions.sortBy, sortingOptions.order);
  }, [sortingOptions, spreadsheets]);

  const sortedWidgets = useMemo(() => {
    return sortItems(widgets, sortingOptions.sortBy, sortingOptions.order);
  }, [sortingOptions, widgets]);

  return (
    <ContentProvider
      blocks={blocks}
      whiteboards={whiteboards}
      subspaces={subspaces}
      spreadsheets={spreadsheets}>
      <AppShell.Section>
        <DynamicSpaceHeader
          loading={loading}
          lens={lens}
          lensName={lensName}
          editingLensName={editingLensName}
          isEditingLensName={isEditingLensName}
          setIsEditingLensName={setIsEditingLensName}
          handleNameChange={handleNameChange}
          handleKeyPress={handleKeyPress}
          saveNewLensName={saveNewLensName}
          handleDeleteLens={handleDeleteLens}
          accessType={accessType}
          selectedLayoutType={selectedLayoutType}
          handleChangeLayoutView={handleChangeLayoutView}
        />
      </AppShell.Section>
      <AppShell.Section grow component={ScrollArea}>
        {loading && <LoadingSkeleton boxCount={8} lineHeight={80} m={10} />}
        {!loading && <LayoutController
          handleBlockChangeName={handleBlockChangeName}
          handleBlockDelete={handleBlockDelete}
          handleLensChangeName={handleLensChangeName}
          handleLensDelete={handleLensDelete}
          handleWhiteboardDelete={handleWhiteboardDelete}
          handleWhiteboardChangeName={handleWhiteboardChangeName}
          handleSpreadsheetChangeName={handleSpreadsheetChangeName}
          handleSpreadsheetDelete={handleSpreadsheetDelete}
          handleWidgetChangeName={handleWidgetChangeName}
          handleWidgetDelete={handleWidgetDelete}
          onChangeLayout={onChangeLensLayout}
          handleItemSettings={handleItemSettings}
          layout={layoutData}
          blocks={sortedBlocks}
          subspaces={sortedSubspaces}
          whiteboards={sortedWhiteboards}
          spreadsheets={sortedSpreadsheets}
          widgets={sortedWidgets}
          itemIcons={itemIcons}
          layoutView={selectedLayoutType} />}
      </AppShell.Section>
      <IconItemSettingsModal
        item_icons={itemIcons}
        item={$settingsItem.current}
        lens_id={lens_id}
        modalController={iconItemDisclosure} />
    </ContentProvider>
  );
}