"use client";
import { notFound } from "next/navigation";
import { Lens } from "app/_types/lens";
import { useState, useEffect, useMemo, useCallback } from "react";
import load from "@lib/load";
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Flex, Box } from "@mantine/core";

import SpaceHeader from "@components/SpaceHeader";
import LoadingSkeleton from "@components/LoadingSkeleton";
import LayoutController from 'app/_components/LayoutController';
import { LensLayout } from "app/_types/lens";
import { useAppContext } from "@contexts/context";
import { getLayoutViewFromLocalStorage, setLayoutViewToLocalStorage } from "@utils/localStorage";

import { Database } from "app/_types/supabase";
import FinishedOnboardingPopover from "@components/Onboarding/FinishedOnboardingPopover";
const supabase = createClientComponentClient<Database>()

export default function Home() {

  const [lenses, setLenses] = useState<(Lens)[]>([]);
  const [loading, setLoading] = useState(true);
  const [layoutData, setLayoutData] = useState<LensLayout>({})
  const defaultSelectedLayoutType = getLayoutViewFromLocalStorage("default_layout") || "block";
  const [selectedLayoutType, setSelectedLayoutType] = useState<"block" | "icon">(defaultSelectedLayoutType);

  const { lensId, sortingOptions, setLensId, user } = useAppContext();

  const getLenses = async () => {
    return fetch(`/api/lens/getAll`)
      .then((response) => response.json())
      .then((data) => {
        setLenses(data.data);
      })
      .catch((error) => {
        console.error("Error fetching lens:", error);
        notFound();
      }).finally(() => {
        setLoading(false);
      })
  }

  useEffect(() => {
    setLensId(null)
    getLenses();
  }, []);

  const onChangeLensLayout = async (layoutName: keyof LensLayout, layoutData: LensLayout[keyof LensLayout]) => {
    // saveLayoutToSupabase(layoutName, layoutData)
    setLayoutData(prevLayout => ({
      ...prevLayout,
      [layoutName]: layoutData
    }))
  };

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

  const handleChangeLayoutView = (newLayoutView: "block" | "icon") => {
    setLayoutViewToLocalStorage("default_layout", newLayoutView)
    setSelectedLayoutType(newLayoutView)
  }

  const addSubspaces = useCallback((payload) => {
    let lens_id = payload["new"]["lens_id"]
    console.log("Added a subspace", lens_id)
    let newSubspace = payload["new"]
    if (!lenses.some(item => item.lens_id === lens_id)) {
      setLenses(prevSubspaces => [newSubspace, ...prevSubspaces]);
    }
  }, [lenses]);

  const deleteSubspace = useCallback((payload) => {
    let lens_id = payload["old"]["lens_id"]
    console.log("Deleting lens", payload);
    setLenses((prevSubspaces) => prevSubspaces.filter((subspace) => subspace.lens_id !== lens_id))
  }, []);

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

  useEffect(() => {
    if (!getLayoutViewFromLocalStorage("default_layout")) {
      setLayoutViewToLocalStorage("default_layout", "block")
    }

    const channel = supabase.channel('schema_changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'lens', filter: `parent_id=eq.${-1}` }, addSubspaces)
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'lens', filter: `parent_id=eq.${-1}` }, deleteSubspace)
      .subscribe();

    return () => {
      console.log("Unsubscribing from lens changes")
      if (channel) {
        channel.unsubscribe();
      }
    }
  }, [])

  const sortedLenses = useMemo(() => {
    if (sortingOptions.sortBy === null) return lenses;

    let _sorted_lenses = [...lenses].sort((a, b) => {
      if (sortingOptions.sortBy === "name") {
        return a.name.localeCompare(b.name);
      } else if (sortingOptions.sortBy === "createdAt") {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      } else if (sortingOptions.sortBy === "updatedAt") {
        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      }
    });

    if (sortingOptions.order === "desc") {
      _sorted_lenses = _sorted_lenses.reverse();
    }

    return _sorted_lenses;
  }, [sortingOptions, lenses]);

  return (
    <Flex direction="column" pt={0} h="100%">
      <SpaceHeader
        staticZoomLevel={false}
        title="Home"
        selectedLayoutType={selectedLayoutType}
        handleChangeLayoutView={handleChangeLayoutView}
      />
      <Box className="flex items-stretch flex-col h-full">
        {loading && <div className="p-3">
          <LoadingSkeleton boxCount={10} lineHeight={80} m={0} />
        </div>}
        <LayoutController
          itemIcons={{}}
          subspaces={sortedLenses}
          layout={layoutData}
          layoutView={selectedLayoutType}
          handleBlockChangeName={handleBlockChangeName}
          handleBlockDelete={handleBlockDelete}
          handleLensDelete={handleLensDelete}
          handleLensChangeName={handleLensChangeName}
          onChangeLayout={onChangeLensLayout}
        />
      </Box>
      <FinishedOnboardingPopover />
    </Flex >
  );
}