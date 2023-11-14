"use client";
import Container from "@components/Container";
import UploadBlocks from "@components/UploadBlocks";
import BlockEditor from "@components/BlockEditor";
import * as Tabs from "@radix-ui/react-tabs";
import { useState } from "react";
import { useAppContext } from "@contexts/context";

export default function New() {
  const [value, setValue] = useState("write");
  const { lensId, lensName } = useAppContext();
  return (
    <Container className="max-w-3xl ">
      
      <div className="w-full flex flex-col p-8">
      {lensId && <span className="text-xl font-semibold">Adding to: {lensName}</span>}
      
      
        <div className="flex items-start justify-between elevated-block p-8 rounded-md bg-white border border-gray-200 mb-4 mt-12">
        
        <Tabs.Root className="w-full" value={value} onValueChange={(value: string) => setValue(value)}>
          
          <Tabs.List className="divide-x border overflow-hidden rounded-lg inline-flex my-4">
            <Tabs.Trigger
              value="write"
              className="px-4 py-2 font-medium text-gray-500 data-[state=active]:text-black data-[state=active]:bg-gray-50"
            >
              Write
            </Tabs.Trigger>
            <Tabs.Trigger
              value="upload"
              className="px-4 py-2 font-medium text-gray-500 data-[state=active]:text-black data-[state=active]:bg-gray-50"
            >
              Upload
            </Tabs.Trigger>
          </Tabs.List>
          <Tabs.Content value="write">
            <BlockEditor />
          </Tabs.Content>
          <Tabs.Content value="upload">
            <UploadBlocks />
          </Tabs.Content>
        </Tabs.Root>
      </div>
    </div>
      
    </Container >
  );
}
