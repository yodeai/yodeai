import React, { useEffect,  useState } from 'react'
import { cn } from '@utils/style'
import { Tables } from 'app/_types/supabase';
import { Box, Title } from '@mantine/core';
import { useDebouncedCallback } from '@utils/hooks';
import Link from 'next/link';
import { BiSolidChalkboard } from 'react-icons/bi';

type WhiteboardElementProps = {
    whiteboard_id: Tables<"whiteboard">["whiteboard_id"]
}

export const WhiteboardElement = ({ whiteboard_id }: WhiteboardElementProps) => {
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
        {loading && !data && <Box className="h-48 w-64 px-3 py-5 flex flex-col gap-1 justify-center items-center">
            <div className="h-6 w-32 mb-4 animate-pulse bg-slate-300 rounded-md"></div>
            <div className="h-32 w-44 mb-4 animate-pulse bg-slate-300 rounded-md"></div>
        </Box>}

        {!loading && data?.whiteboard_id && whiteboard_id && <Link href={`/whiteboard/${whiteboard_id}`} className="text-inherit no-underline" prefetch>
            <div className={cn("h-48 w-64 flex flex-col px-3 items-center justify-center")}>
                <Title order={4} c="gray.7">{data.name}</Title>
                <BiSolidChalkboard size={80} color="gray" />
            </div>
        </Link>}
    </>
}