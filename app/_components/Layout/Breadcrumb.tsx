"use client";

import { useCallback, useEffect, useMemo, useState } from "react"

import LoadingSkeleton from "../LoadingSkeleton"
import { FaHome } from "@react-icons/all-files/fa/FaHome"
import { FaAngleLeft } from "@react-icons/all-files/fa/FaAngleLeft";
import { Text, Breadcrumbs, Box, AppShell, Burger } from "@mantine/core"
import { Fragment } from "react"
import Link from "next/link"
import { useAppContext } from "@contexts/context";
import { useMediaQuery } from "@mantine/hooks";

export const Breadcrumb = () => {
    const matchMobileView = useMediaQuery("(max-width: 768px)");
    const {
        lensId, breadcrumbActivePage,
        toolbarDisclosure: [toolbarOpened, toolbarActions],
        navbarDisclosure: [navbarOpened, navbarActions],
    } = useAppContext();

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

    const breadcrumView = useMemo(() => {
        const latestElement = breadcrumbs[breadcrumbs.length - (breadcrumbActivePage ? 3 : 2)];

        if (matchMobileView && breadcrumbs.length && latestElement) return <>
            {/* show the latest breadcrumb */}
            <Link href={latestElement.href} className="flex items-center align-middle no-underline hover:underline text-inherit">
                <FaAngleLeft size={18} className="inline p-0 m-0 mr-1 text-gray-500" />
                <Text size="sm" className="!text-gray-500">{latestElement.title}</Text>
            </Link>
            {breadcrumbActivePage && <Text size="sm" className="!text-gray-500"> / {breadcrumbActivePage.title}</Text>}
        </>

        return breadcrumbs.length && <>
            <Link href="/" className="inline p-0 m-0 mr-1 h-[18px]">
                <FaHome size={18} className="text-gray-400" />
            </Link>
            <Breadcrumbs classNames={{
                separator: "!text-gray-400",
                breadcrumb: "!text-gray-500 font-semibold",
            }} separatorMargin={5} className="z-50 select-none">{
                    breadcrumbs.map(({ title, href }, index) => (
                        <Fragment key={index}>
                            {href
                                ? <Link href={href} className="no-underline hover:underline text-inherit" prefetch>
                                    <Text size="sm">{title}</Text>
                                </Link>
                                : <Text size="sm">{title}</Text>
                            }
                        </Fragment>
                    ))}
            </Breadcrumbs>
        </>
    }, [breadcrumbs, matchMobileView])

    return <AppShell.Footer p="md" className="flex flex-row justify-between">
        <Box className="flex flex-row items-center align-middle gap-2">
            {loading && <LoadingSkeleton boxCount={1} lineHeight={22} w={"300px"} />}
            {!loading && breadcrumView}
        </Box>
    </AppShell.Footer>
}