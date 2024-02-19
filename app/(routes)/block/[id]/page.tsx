"use client";

import ReactMarkdown from 'react-markdown';
import formatDate from "@lib/format-date";
import { Pencil2Icon } from "@radix-ui/react-icons";
import { useState } from 'react';
import { Block } from 'app/_types/block';
import { useEffect } from 'react';
import BlockEditor from '@components/BlockEditor';
import Link from "next/link";
import PDFViewerIframe from "@components/PDFViewer";
import { useRouter } from "next/navigation";
import { Button, Divider, Flex, Text, Tooltip } from "@mantine/core";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import toast from "react-hot-toast";
import { useAppContext } from "@contexts/context";

export default function Block({ params }: { params: { id: string } }) {
  const [block, setBlock] = useState<Block | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [presignedUrl, setPresignedUrl] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClientComponentClient()

  const { user } = useAppContext();

  useEffect(() => {
    fetch(`/api/block/${params.id}`)
      .then((response) => {
        if (!response.ok) {
          console.log("Error fetching url")
          setLoading(false);
          router.push("/notFound")
        } else {
          response.json().then((data) => {
            setBlock(data.data);
            setLoading(false);
          })
        }
      })
  }, [params.id]);

  useEffect(() => {
    async function fetchPresignedUrl() {
      if (block && block.block_type === "pdf") {
        const url = await getPresignedUrl(block.file_url);
        setPresignedUrl(url);
      }
    }

    fetchPresignedUrl();
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



  if (loading || !block) {
    return (
      <div className="skeleton-container p-8 mt-12 ">
        <div className="skeleton line  "></div>
      </div>
    );
  }

  const handleEditing = async (startEditing) => {
    try {
      if (block.block_type == "google_doc") {
        toast("Do not edit this block on the external Google Docs site while you edit on Yodeai.", { duration: 6000 })

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

  return (
    <main className="container">
      <Flex direction="column" p={16} pt={0}>
        <Divider mb={0} size={1.5} label={<Text c={"gray.7"} size="sm" fw={500}>My blocks</Text>} labelPosition="center" />
        <Divider mb={0} variant="dashed" size={1.5} label={<Text size={"sm"} c="gray.7">{block.block_type} </Text>} labelPosition="center" />
        {!isEditing ? (
          <>
            <div className="p-2 pt-0 flex flex-col w-full">
              <div className="flex justify-between items-center w-full">

                <Link href={`/block/${block.block_id}`}>
                  <Text ta={"center"} size={"md"} fw={600} c="gray.7">{block.title}</Text>
                </Link>

                {/* <Link href={`/block/${block.block_id}`}> */}
                {/* <Text ta={"center"} size={"md"} fw={600} c="gray.7">{block.title}</Text> */}
                {/* </Link> */}
                <div className="flex gap-2">
                  {(block.accessLevel != 'editor' && block.accessLevel != "owner") ? null :
                    <Tooltip color="blue" label="Edit this block's title/content">
                      <Button
                        size="xs"
                        variant="subtle"
                        leftSection={<Pencil2Icon />}
                        onClick={() => handleEditing(true)}
                      >
                        Edit
                      </Button>
                    </Tooltip>
                  }
                </div>
              </div>
              <div className="min-w-full">
                <div className="min-w-full">
                  <Text size="xs" c="gray">
                    {formatDate(block.updated_at)}
                  </Text>
                  {renderContent()}
                </div>
              </div>
            </div>
          </>
        ) : (
          <BlockEditor block={block} onSave={onSave} /> // this recreates the entire block view but allows for editing
          // drag and drop https://github.com/atlassian/react-beautiful-dnd/tree/master
        )}
      </Flex>
    </main>

  );
}
