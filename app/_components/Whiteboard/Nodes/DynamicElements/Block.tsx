import React, { useEffect, useState } from 'react'
import { cn } from '@utils/style'
import { Tables } from 'app/_types/supabase';
import { Box, Title, Text } from '@mantine/core';
import { useDebouncedCallback } from '@utils/hooks';
import Link from 'next/link';
import { FaFile } from 'react-icons/fa';

type BlockElementProps = {
    block_id: Tables<"block">["block_id"]
}

export const BlockElement = ({ block_id }: BlockElementProps) => {
    const [data, setData] = useState<Tables<"block">>();
    const [loading, setLoading] = useState(true);

    const getElementData = useDebouncedCallback(async () => {
        setLoading(true);
        fetch(`/api/whiteboard/block/${block_id}`)
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
    }, 500, [block_id])

    useEffect(() => {
        if (!block_id) return;
        getElementData();
    }, [block_id]);

    return <>
        {loading && !data && <Box className="h-48 w-64 px-3 py-5 flex flex-col gap-1">
            <div className="h-6 w-32 mb-4 animate-pulse bg-slate-300 rounded-md"></div>
            <div className="h-4 w-16 animate-pulse bg-slate-300 rounded-md"></div>
            <div className="h-4 w-32 animate-pulse bg-slate-300 rounded-md"></div>
            <div className="h-4 w-18 animate-pulse bg-slate-300 rounded-md"></div>
            <div className="h-4 w-28 animate-pulse bg-slate-300 rounded-md"></div>
        </Box>}

        {!loading && data?.block_id && data &&
            <div className={cn("h-48 w-64 flex p-3")}>
                <Link href={`/block/${data.block_id}`} className="text-inherit no-underline" prefetch>
                    <Box p={0} m={0} className="flex flex-col gap-2 overflow-hidden">
                        <div className="flex gap-2 items-center">
                            <FaFile size={16} color="gray" />
                            <Title order={5} className="text-gray-600 leading-3">{data.title}</Title>
                        </div>
                        <Text size="14px" c="gray.6">{data.preview}</Text>
                    </Box>
                </Link>
            </div>
        }
    </>
}