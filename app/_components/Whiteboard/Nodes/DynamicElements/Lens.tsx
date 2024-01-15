import React, { useEffect, useState } from 'react'
import { cn } from '@utils/style'
import { Tables } from 'app/_types/supabase';
import { Box, Title } from '@mantine/core';
import { useDebouncedCallback } from '@utils/hooks';
import Link from 'next/link';
import { FaFolder } from 'react-icons/fa';

type LensElementProps = {
    lens_id: Tables<"lens">["lens_id"]
}

export const LensElement = ({ lens_id }: LensElementProps) => {
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
        {loading && !data && <Box className="h-48 w-64 px-3 py-5 flex flex-col gap-1">
            <div className="h-6 w-32 mb-4 animate-pulse bg-slate-300 rounded-md"></div>
            <div className="h-4 w-16 animate-pulse bg-slate-300 rounded-md"></div>
            <div className="h-4 w-32 animate-pulse bg-slate-300 rounded-md"></div>
            <div className="h-4 w-18 animate-pulse bg-slate-300 rounded-md"></div>
            <div className="h-4 w-28 animate-pulse bg-slate-300 rounded-md"></div>
        </Box>}

        {!loading && data?.lens_id && data &&
            <div className={cn("h-48 w-64 flex p-3")}>
                <Link href={`/lens/${data.lens_id}`} className="text-inherit no-underline" prefetch>
                    <Box p={0} m={0} className="flex flex-col gap-2 overflow-hidden">
                        <div className="flex gap-2 items-center">
                            <FaFolder size={16} color="gray" />
                            <Title order={5} className="text-gray-600 leading-3">{data.name}</Title>
                        </div>
                    </Box>
                </Link>
            </div>
        }
    </>
}