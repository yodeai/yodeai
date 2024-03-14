import React, { useEffect, useState } from 'react'
import { cn } from '@utils/style'
import { Tables } from 'app/_types/supabase';
import { Box, Title } from '@mantine/core';
import { useDebouncedCallback } from 'app/_hooks/useDebouncedCallback';
import Link from 'next/link';
import { BiSolidChalkboard } from '@react-icons/all-files/bi/BiSolidChalkboard';
import { Node } from 'reactflow';

type WhiteboardElementProps = {
    whiteboard_id: Tables<"whiteboard">["whiteboard_id"]
    node: Node;
}

export const WhiteboardElement = ({ whiteboard_id, node }: WhiteboardElementProps) => {
    const [data, setData] = useState<Tables<"whiteboard">>();
    const [loading, setLoading] = useState(true);

    const getElementData = useDebouncedCallback(async () => {
        setLoading(true);
        fetch(`/api/whiteboard/${whiteboard_id}`)
            .then(res => res.json())
            .then(res => {
                if (res.ok) setData(res.data);
            })
            .catch(err => {
                console.log(err)
            })
            .finally(() => {
                setLoading(false);
            })
    }, 500, [whiteboard_id])

    useEffect(() => {
        if (!whiteboard_id) return;
        getElementData();
    }, [whiteboard_id]);

    return <>
        {loading && !data && <Box className="px-3 py-5 flex flex-col gap-1 justify-center items-center">
            <div className="h-6 w-32 mb-4 animate-pulse bg-slate-300 rounded-md"></div>
            <div className="h-32 w-44 mb-4 animate-pulse bg-slate-300 rounded-md"></div>
        </Box>}

        {!loading && data?.whiteboard_id && whiteboard_id &&
            <div className={cn("flex flex-col p-5 items-center justify-center")}>
                <Link href={`/whiteboard/${whiteboard_id}`} className="text-inherit no-underline hover:underline" prefetch={false}>
                    <Title order={4} c="gray.7">{data.name}</Title>
                </Link>
                <BiSolidChalkboard size={80} color="gray" />
            </div>
        }
    </>
}