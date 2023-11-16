import { notFound } from "next/navigation";
import Container from "@components/Container";
import Link from "next/link";
import BlockComponent from "@components/BlockComponent";
import { Block } from "app/_types/block";
import { useState, useEffect, ChangeEvent, useContext } from "react";
import { Lens } from "app/_types/lens";
import load from "@lib/load";
import LoadingSkeleton from '@components/LoadingSkeleton';
import { Pencil2Icon, TrashIcon, PlusIcon, Share1Icon, CheckIcon } from "@radix-ui/react-icons";
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter, useSearchParams } from "next/navigation";
import { useAppContext } from "@contexts/context";
import ShareLensComponent from "@components/ShareLensComponent";
import toast from "react-hot-toast";
import { FaCheck, FaPlus, FaPlusSquare, FaThLarge, FaTrash, FaTrashAlt } from "react-icons/fa";
import { isErrored } from "stream";
import { Divider, Flex, Button, Text, TextInput, ActionIcon, Tooltip } from "@mantine/core";
import InfoPopover from "@components/InfoPopover";
import QuestionAnswerForm from "@components/QuestionAnswerForm";


export default function Lens({ params }: { params: { lens_id: string } }) {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [loading, setLoading] = useState(true);

  const [unacceptedInvites, setUnacceptedInvites] = useState([]);

  const [lens, setLens] = useState<Lens | null>(null);
  const [editingLensName, setEditingLensName] = useState("");
  const [isEditingLensName, setIsEditingLensName] = useState(false);
  const [accessType, setAccessType] = useState(null);
  const router = useRouter();
  const { setLensId, lensName, setLensName, reloadLenses, setActiveComponent } = useAppContext();
  const searchParams = useSearchParams();

  const supabase = createClientComponentClient()

  const fetchAllData = (lensId: string) => {
    setLoading(true);
    let apicalls = [fetchBlocks(lensId)];
    if (lensId == "inbox") {
      apicalls.push(fetchInvites());
    } else {
      apicalls.push(fetchSpace(lensId));
      // Check if 'edit' query parameter is present and set isEditingLensName accordingly
      if (searchParams.get("edit") === 'true') {
        setEditingLensName(lensName);
        setIsEditingLensName(true);
      }
    }
    // Fetch related data
    Promise.all(apicalls)
      .then(() => {
        setLoading(false);
      })
      .catch((error) => {
        console.error('(fetchAllData) Error fetching data:', error);
        router.push('/notFound');
      });
  };

  const fetchBlocks = async(lensId: string) => {
    let apiurl;
    if (lensId == "allBlocks") {
      apiurl = '/api/block/getAllBlocks';
    } else if (lensId == "inbox") {
      apiurl = '/api/inbox/getBlocks';
    } else {
      apiurl = `/api/lens/${lensId}/getBlocks`;
    }
    return fetch(apiurl)
        .then(response => response.json())
        .then(data => {
          setBlocks(data.data || []);
        })
        .catch(error => {
          console.error('(fetchBlocks) Error fetching blocks:', error);
          throw error;
        });
  };

  const fetchInvites = async() => {
    const { data: { user } } = await supabase.auth.getUser()
    const { data, error } = await supabase
    .from('lens_invites')
    .select()
    .eq('recipient', user.email).eq("status", "sent")
    if (error) {
      console.error("(fetchInvites) Error fetching space invites:", error.message);
      throw error;
    }
    setUnacceptedInvites(data);
  };

  const fetchSpace = async(lensId: string) => {
    return fetch(`/api/lens/${lensId}`)
      .then((response) => {
        if (!response.ok) {
          console.log('(fetchSpace) Error fetching space. response not ok.');
          throw new Error('(fetchSpace) Error fetching space: ' + response.status);
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
        console.log('(fetchSpace) Error setting space and getting user.', error);
        throw error;
      })
  };

  useEffect(() => {
    setEditingLensName(lensName);
  }, [lensName]);

  useEffect(() => {
    // Fetch lens data and related information
    fetchAllData(params.lens_id);
  }, [params.lens_id, searchParams]);

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
      let block_id = payload["new"]["block_id"]
      console.log("Deleting block", block_id);
      setBlocks((blocks) => blocks.filter((block) => block.block_id != block_id))
    }

    const channel = supabase
      .channel('schema-db-changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'block' }, addBlocks)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'block' }, updateBlocks)
      .on('postgres_changes', {event: 'DELETE', schema: 'public', table: 'block'}, deleteBlocks)
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

  if (loading) {
    return (
      <div className="flex flex-col p-4 flex-grow">
        <LoadingSkeleton />
      </div>
    );
  }

  if (!lens) {
    return (
      <div className="flex flex-col p-4 flex-grow">
        <p>Error fetching data.</p>
      </div>
    );
  }

  return (
    <Flex direction={"column"} p={16} pt={0}>
      <Divider mb={0} size={1.5} label={<Text c={"gray.7"} size="sm" fw={500}>{lensName}</Text>} labelPosition="center" />

      {!lens.shared || accessType == 'owner' || accessType == 'editor' ?
        <Flex justify={"center"} align={"center"}>
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
        </Flex>
        : <span className="text-xl font-semibold">
          <div className="flex items-center mt-4 text-gray-600 gap-2 justify-start">
            <FaThLarge className="iconStyle spaceIconStyle" />
            <span className="text-xl font-semibold ">{lensName}</span>
          </div>
        </span>}

      <Text ta={"center"} size="xs" fw={600} c={"blue"}>
        {lens.shared ? `Collaborative: ${lens.shared ? `${accessType}` : ''}` : ''}
      </Text>

      {
        !lens.shared || accessType == 'editor' || accessType == 'owner' ?
          <div className="flex items-stretch flex-col gap-4 mt-4">
            {blocks && blocks.length > 0 ? (
              blocks.map((block) => (
                <BlockComponent key={block.block_id} block={block} />
              ))
            ) : (
              <Text size={"sm"} c={"gray.7"} ta={"center"} mt={30}>
                This space is empty, add blocks to populate this space with content & context.
              </Text>
            )}

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
          :
          <div className="flex items-stretch flex-col gap-4 mt-4">

            {blocks && blocks.length > 0 ? (
              blocks.map((block) => (
                <BlockComponent key={block.block_id} block={block} />
              ))
            ) : (
              <p>This lens is empty.</p>
            )}
          </div>
      }
      {/* <Flex direction={"column"} justify={"flex-end"}>
        <QuestionAnswerForm />
      </Flex> */}
    </Flex >
  );
}
