"use client";

import Link from "next/link";
import { Block } from "app/_types/block";
import { useState, useEffect, ChangeEvent, useCallback } from "react";
import { Lens, LensLayout, Subspace } from "app/_types/lens";
import load from "@lib/load";
import LoadingSkeleton from '@components/LoadingSkeleton';
import SpaceHeader from '@components/SpaceHeader';
import { Pencil2Icon } from "@radix-ui/react-icons";
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter, useSearchParams } from "next/navigation";
import { useAppContext } from "@contexts/context";
import LayoutController from "@components/LayoutController";
import toast from "react-hot-toast";
import { Box, Flex } from "@mantine/core";

import InfoPopover from "@components/InfoPopover";
import QuestionAnswerForm from "@components/QuestionAnswerForm";
import useDebouncedCallback from "@utils/hooks";

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

export default function Lens({ params }) {
  const { lens_ids } = params;

  const [loading, setLoading] = useState(true);
  const [lens, setLens] = useState<Lens | null>(null);
  const [editingLensName, setEditingLensName] = useState("");
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [subspaces, setSubspaces] = useState<Subspace[]>([]);
  const [isEditingLensName, setIsEditingLensName] = useState(false);
  const [accessType, setAccessType] = useState(null);
  const [selectedLayoutType, setSelectedLayoutType] = useState<"block" | "icon">(getLayoutViewFromLocalStorage(params.lens_id));
  const [layoutData, setLayoutData] = useState<LensLayout>({})

  const router = useRouter();
  const { setLensId, lensName, setLensName, reloadLenses, setActiveComponent } = useAppContext();
  const searchParams = useSearchParams();
  const supabase = createClientComponentClient()
  async function isValidHierarchy(lensIds) {
    for (let index = 0; index < lensIds.length; index++) {
      const id = lensIds[index];
      const parentId = index === 0 ? -1 : lensIds[index - 1];

      const isChild = await isChildOf(id, parentId);

      if (!isChild) {
        console.log(`Invalid hierarchy at index ${index}`);
        return false;
      }
    }

    return true;
  }
  async function isChildOf(childId, parentId) {
    try {
      const { data: lensData, error } = await supabase
        .from('lens')
        .select('parent_id')
        .eq('lens_id', childId);

      if (error) {
        throw new Error(`Error fetching lens data: ${error.message}`);
      }

      const fetchedParentId = lensData[0]?.parent_id;
      return fetchedParentId == parentId;
    } catch (error) {
      console.error(`Error: ${error.message}`);
      return false;
    }
  }
  useEffect(() => {
    // Define an asynchronous function
    const validateAndRedirect = async () => {
      // Validate the nested lens IDs (client-side)
      if (!(await isValidHierarchy(lens_ids))) {
        // Redirect to an error page or handle the invalid case
        console.log("invalid hierarchy");
        // router.push('/notFound');
      }
    };

    // Call the asynchronous function
    validateAndRedirect();
  }, [lens_ids]);


  useEffect(() => {
    setEditingLensName(lensName);
  }, [lensName]);

  useEffect(() => {
    (async () => {
      setLoading(true);

      if (searchParams.get("edit") === 'true') {
        setEditingLensName(lensName);
        setIsEditingLensName(true);
      }

      await Promise.all([
        getLensBlocks(lens_ids[lens_ids.length - 1]),
        getLensData(lens_ids[lens_ids.length - 1]),
        getLensSubspaces(lens_ids[lens_ids.length - 1]),
        getLensLayout(lens_ids[lens_ids.length - 1])
      ])
        .then(() => {
          setLoading(false);
        })
        .catch((error) => {
          console.error('Error fetching lens data:', error);
        })
    })();
  }, [params.lens_id, searchParams]);

  const getLensData = async (lensId: string) => {
    return fetch(`/api/lens/${lensId}`)
      .then((response) => {
        if (!response.ok) {
          console.log('Error fetching lens');
          router.push('/notFound');
        } else {
          return response.json();
        }
      })
      .then((data) => {
        setLens(data.data);
        setLensName(data.data.name);
        const getUser = async () => {
          const { data: { user } } = await supabase.auth.getUser();
          setAccessType(data.data.user_to_access_type[user.id]);
        };

        getUser();
      })
      .catch((error) => {
        console.error('Error fetching lens:', error);
      })
  }

  const getLensSubspaces = async (lensId: string) => {
    return fetch(`/api/lens/${lensId}/getSubspaces`)
      .then((response) => response.json())
      .then((data) => {
        setSubspaces(data?.data);
      })
      .catch((error) => {
        console.error('Error fetching subspaces:', error);
      })
  }

  const getLensBlocks = async (lensId: string) => {
    return fetch(`/api/lens/${lensId}/getBlocks`)
      .then((response) => response.json())
      .then((data) => {
        setBlocks(data.data);
      })
      .catch((error) => {
        console.error('Error fetching blocks:', error);
      })
  }

  const getLensLayout = async (lensId: string) => {
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
    return fetch(`/api/lens/${lens_ids[lens_ids.length - 1]}/layout`, {
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
  }

  // useEffect(() => {
  //   // Check if 'edit' query parameter is present and set isEditingLensName accordingly
  //   if (searchParams.get("edit") === 'true') {
  //     setEditingLensName(lensName);
  //     setIsEditingLensName(true);
  //   }

  //   // Fetch the blocks associated with the lens
  //   fetch(`/api/lens/${lens_ids[lens_ids.length - 1]}/getBlocks`)
  //     .then((response) => response.json())
  //     .then((data) => {
  //       setBlocks(data?.data);
  //     })
  //     .catch((error) => {
  //       console.error("Error fetching block:", error);
  //       notFound();
  //     });

  //   // Fetch the lens details
  //   fetch(`/api/lens/${lens_ids[lens_ids.length - 1]}`)
  //     .then((response) => {
  //       if (!response.ok) {
  //         console.log("Error fetching lens")
  //         router.push("/notFound")
  //       } else {
  //         response.json().then((data) => {
  //           setLens(data?.data);
  //           setLensName(data?.data.name)
  //           const getUser = async() => {
  //             const { data: { user } } = await supabase.auth.getUser()
  //             setUser(user);
  //             setAccessType(data?.data.user_to_access_type[user.id]);
  //           }
  //           getUser();
  //         })
  //       }
  //     })

  // }, [lens_ids[lens_ids.length - 1], searchParams]);

  useEffect(() => {
    const updateBlocks = (payload) => {
      let block_id = payload["new"]["block_id"]
      setBlocks(prevBlocks =>
        prevBlocks.map(item => {
          if (item.block_id === block_id) {
            return { ...payload['new'], inLenses: item.inLenses, lens_blocks: item.lens_blocks };
          }
          return item;
        })
      );
    };

    const addBlocks = (payload) => {
      let block_id = payload["new"]["block_id"]
      console.log("Added a block", block_id)
      let newBlock = payload["new"]
      if (!blocks.some(item => item.block_id === block_id)) {
        setBlocks([newBlock, ...blocks]);
      }
    }

    const deleteBlocks = (payload) => {
      let block_id = payload["old"]["block_id"]
      console.log("Deleting block", block_id);
      setBlocks((blocks) => blocks.filter((block) => block.block_id !== block_id))
    }

    const addSubspaces = (payload) => {
      let lens_id = payload["new"]["lens_id"]
      console.log("Added a subspace", lens_id)
      let newSubspace = payload["new"]
      if (!subspaces.some(item => item.lens_id === lens_id)) {
        setSubspaces([newSubspace, ...subspaces]);
      }
    }

    const deleteSubspace = (payload) => {
      let lens_id = payload["old"]["lens_id"]
      console.log("Deleting lens", lens_id);
      setSubspaces((subspaces) => subspaces.filter((subspace) => subspace.lens_id !== lens_id))
    }

    const channel = supabase
      .channel('schema-db-changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'block' }, addBlocks)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'block' }, updateBlocks)
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'block' }, deleteBlocks)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'lens', filter: `parent_id=eq.${lens?.lens_id}` }, addSubspaces)
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'lens', filter: `parent_id=eq.${lens?.lens_id}` }, deleteSubspace)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'lens', filter: `lens_id=eq.${lens?.lens_id}` }, () => getLensData(lens_ids[lens_ids.length - 1]))
      .subscribe();

    return () => {
      if (channel) channel.unsubscribe();
    };
  }, [blocks, subspaces, lens]);

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
          throw new Error("Lens title cannot be empty");
        }
        const updatePromise = updateLensName(lens.lens_id, editingLensName);
        await load(updatePromise, {
          loading: "Updating lens name...",
          success: "Lens name updated!",
          error: "Failed to update lens name.",
        });
        setLens({ ...lens, name: editingLensName });
        setIsEditingLensName(false);  // Turn off edit mode after successful update
        reloadLenses();
        router.push(`/lens/${lens.lens_id}`);
        return true;
      } catch (error) {
        console.log("error", error.message)
        toast.error('Failed to update lens name: ' + error.message);
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
    setLayoutViewToLocalStorage(params.lens_id, newLayoutView)
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

  if (!lens || loading) {
    return (
      <div className="flex flex-col p-2 pt-0 flex-grow">
        <LoadingSkeleton />
      </div>
    );
  }

  if (!lens) {
    return (
      <div className="flex flex-col p-4 flex-grow">
        <p>Error fetching lens data.</p>
      </div>
    );
  }

  return (
    <Flex direction={"column"} pt={0} className="h-full">
      <SpaceHeader
        lens={lens}
        lens_ids={lens_ids}
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
        <LayoutController
          subspaces={subspaces}
          handleBlockChangeName={handleBlockChangeName}
          handleBlockDelete={handleBlockDelete}
          onChangeLayout={onChangeLensLayout}
          layout={layoutData} lens_id={params.lens_id}
          blocks={blocks} layoutView={selectedLayoutType} />
      </Box>
    </Flex >
  );
}