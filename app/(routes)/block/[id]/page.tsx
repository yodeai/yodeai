"use client";

import { notFound } from "next/navigation";
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
import QuestionAnswerForm from "@components/QuestionAnswerForm";

export default function Block({ params }: { params: { id: string } }) {
  const [block, setBlock] = useState<Block | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [presignedUrl, setPresignedUrl] = useState<string | null>(null);
  const router = useRouter();


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


  if (loading || !block) {
    return (
      <div className="skeleton-container p-8 mt-12 ">
        <div className="skeleton line  "></div>
      </div>
    );
  }



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

  return (
    <main className="container">
      <Flex direction="column" p={16}>
        <Divider mb={0} size={1.5} label={<Text c={"gray.7"} size="sm" fw={500}>My blocks</Text>} labelPosition="center" />
        {!isEditing ? (
          <>
            <div className="p-2 pt-0 flex flex-col w-full">
              <div className="flex justify-between items-center w-full">

                <Button
                  size={"xs"}
                  p={0}
                  variant="transparent"
                  onClick={() => window.location.href = `/block/${block.block_id}`}
                >
                  <Text ta={"center"} size={"md"} fw={600} c="gray.7">{block.title}</Text>
                </Button>


                {/* <Link href={`/block/${block.block_id}`}> */}
                {/* <Text ta={"center"} size={"md"} fw={600} c="gray.7">{block.title}</Text> */}
                {/* </Link> */}
                <div className="flex gap-2">
                  {block.readOnly ? null :
                    <Tooltip color="blue" label="Edit this block's title/content">
                      <Button
                        size="xs"
                        variant="subtle"
                        leftSection={<Pencil2Icon />}
                        onClick={() => setIsEditing(!isEditing)}
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
          <BlockEditor block={block} /> // this recreates the entire block view but allows for editing            
          // drag and drop https://github.com/atlassian/react-beautiful-dnd/tree/master
        )}
      </Flex>
      <Flex direction={"column"} justify={"flex-end"}>
        <QuestionAnswerForm />
      </Flex>
    </main>

  );
}
