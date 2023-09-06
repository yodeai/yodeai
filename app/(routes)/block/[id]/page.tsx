import { notFound } from "next/navigation";
import getBlock from "./get-block";
import ReactMarkdown from 'react-markdown';
import Link from "next/link";
import formatDate from "@lib/format-date";
import { Pencil2Icon } from "@radix-ui/react-icons";

export default async function Block({ params }: { params: { id: string } }) {
  const block = await getBlock(params.id);
  if (!block) {
    notFound();
  }

  return (
    <main className="container">
    <div className="w-full flex flex-col p-8">
      <div className="flex items-start justify-between elevated-block p-8 rounded-md bg-white border border-gray-200 mb-4 mt-12">
        <div className="flex flex-col gap-1 w-full">
          <div className="flex justify-between items-center w-full">
            <Link className="flex items-center flex-1" href={`/block/${block.block_id}`}>
              <ReactMarkdown className="text-gray-600 line-clamp-1 text-xl">
                {block.title}
              </ReactMarkdown>
            </Link>
            <Link href="/new" className="no-underline gap-2 font-semibold rounded px-2 py-1 bg-white text-gray-400 border border-gray-200 shadow transition-colors">
              <Pencil2Icon className="w-6 h-6" />
            </Link>
          </div>
          <div className="min-w-full">
            <p className="text-gray-500 text-sm">{formatDate(block.created_at)}</p>
            <div className="text-gray-600">
              <ReactMarkdown>
                {block.content}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
  
  );
}
