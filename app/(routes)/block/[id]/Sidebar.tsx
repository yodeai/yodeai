"use client";
import BlockComponent from "@components/BlockComponent";
import { Block } from "app/_types/block";
import { link } from "@lib/api";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import Search from "@components/Search";

interface LinksProps {
  block: Block;
  links: Block[];
}
function Links({ block, links }: LinksProps) {
  const router = useRouter();

  const handleLink = useCallback(
    async (block: Block) => {
      const { block_id } = block;
      await link(block.block_id, block_id);
      router.refresh();
    },
    [router, block.block_id]
  );

  return (
    <div className="p-8">
      <div className="flex items-center justify-between gap-4 mb-2">
        <h2 className="text-lg font-semibold">Links</h2>
        <Search label="Add a post" onCommit={handleLink} />
      </div>
      <div className="flex flex-col gap-4 items-start mt-4">
        {links.length > 0 ? (
          links.map((link) => <BlockComponent compact={true} key={link.block_id} block={link} />)
        ) : (
          <p className="text-gray-600 text-sm">No links yet</p>
        )}
      </div>
    </div>
  );
}

interface BacklinksProps {
  backlinks: Block[];
}
function Backlinks({ backlinks }: BacklinksProps) {
  return (
    <div className="p-8">
      <h2 className="text-lg font-semibold mb-2">Backlinks</h2>
      <div className="flex flex-col gap-4 items-start">
        {backlinks.length > 0 ? (
          backlinks.map((backlink) => (
            <BlockComponent compact={true} key={backlink.block_id} block={backlink} />
          ))
        ) : (
          <p className="text-gray-600 text-sm">No backlinks yet</p>
        )}
      </div>
    </div>
  );
}

interface KidsProps {
  kids: Block[];
  block: Block;
}
function Kids({ block, kids }: KidsProps) {
  const router = useRouter();

  const handleLink = useCallback(
    async (block: Block) => {
      const { block_id } = block;
      await link(block.block_id, block_id);
      router.refresh();
    },
    [router, block.block_id]
  );

  return (
    <div className="p-8">
      <h2 className="text-lg font-semibold mb-2">In this page</h2>
      <div className="flex flex-col gap-4 items-start">
        {kids.length > 0 ? (
          kids.map((kid) => <BlockComponent compact={true} key={kid.block_id} block={kid} />)
        ) : (
          <p className="text-gray-600 text-sm">No children yet</p>
        )}
      </div>
    </div>
  );
}

interface SidebarProps {
  block: Block;
  links: Block[];
  backlinks: Block[];
  kids: Block[];
}
export default function Sidebar({
  block,
  links,
  kids,
  backlinks,
}: SidebarProps) {
  return (
    <aside className="border-l divide-y">
      <Kids block={block} kids={kids} />
      <Links block={block} links={links} />
      <Backlinks backlinks={backlinks} />
    </aside>
  );
}