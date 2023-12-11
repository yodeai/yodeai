"use client";
import { notFound } from "next/navigation";
import { Block } from "app/_types/block";
import { Lens, Subspace } from "app/_types/lens";
import { useState, useEffect } from "react";
import load from "@lib/load";
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import SpaceHeader from "@components/SpaceHeader";
import LensComponent from "@components/LensComponent";
import { Flex, Text, Divider, Box } from "@mantine/core";
import LoadingSkeleton from "@components/LoadingSkeleton";
import LayoutController from '../_components/LayoutController';
import { LensLayout } from "app/_types/lens";
import { RealtimeChannel } from "@supabase/supabase-js";

function getLayoutViewFromLocalStorage(lens_id: string): "block" | "icon" {
  let layout = null;
  if (global.localStorage) {
    try {
      layout = JSON.parse(global.localStorage.getItem("layoutView")) || null;
    } catch (e) {
      /*Ignore*/
    }
  }
  return layout ? layout[lens_id] : null;
}

function setLayoutViewToLocalStorage(lens_id: string, value: "block" | "icon") {
  if (global.localStorage) {
    const layout = JSON.parse(global.localStorage.getItem("layoutView") || "{}");
    global.localStorage.setItem(
      "layoutView",
      JSON.stringify({
        ...layout,
        [lens_id]: value
      })
    );
  }
}

export default function Home() {
  const supabase = createClientComponentClient()

  const [lenses, setLenses] = useState<(Lens)[]>([]);
  const [loading, setLoading] = useState(true);
  const [layoutData, setLayoutData] = useState<LensLayout>({})
  const defaultSelectedLayoutType = getLayoutViewFromLocalStorage("default_layout") || "block";
  const [selectedLayoutType, setSelectedLayoutType] = useState<"block" | "icon">(defaultSelectedLayoutType);

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

  const handleChangeLayoutView = (newLayoutView: "block" | "icon") => {
    setLayoutViewToLocalStorage("default_layout", newLayoutView)
    setSelectedLayoutType(newLayoutView)
  }

  useEffect(() => {
    if (!getLayoutViewFromLocalStorage("default_layout")) {
      setLayoutViewToLocalStorage("default_layout", "block")
    }

    console.log("Subscribing to lens changes")
    let channel: RealtimeChannel;
    (async () => {
      const user_id = (await supabase.auth?.getUser())?.data?.user?.id;
      if (!user_id) return;

      channel = supabase
        .channel('schema-db-changes')
        .on('postgres_changes', {
          event: 'INSERT', schema: 'public', table: 'lens_users',
          filter: `user_id=eq.${user_id}`
        }, getLenses)
        .subscribe();
    })();

    return () => {
      console.log("Unsubscribing from lens changes")
      channel.unsubscribe();
    }

  }, [])

  return (
    <Flex direction="column" pt={0} h="100%">
      <SpaceHeader
        title="Home"
        selectedLayoutType={selectedLayoutType}
        handleChangeLayoutView={handleChangeLayoutView}
      />
      <Box className="flex p-2 items-stretch flex-col h-full">
        {loading && <LoadingSkeleton boxCount={10} lineHeight={80} m={0} />}
        <LayoutController
          blocks={[]}
          subspaces={lenses}
          layout={layoutData}
          layoutView={selectedLayoutType}
          lens_id={"-1"}
          handleBlockChangeName={handleBlockChangeName}
          handleBlockDelete={handleBlockDelete}
          onChangeLayout={onChangeLensLayout}
        />
      </Box>
    </Flex >
  );
}