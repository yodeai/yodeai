import React, { useEffect, useState } from 'react'
import { cn } from '@utils/style'
import { Tables } from 'app/_types/supabase';
import { Box, Title } from '@mantine/core';
import { useDebouncedCallback } from '@utils/hooks';
import Link from 'next/link';
import { FaFolder } from 'react-icons/fa';
import { Node } from 'reactflow';

type LensElementProps = {
    lens_id: Tables<"lens">["lens_id"]
    node: Node;
}

export const LensElement = ({ lens_id, node }: LensElementProps) => {
    const [data, setData] = useState<Tables<"lens">>();
    const [loading, setLoading] = useState(true);

    const getElementData = useDebouncedCallback(async () => {
        setLoading(true);
        fetch(`/api/lens/${lens_id}`)
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
    }, 500, [lens_id])

    useEffect(() => {
        if (!lens_id) return;
        getElementData();
    }, [lens_id]);

    return <>
        {loading && !data && <Box className="px-3 py-5 flex flex-col gap-1">
            <div className="h-6 w-32 mb-4 animate-pulse bg-slate-300 rounded-md"></div>
            <div className="h-4 w-16 animate-pulse bg-slate-300 rounded-md"></div>
            <div className="h-4 w-32 animate-pulse bg-slate-300 rounded-md"></div>
            <div className="h-4 w-18 animate-pulse bg-slate-300 rounded-md"></div>
        </Box>}

        {!loading && data?.lens_id && data &&
            <div className={cn("flex p-3")}>
                <Box p={0} m={0} className="flex flex-col gap-2 overflow-hidden">
                    <div className="flex gap-2 items-center">
                        <FaFolder size={16} color="gray" />
                        <Link href={`/lens/${data.lens_id}`} className="text-inherit no-underline hover:underline" prefetch>
                            <Title order={5} className="text-gray-600 leading-3">{data.name}</Title>
                        </Link>
                    </div>
                </Box >
            </div >
        }
    </>
}