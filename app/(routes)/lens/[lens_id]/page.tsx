"use client";

import Link from "next/link";
import { Block } from "app/_types/block";
import { useState, useEffect, ChangeEvent, useCallback } from "react";
import { Lens, LensLayout } from "app/_types/lens";
import load from "@lib/load";
import LoadingSkeleton from '@components/LoadingSkeleton';
import { Pencil2Icon } from "@radix-ui/react-icons";
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter, useSearchParams } from "next/navigation";
import { useAppContext } from "@contexts/context";
import ShareLensComponent from "@components/ShareLensComponent";
import SpaceLayoutComponent from "@components/SpaceLayout";
import toast from "react-hot-toast";
import { FaCheck, FaPlus, FaTrashAlt, FaFolder, FaList } from "react-icons/fa";
import { Divider, Flex, Button, Text, TextInput, ActionIcon, Tooltip } from "@mantine/core";
import { useDebounceCallback } from "@mantine/hooks";
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

export default function Lens({ params }: { params: { lens_id: string } }) {
  const [loading, setLoading] = useState(true);
  const [lens, setLens] = useState<Lens | null>(null);
  const [editingLensName, setEditingLensName] = useState("");
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [isEditingLensName, setIsEditingLensName] = useState(false);
  const [accessType, setAccessType] = useState(null);
  const [selectedLayoutType, setSelectedLayoutType] = useState<"block" | "icon">(getLayoutViewFromLocalStorage(params.lens_id));
  const [layoutData, setLayoutData] = useState<LensLayout>({})

  const router = useRouter();
  const { setLensId, lensName, setLensName, reloadLenses, setActiveComponent } = useAppContext();
  const searchParams = useSearchParams();
  const supabase = createClientComponentClient()

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
        getLensBlocks(params.lens_id),
        getLensData(params.lens_id),
        getLensLayout(params.lens_id)
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
          console.log('Error fetching lens layout');
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
    return fetch(`/api/lens/${params.lens_id}/layout`, {
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
  }, 2000);

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
  //   fetch(`/api/lens/${params.lens_id}/getBlocks`)
  //     .then((response) => response.json())
  //     .then((data) => {
  //       setBlocks(data.data);
  //     })
  //     .catch((error) => {
  //       console.error("Error fetching block:", error);
  //       notFound();
  //     });

  //   // Fetch the lens details
  //   fetch(`/api/lens/${params.lens_id}`)
  //     .then((response) => {
  //       if (!response.ok) {
  //         console.log("Error fetching lens")
  //         router.push("/notFound")
  //       } else {
  //         response.json().then((data) => {
  //           setLens(data.data);
  //           setLensName(data.data.name)
  //           const getUser = async() => {
  //             const { data: { user } } = await supabase.auth.getUser()
  //             setUser(user);
  //             setAccessType(data.data.user_to_access_type[user.id]);
  //           }
  //           getUser();
  //         })
  //       }
  //     })

  // }, [params.lens_id, searchParams]);

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

    const channel = supabase
      .channel('schema-db-changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'block' }, addBlocks)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'block' }, updateBlocks)
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'block' }, deleteBlocks)
      .subscribe();

    return () => {
      if (channel) channel.unsubscribe();
    };
  }, [blocks]);

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
    if (lens && window.confirm("Are you sure you want to delete this lens?")) {
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

  //   <Flex direction="column" p={8}>
  //   <Divider mb={8} label="All blocks" labelPosition="center" />

  //   {blocks.length > 0 ? (
  //     blocks.map((block: Block) => (

  //       <div key={block.block_id}>
  //         <BlockComponent block={block} />
  //       </div>
  //     ))
  //   ) : (
  //     <p>No blocks found.</p>
  //   )}

  // </Flex>

  return (
    <Flex direction={"column"} p={16} pt={0}>
      <Divider mb={0} size={1.5} label={<Text c={"gray.7"} size="sm" fw={500}>{lensName}</Text>} labelPosition="center" />

      {!lens.shared || accessType == 'owner' || accessType == 'editor' ?
        <Flex justify={"center"} align={"center"} gap="sm">
          {!isEditingLensName ? (
            <Flex justify={"center"} align={"center"}>
              <Link href="/new">
                <Button
                  size="xs"
                  variant="subtle"
                  leftSection={<FaPlus />}
                // onClick={() => setIsEditingLensName(true)}
                >
                  Add Block
                </Button>
              </Link>
              <Tooltip color="blue" label="Edit lens.">
                <Button
                  size="xs"
                  variant="subtle"
                  leftSection={<Pencil2Icon />}
                  onClick={() => setIsEditingLensName(true)}
                >
                  Edit
                </Button>
              </Tooltip>
              {!lens.shared || accessType == 'owner' ? <ShareLensComponent lensId={lens.lens_id} /> : ""}
              <Text style={{ display: 'block', whiteSpace: 'nowrap' }} size="xs" fw={500} c={"green"}>
                <strong>Status:</strong> {lens.public ? 'Published' : 'Not Published'}
              </Text>
            </Flex>
          ) : (
            <Flex align={"center"}>
              <TextInput
                size="xs"
                value={editingLensName || ""}
                onChange={handleNameChange}
                onKeyUp={handleKeyPress}
              />

              <ActionIcon
                onClick={() => { saveNewLensName().then(result => { console.log("Success", result); if (result) setIsEditingLensName(false); }); }}
                size="md"
                color="green"
                variant="gradient"
                ml={5}
                gradient={{ from: 'green', to: 'lime', deg: 116 }}
              >
                <FaCheck size={14} />
              </ActionIcon>
              {!lens.shared || accessType == 'owner' ?
                <Tooltip color="red" label="This will delete the space. Please proceed with caution.">
                  <ActionIcon
                    onClick={handleDeleteLens}
                    size="md"
                    color="red"
                    variant="gradient"
                    ml={5}
                    gradient={{ from: 'red', to: 'pink', deg: 255 }}
                  >
                    <FaTrashAlt size={14} />
                  </ActionIcon>

                </Tooltip> : ""}
            </Flex>
          )}
          <Tooltip color="blue" label={selectedLayoutType === "block"
            ? "Switch to icon layout."
            : "Switch to block layout."
          }>
            <Button
              size="xs"
              variant="subtle"
              leftSection={selectedLayoutType === "icon" ? <FaFolder /> : <FaList />}
              onClick={() => handleChangeLayoutView(selectedLayoutType === "block" ? "icon" : "block")}
            >
              {selectedLayoutType === "block" ? "Block View" : "Icon View"}
            </Button>
          </Tooltip>
        </Flex>
        : <span className="text-xl font-semibold">
          {/* <div className="flex items-center mt-4 text-gray-600 gap-2 justify-start">
            <FaThLarge className="iconStyle spaceIconStyle" />
            <span className="text-xl font-semibold ">{lensName}</span>
          </div> */}
        </span>}

      <Text ta={"center"} size="xs" fw={600} c={"blue"}>
        {lens.shared ? `Collaborative: ${lens.shared ? `${accessType}` : ''}` : ''}
      </Text>

      {
        !lens.shared || accessType == 'editor' || accessType == 'owner'
          ? <div className="flex items-stretch flex-col gap-4 mt-4">
            {blocks && blocks.length > 0
              ? <SpaceLayoutComponent
                handleBlockChangeName={handleBlockChangeName}
                handleBlockDelete={handleBlockDelete}
                onChangeLayout={onChangeLensLayout}
                layout={layoutData} lens_id={params.lens_id}
                blocks={blocks} layoutView={selectedLayoutType} />
              : <Text size={"sm"} c={"gray.7"} ta={"center"} mt={30}>
                This space is empty, add blocks to populate this space with content & context.
              </Text>
            }
            {/* Display child lenses if they exist */}
            {lens.children && lens.children.length > 0 ? (
              lens.children.map((childLens) => (
                <div key={childLens.lens_id}>
                  {/* Child lens display logic */}
                  Child Lens: {childLens.name}
                </div>
              ))
            ) : (
              <p></p>
            )}
          </div>
          : <div className="flex items-stretch flex-col gap-4 mt-4">
            {blocks && blocks.length > 0
              ? <SpaceLayoutComponent
                handleBlockChangeName={handleBlockChangeName}
                handleBlockDelete={handleBlockDelete}
                onChangeLayout={onChangeLensLayout}
                layout={layoutData} lens_id={params.lens_id}
                blocks={blocks} layoutView={selectedLayoutType} />
              : <Text size={"sm"} c={"gray.7"} ta={"center"} mt={30}>
                This space is empty.
              </Text>
            }
          </div>
      }
      {/* <Flex direction={"column"} justify={"flex-end"}>
        <QuestionAnswerForm />
      </Flex> */}
    </Flex >
  );
}