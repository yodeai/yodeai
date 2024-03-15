"use client";

import ReactMarkdown from 'react-markdown';
import { FaCheck } from "@react-icons/all-files/fa/FaCheck";

import { useState, useRef, useMemo } from 'react';
import { Block } from 'app/_types/block';
import { useEffect } from 'react';
import BlockEditor from '@components/Block/BlockEditor';
import PDFViewerIframe from "@components/PDFViewer";
import { useRouter } from "next/navigation";
import { Button, Flex, Text, Tooltip } from '@mantine/core';
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import toast from "react-hot-toast";
import { useAppContext } from "@contexts/context";
import BlockHeader from "@components/Layout/Headers/BlockHeader";
import { timeAgo } from "@utils/index";
import FinishedOnboardingModal from "@components/Onboarding/FinishedOnboardingModal";

import { FaPen } from '@react-icons/all-files/fa6/FaPen';

export default function Block({ params }: { params: { id: string } }) {
  const [block, setBlock] = useState<Block | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [presignedUrl, setPresignedUrl] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClientComponentClient()
  const $saveButton = useRef<HTMLButtonElement>()

  const { user, setBreadcrumbActivePage, setLensId } = useAppContext();

  useEffect(() => {
    fetch(`/api/block/${params.id}`)
      .then((response) => {
        if (!response.ok) {
          console.log("Error fetching url")
          router.push("/notFound")
        } else {
          response.json().then((data) => {
            setBlock(data.data);
          })
        }
      }).finally(() => {
        setLoading(false);
      });
  }, [params.id]);

  useEffect(() => {
    async function fetchPresignedUrl() {
      if (block && block.block_type === "pdf") {
        const url = await getPresignedUrl(block.file_url);
        setPresignedUrl(url);
      }
    }
    fetchPresignedUrl();

    setBreadcrumbActivePage({ title: block?.title, href: `/block/${block?.block_id}` })
    return () => {
      setLensId(null);
      setBreadcrumbActivePage(null);
    }
  }, [block]);

  useEffect(() => {

    return () => {
      if (isEditing && block) {
        updateCurrentEditor(null);
      }
    };
  }, [isEditing, block, supabase.auth]);

  const updateCurrentEditor = async (newEditor) => {
    try {
      const { data, error } = await supabase
        .from('block')
        .update({ current_editor: newEditor })
        .eq('block_id', block.block_id);

      if (error) {
        console.error("Error updating block:", error.message);
      } else {
        setIsEditing(false);
        console.log('Block updated successfully');
      }
    } catch (updateError) {
      console.error('Error updating block:', updateError.message);
    }
  };

  const handleEditing = async (startEditing) => {
    try {
      if (block.block_type == "google_doc") {
        toast("Do not edit this page on the external Google Docs site while you edit on Yodeai.", { duration: 6000 })

      }
      if (!startEditing) {
        updateCurrentEditor(null)

      } else {
        const { data: currentUserData, error: currentUserDataError } = await supabase
          .from('block')
          .select().eq('block_id', block.block_id);
        let newBlock: Block = currentUserData[0]
        if (newBlock?.current_editor != null && newBlock?.current_editor != user?.email) {
          toast.error(`Sorry, ${newBlock.current_editor} is currently editing the block`)
          return;
        }
        const { data, error } = await supabase
          .from('block')
          .update({ current_editor: user?.email })
          .eq('block_id', block.block_id).select();

        newBlock = data[0]

        if (error) {
          console.error('Error updating block:', error.message);
        } else {
          console.log('Block updated successfully');
        }

        if (newBlock?.current_editor == user?.email) {
          setIsEditing(startEditing)
        } else {
          toast.error(`Sorry, ${newBlock.current_editor} is currently editing the block`)
        }


      }
    } catch (updateError) {
      console.error('Error updating block:', updateError.message);
    }
  };

  const renderContent = () => {
    if (block && block.block_type === "pdf" && presignedUrl) {
      return <PDFViewerIframe url={presignedUrl} />;
    } else {
      return (
        <ReactMarkdown className="prose text-gray-600">
          {block.content}
        </ReactMarkdown>
      );
    }
  }

  async function getPresignedUrl(key) {
    const response = await fetch(`/api/getPresignedUrl?key=${key}`);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return data.data;
  }

  const onSave = (block: Block) => {
    setIsEditing(false);
    handleEditing(false)
    setBlock(block);
  }

  const onSaveTitle = async (title: string) => {
    return fetch(`/api/block/${block.block_id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ title })
    }).then(res => {
      if (res.ok) setBlock({ ...block, title })
      return res;
    })
  }

  const onDelete = async () => {
    return fetch(`/api/block/${block.block_id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
    }).then(res => {
      if (res.ok) router.replace('/myblocks')
      return res;
    })
  }

  const rightEditButton = useMemo(() => {
    if (!block) return null
    return <div className="flex justify-between items-center w-full">
      <div className="flex gap-2">
        {["owner", "editor"].includes(block.accessLevel) && block.block_type === "note" &&
          <Tooltip color="blue" label={isEditing ? "Save" : "Edit"}>
            <Button size="xs" variant="subtle" leftSection={
              isEditing ? <FaCheck /> : <FaPen />
            }
              onClick={() => { isEditing ? $saveButton?.current?.click() : handleEditing(true) }} >
              {isEditing ? "Save" : "Edit"}
            </Button>
          </Tooltip>
          || ""}
      </div>
    </div>
  }, [block]);

  return (<>
    <Flex direction="column" pt={0}>
      <BlockHeader
        loading={loading}
        title={block?.title}
        accessType={block?.accessLevel}
        onSave={onSaveTitle}
        onDelete={onDelete}
        rightItem={rightEditButton}
      />
      <div className="w-[800px] mx-auto h-full p-[16px]">
        {!loading && block && <>
          {isEditing
            // this recreates the entire block view but allows for editing
            // drag and drop https://github.com/atlassian/react-beautiful-dnd/tree/master
            ? <BlockEditor
              withHeader={true}
              refs={{ saveButton: $saveButton }}
              block={block} onSave={onSave}
            />
            : <>
              <div className="flex flex-col py-4">
                <div>
                  <Text size="sm" c="gray">
                    Created {timeAgo(block.created_at)}
                  </Text>
                </div>
                <div>
                  <Text size="sm" c="gray">
                    Updated {timeAgo(block.updated_at)}
                  </Text>
                </div>
              </div>
              {renderContent()}
            </>
          }
          {!block.content && !isEditing && block.block_type === "note" && <Text size="sm" c="gray">No content in this block.</Text>}
        </>}
      </div>
    </Flex>
    <FinishedOnboardingModal />
  </>
  );
}
