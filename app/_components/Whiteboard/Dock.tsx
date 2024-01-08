import { FaStickyNote } from "react-icons/fa";
import { useStoreApi } from 'reactflow';
import { useDebouncedCallback } from "@utils/hooks";
import { FaFile, FaLink } from "react-icons/fa6";
import { Tooltip } from "@mantine/core";

export default function WhiteboardDock() {
    const onDragStart = (event, nodeType) => {
        event.dataTransfer.setData('application/reactflow', nodeType);
        event.dataTransfer.effectAllowed = 'move';
    };

    return <aside className="absolute bottom-3 left-[50%] -translate-x-[50%] min-w-min border border-gray-400 bg-slate-100 flex flex-row rounded-lg px-2 py-3">
        <Tooltip label="Sticky Note" position="top">
            <div className="default p-3 rounded-full flex items-center cursor-pointer"
                onDragStart={(event) => onDragStart(event, 'stickyNote')} draggable>
                <FaStickyNote color="#ffd43b" size={24} />
            </div>
        </Tooltip>
        <Tooltip label="Block" position="top">
            <div className="default p-3 rounded-full flex items-center  cursor-pointer"
                onDragStart={(event) => onDragStart(event, 'block')} draggable>
                <FaFile color="#aaa" size={24} />
            </div>
        </Tooltip>
    </aside>
}