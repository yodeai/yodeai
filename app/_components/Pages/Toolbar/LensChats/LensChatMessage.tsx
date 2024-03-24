"use client";

import { ChatMessage } from 'app/_types/chat';
import { useAppContext } from "@contexts/context";
import { timeAgo } from '@utils/index';
import { cn } from '@utils/style';
import Gravatar from 'react-gravatar';


type LensChatMessageProps = {
    message: ChatMessage;
}
const LensChatMessage = (props: LensChatMessageProps) => {
    const { message } = props;
    const { user } = useAppContext();

    const selfMessage = message.users.id === user?.id;

    return <div className={
        cn("flex gap-1.5", selfMessage ? "justify-end" : "justify-start")
    }>
        <Gravatar email={message.users.email} size={32} className="rounded-md" />
        <div className={cn(
            "flex flex-col w-full p-2 border",
            selfMessage
                ? "bg-indigo-600 border-indigo-700 text-gray-200 rounded-s-xl rounded-se-xl"
                : "bg-gray-200 border-gray-300 text-gray-800 rounded-e-xl rounded-es-xl"
        )}>
            <div className="flex items-center justify-between">
                <span className="truncate text-sm font-semibold">{message.users.email}</span>
                <span className="truncate text-sm font-normal ">{timeAgo(message.created_at)}</span>
            </div>
            <p className="text-sm font-normal whitespace-break-spaces">{message.message.trim()}</p>
        </div>
    </div>
}

export default LensChatMessage;