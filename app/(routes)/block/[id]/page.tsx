import { notFound } from "next/navigation";
import getBlock from "./get-block";
import BlockEditor from "./BlockEditor";

export default async function Block({ params }: { params: { id: string } }) {
  const block = await getBlock(params.id);
  if (!block) {
    notFound();
  }

  return (
    <main className="grid sm:grid-cols-[2fr_1fr] container">
      <div>
      
        <BlockEditor block={block} />
        
      </div>
    </main>
  );
}
