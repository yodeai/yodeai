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
import { Button, Tooltip } from 'flowbite-react';
import ShareLensComponent from "@components/ShareLensComponent";
import toast from "react-hot-toast";
import { FaThLarge } from "react-icons/fa";
import { isErrored } from "stream";



export default function Lens({ params }: { params: { lens_id: string } }) {
  const [loading, setLoading] = useState(true);
  const [lens, setLens] = useState<Lens | null>(null);
  const [editingLensName, setEditingLensName] = useState("");
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [isEditingLensName, setIsEditingLensName] = useState(false);
  const [accessType, setAccessType] = useState(null);
  const router = useRouter();
  const { setLensId, lensName, setLensName, reloadLenses, setActiveComponent } = useAppContext();
  const searchParams = useSearchParams();
  const supabase = createClientComponentClient()

  useEffect(() => {
    setEditingLensName(lensName);
  }, [lensName]);
  useEffect(() => {
    // Fetch lens data and related information
    fetchLensData(params.lens_id);
  }, [params.lens_id, searchParams]);
  const fetchLensData = (lensId: string) => {
    setLoading(true);
    // Check if 'edit' query parameter is present and set isEditingLensName accordingly
    if (searchParams.get("edit") === 'true') {
      setEditingLensName(lensName);
      setIsEditingLensName(true);
    }
    // Fetch lens and related data
    Promise.all([
      fetch(`/api/lens/${lensId}/getBlocks`)
        .then((response) => response.json())
        .then((data) => {
          setBlocks(data.data);
        })
        .catch((error) => {
          console.error('Error fetching blocks:', error);
        }),
      fetch(`/api/lens/${lensId}`)
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
        }),
    ])
      .then(() => {
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching lens data:', error);
        notFound();
      });
  };

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

    const channel = supabase
      .channel('schema-db-changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'block' }, addBlocks)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'block' }, updateBlocks)
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



  if (!lens) {
    return (
      <div className="flex flex-col p-4 flex-grow">
        <LoadingSkeleton />
      </div>
    );
  }

  if (loading) {
    return (
      <div>
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
    <Container as="main" className="py-8 max-w-screen-sm gap-8 ">
      {!lens.shared || accessType == 'owner' || accessType == 'editor' ?
      <header className="flex items-center justify-between">
        {!isEditingLensName ? (
          <>
          <div className="flex items-center mt-4 text-gray-600 gap-2 justify-start">
              <FaThLarge className="iconStyle spaceIconStyle" />
              <span className="text-xl font-semibold ">{lensName}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Tooltip content="Edit lens." style="light" >
                <Button onClick={() => setIsEditingLensName(true)} className="no-underline gap-2 font-semibold rounded px py-1 bg-white text-gray-400 border-0">
                  <Pencil2Icon className="w-6 h-6" />
                </Button>
              </Tooltip>
              {!lens.shared || accessType == 'owner' ? <ShareLensComponent lensId={lens.lens_id}/> : ""}
            </div>

          </>
        ) : (
          <div className="flex items-center w-full">
            <input
              type="text"
              value={editingLensName || ""}
              onChange={handleNameChange}
              onKeyUp={handleKeyPress}
              className="text-xl font-semibold flex-grow"
            />

            <button onClick={() => { saveNewLensName().then(result => { console.log("Success", result); if (result) setIsEditingLensName(false); }); }} className="no-underline gap-2 font-semibold rounded px-2 py-1 bg-white text-gray-400 border-0 ml-4">
              <CheckIcon className="w-6 h-6" />
            </button>
            {!lens.shared || accessType == 'owner'?
            <div className="flex gap-2">
              <button onClick={handleDeleteLens} className="no-underline gap-2 font-semibold rounded px-2 py-1  text-red-500 hover:text-red-600 border-0">
                <TrashIcon className="w-6 h-6" />
              </button>

            </div> : ""}

          </div>

        )}
      </header>
      : <span className="text-xl font-semibold">
          <div className="flex items-center mt-4 text-gray-600 gap-2 justify-start">
              <FaThLarge className="iconStyle spaceIconStyle" />
              <span className="text-xl font-semibold ">{lensName}</span>
            </div>
    </span>}
    <p className="text-blue-500 text-sm">
            {lens.shared ? `Collaborative: ${lens.shared ?  `${accessType}` : ''}` : ''}
          </p>
          <p className="text-green-500 text-sm">
              {lens.public ? 'Published' : 'Private'}
          </p>
      {!lens.shared || accessType == 'editor' || accessType == 'owner' ?
      <div className="flex items-stretch flex-col gap-4 mt-4">
        <Link
          href="/new"
          className="no-underline flex items-center gap-2 text-sm font-semibold rounded px-2 py-1 w-32 bg-royalBlue hover:bg-royalBlue-hover text-white border border-royalBlue shadow transition-colors">
          <PlusIcon /> New block
        </Link>
        {blocks && blocks.length > 0 ? (
          blocks.map((block) => (
            <BlockComponent key={block.block_id} block={block} />
          ))
        ) : (
          <p>This space is empty, add blocks here. A space can be a good place to organize information related to a project, a goal, or a long-term interest.</p>
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
    </Container>
  );
}
