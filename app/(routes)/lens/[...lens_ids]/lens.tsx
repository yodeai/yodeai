"use client";

import { Block } from "app/_types/block";
import { useState, useEffect, ChangeEvent, useCallback, useMemo } from "react";
import { Lens, LensLayout, Subspace, Whiteboard } from "app/_types/lens";
import load from "@lib/load";
import LoadingSkeleton from '@components/LoadingSkeleton';
import DynamicSpaceHeader from '@components/DynamicSpaceHeader';
import { User, createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter, useSearchParams } from "next/navigation";
import { useAppContext } from "@contexts/context";
import LayoutController from "@components/LayoutController";
import toast from "react-hot-toast";
import { Box, Flex } from "@mantine/core";

type LensProps = {
  lens_id: number;
  lensData: Lens;
  user: User
}

import { useDebouncedCallback } from "@utils/hooks";
import { getLayoutViewFromLocalStorage, setLayoutViewToLocalStorage } from "@utils/localStorage";
import { getUserInfo } from "@utils/googleUtils";
import { Database, Tables } from "app/_types/supabase";

export default function Lens(props: LensProps) {
  const { lens_id, user, lensData } = props;
  const [loading, setLoading] = useState(true);

  const [lens, setLens] = useState<Lens | null>(lensData);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [subspaces, setSubspaces] = useState<Subspace[]>([]);
  const [whiteboards, setWhiteboards] = useState<Tables<"whiteboard">[]>([]);
  const [layoutData, setLayoutData] = useState<LensLayout>({})

  const [editingLensName, setEditingLensName] = useState("");
  const [isEditingLensName, setIsEditingLensName] = useState(false);
  const defaultSelectedLayoutType = getLayoutViewFromLocalStorage("default_layout") || "block";
  const [selectedLayoutType, setSelectedLayoutType] = useState<"block" | "icon">(defaultSelectedLayoutType);

  const router = useRouter();
  const {
    setLensId, lensName, setLensName,
    reloadLenses, setActiveComponent,
    accessType, setAccessType, sortingOptions
  } = useAppContext();
  const searchParams = useSearchParams();
  const supabase = createClientComponentClient<Database>()

  useEffect(() => {
    setEditingLensName(lensName);
  }, [lensName]);

  useEffect(() => {
    if (!getLayoutViewFromLocalStorage("default_layout")) {
      setLayoutViewToLocalStorage("default_layout", "block")
    }

  }, [])

  useEffect(() => {
    (async () => {
      setLoading(true);
      await Promise.all([
        getLensBlocks(lens_id),
        getLensSubspaces(lens_id),
        getLensWhiteboards(lens_id),
        getLensLayout(lens_id)
      ])
        .then(() => {
          setLoading(false);
        })
        .catch((error) => {
          console.error('Error fetching lens data:', error);
        })
    })();

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

  const getLensSubspaces = async (lensId: number) => {
    return fetch(`/api/lens/${lensId}/getSubspaces`)
      .then((response) => response.json())
      .then((data) => {
        setSubspaces(data?.data);
      })
      .catch((error) => {
        console.error('Error fetching subspaces:', error);
      })
  }

  const getLensWhiteboards = async (lensId: number) => {
    return fetch(`/api/lens/${lensId}/getWhiteboards`)
      .then((response) => response.json())
      .then((data) => {
        setWhiteboards(data?.data);
      })
      .catch((error) => {
        console.error('Error fetching whiteboards:', error);
      })
  }

  const getLensBlocks = async (lensId: number) => {
    let googleUserId = await getUserInfo();
    return fetch(`/api/lens/${lensId}/getBlocks/${googleUserId}`)
      .then((response) => response.json())
      .then((data) => {
        setBlocks(data.data);
      })
      .catch((error) => {
        console.error('Error fetching blocks:', error);
      })
  }

  const getLensLayout = async (lensId: number) => {
    return fetch(`/api/lens/${lensId}/layout`, { method: "GET" })
      .then(response => {
        if (!response.ok) {
          console.log('No default layout found, using default.');
          return;
        } else {
          return response.json();
        }
      }).then(res => {
        setLayoutData({
          block_layout: res?.data?.block_layout,
          icon_layout: res?.data?.icon_layout,
          list_layout: res?.data?.list_layout
        })
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
      loading: "Updating block name...",
      success: "Block name updated!",
      error: "Failed to update block name.",
    });
  }

  const handleBlockDelete = (block_id: number) => {
    const deletePromise = fetch(`/api/block/${block_id}`, {
      method: "DELETE"
    });
    return load(deletePromise, {
      loading: "Deleting block...",
      success: "Block deleted!",
      error: "Failed to delete block.",
    });
  }

  const handleLensDelete = async (lens_id: number) => {
    const deletePromise = fetch(`/api/lens/${lens_id}`, { method: "DELETE" });
    return load(deletePromise, {
      loading: "Deleting lens...",
      success: "Lens deleted!",
      error: "Failed to delete lens.",
    });
  }

  const handleLensChangeName = async (lens_id: number, newLensName: string) => {
    const updatePromise = fetch(`/api/lens/${lens_id}`, {
      method: "PUT",
      body: JSON.stringify({ name: newLensName }),
    });

    return load<Response>(updatePromise, {
      loading: "Updating lens name...",
      success: "Lens name updated!",
      error: "Failed to update lens name.",
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

  if (!lens && !loading) {
    return (
      <div className="flex flex-col p-4 flex-grow">
        <p>Error fetching space data.</p>
      </div>
    );
  }

  const sortedSubspaces = useMemo(() => {
    if (sortingOptions.sortBy === null) return subspaces;

    let _sorted_subspaces = [...subspaces].sort((a, b) => {
      if (sortingOptions.sortBy === "name") {
        return a.name.localeCompare(b.name);
      } else if (sortingOptions.sortBy === "createdAt") {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      } else if (sortingOptions.sortBy === "updatedAt") {
        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      }
    })

    if (sortingOptions.order === "desc") {
      return _sorted_subspaces.reverse();
    }

    return _sorted_subspaces;
  }, [sortingOptions, subspaces])

  const sortedBlocks = useMemo(() => {
    if (sortingOptions.sortBy === null) return blocks;

    let _sorted_blocks = [...blocks].sort((a, b) => {
      if (sortingOptions.sortBy === "name") {
        return a.title.localeCompare(b.title);
      } else if (sortingOptions.sortBy === "createdAt") {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      } else if (sortingOptions.sortBy === "updatedAt") {
        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      }
    })

    if (sortingOptions.order === "desc") {
      return _sorted_blocks.reverse();
    }

    return _sorted_blocks;
  }, [sortingOptions, blocks])

  const sortedWhiteboards = useMemo(() => {
    if (sortingOptions.sortBy === null) return whiteboards;

    let _sorted_whiteboards = [...whiteboards].sort((a, b) => {
      if (sortingOptions.sortBy === "name") {
        return a.name.localeCompare(b.name);
      } else if (sortingOptions.sortBy === "createdAt") {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      } else if (sortingOptions.sortBy === "updatedAt") {
        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      }
    })

    if (sortingOptions.order === "desc") {
      return _sorted_whiteboards.reverse();
    }

    return _sorted_whiteboards;
  }, [sortingOptions, whiteboards])

  return (
    <Flex direction="column" pt={0} h="100%">
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
      <Box className="flex items-stretch flex-col h-full">
        {loading && <LoadingSkeleton boxCount={8} lineHeight={80} m={10} />}
        {!loading && <LayoutController
          handleBlockChangeName={handleBlockChangeName}
          handleBlockDelete={handleBlockDelete}
          handleLensChangeName={handleLensChangeName}
          handleLensDelete={handleLensDelete}
          handleWhiteboardDelete={handleWhiteboardDelete}
          handleWhiteboardChangeName={handleWhiteboardChangeName}
          onChangeLayout={onChangeLensLayout}
          layout={layoutData}
          blocks={sortedBlocks}
          subspaces={sortedSubspaces}
          whiteboards={sortedWhiteboards}
          layoutView={selectedLayoutType} />}
      </Box>
    </Flex >
  );
}