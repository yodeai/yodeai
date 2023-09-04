"use client";
import Tiptap from "@components/Tiptap";
import Sidebar from "./Sidebar";
import { BlockWithRelations } from "./get-block";
import { useEffect, useState } from "react";
import { useDebounce } from "usehooks-ts";

export default function BlockEditor({
  block,
}: {
  block: NonNullable<BlockWithRelations>;
}) {
  const [text, setText] = useState(block.content);
  const debouncedText = useDebounce(text, 1000);

  useEffect(() => {
    if (debouncedText !== block.content) {
      fetch(`/api/blocks/${block.block_id}/text`, {
        method: "PUT",
        body: debouncedText,
      });
    }
  });

  return (
    <div>
    
      <div className="py-12 px-24">
        <Tiptap defaultValue={text} onChange={(t) => setText(t)} />
      </div>
      <Sidebar
        block={block}
        links={block.links}
        backlinks={block.backlinks}
        kids={block.kids}
      />
      
    </div>
  );
}