import { Block } from "app/_types/block";
import { Subspace } from "app/_types/lens";
import { Tables } from "app/_types/supabase";
import BlockComponent from "@components/BlockComponent";
import { Chip } from "@mantine/core";
import WhiteboardLineComponent from "@components/Whiteboard/WhiteboardLineComponent";
import SubspaceComponent from "@components/SubspaceComponent";

type ExplorerItemComponentProps = {
    type: string;
    data: Block | Subspace | Tables<"whiteboard">;
}

export const ExplorerItemComponent = ({ type, data }: ExplorerItemComponentProps) => {
    if (type === "block") {
        const blockData = data as Block;
        return <div key={blockData.block_id} className="flex w-full hover:bg-gray-100 rounded-md" >
            <Chip className="mt-1 mr-2" variant="outline" value={`block_${blockData.block_id}`}>{""}</Chip>
            <div className="flex-1">
                <BlockComponent block={blockData} />
            </div>
        </div>
    }
    if (type === "whiteboard") {
        const whiteboardData = data as Tables<"whiteboard">;
        return <div key={whiteboardData.whiteboard_id} className="flex w-full hover:bg-gray-100 rounded-md" >
            <Chip className="mt-1 mr-2" variant="outline" value={`whiteboard_${whiteboardData.whiteboard_id}`}>{""}</Chip>
            <div className="flex-1">
                <WhiteboardLineComponent whiteboard={whiteboardData} />
            </div>
        </div>
    }
    if (type === "lens") {
        const lensData = data as Subspace;
        return <div key={lensData.lens_id} className="flex w-full hover:bg-gray-100 rounded-md" >
            <Chip className="mt-1 mr-2" variant="outline" value={`lens_${lensData.lens_id}`}>{""}</Chip>
            <div className="flex-1">
                <SubspaceComponent leftComponent={
                    (type: string, id: number) => <Chip className="mt-1 mr-2" variant="outline" value={`${type}_${id}`}>{""}</Chip>
                } subspace={lensData} />
            </div>
        </div>
    }
}