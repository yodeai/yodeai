"use client";

import { useCallback, useEffect, useMemo, useState } from "react"

import LoadingSkeleton from "./LoadingSkeleton"
import { FaHome } from "@react-icons/all-files/fa/FaHome"
import { Text, Breadcrumbs, Box } from "@mantine/core"
import { Fragment } from "react"
import Link from "next/link"
import { useAppContext } from "@contexts/context";

export const Breadcrumb = () => {
    const { lensId, breadcrumbActivePage } = useAppContext();

    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<({ name: string, lens_id: string }[])>(null);

    const getParents = useCallback(() => {
        if (!lensId) {
            setLoading(false);
            return;
        }

        return fetch(`/api/lens/${lensId}/getParents`)
            .then(res => {
                if (!res.ok) {
                    throw new Error("Couldn't get parents of the lens.")
                } else {
                    return res.json();
                }
            })
            .then(res => {
                setData(res.data)
            })
            .catch(err => {
                console.log(err.message);
            })
            .finally(() => {
                setLoading(false);
            })
    }, [lensId]);

    useEffect(() => {
        getParents();

        return () => {
            setData(null);
            setLoading(true);
        }
    }, [lensId])

    const breadcrumbs = useMemo(() => {
        let elements = [].concat(
            [{ title: 'Spaces', href: "/" }],
            (data || [])
                .map(({ name, lens_id }) => ({ title: name, href: `/lens/${lens_id}` })));
        return elements.concat(breadcrumbActivePage ? [breadcrumbActivePage] : [])
    }, [data, breadcrumbActivePage])

    return <Box className="fixed bottom-0 w-full flex flex-row gap-2 px-5 py-3 items-center align-middle bg-white border-t border-t-[#dddddd] ">
        {loading && <LoadingSkeleton boxCount={1} lineHeight={22} w={"300px"} />}
        {!loading && breadcrumbs.length && <>
            <FaHome size={18} className="inline p-0 m-0 mr-1 text-gray-400" />
            <Breadcrumbs classNames={{
                separator: "!text-gray-400",
                breadcrumb: "!text-gray-500 font-semibold",
            }} separatorMargin={5} className="z-50 select-none">{
                    breadcrumbs.map(({ title, href }, index) => (
                        <Fragment key={index}>
                            {href
                                ? <Link href={href} className="no-underline hover:underline text-inherit" prefetch={false}>
                                    <Text size="sm">{title}</Text>
                                </Link>
                                : <Text size="sm">{title}</Text>
                            }
                        </Fragment>
                    ))}
            </Breadcrumbs>
        </>}
    </Box>
}