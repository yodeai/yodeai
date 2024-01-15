import LoadingSkeleton from "./LoadingSkeleton"
import { FaHome } from "react-icons/fa"
import { Text, Breadcrumbs, Box } from "@mantine/core"
import { Fragment } from "react"
import Link from "next/link"


type BreadcrumbProps = {
    loading: boolean;
    breadcrumbs: { title: string, href?: string }[];
}
export const Breadcrumb = ({ loading, breadcrumbs }: BreadcrumbProps) => {
    return <Box className="fixed bottom-0 w-full flex flex-row gap-2 px-5 py-5 items-center align-middle bg-white border-t border-t-[#dddddd] ">
        {loading && <LoadingSkeleton boxCount={1} lineHeight={30} w={"300px"} />}
        {!loading && breadcrumbs.length && <>
            <FaHome size={18} className="inline p-0 m-0 mr-1 text-gray-400" />
            <Breadcrumbs separatorMargin={5} className="z-50 select-none">{
                breadcrumbs.map(({ title, href }, index) => (
                    <Fragment key={index}>
                        {href
                            ? <Link href={href} className="no-underline hover:underline" prefetch>
                                <Text size="sm" c="dimmed">{title}</Text>
                            </Link>
                            : <Text size="sm" c="dimmed">{title}</Text>
                        }
                    </Fragment>
                ))}
            </Breadcrumbs>
        </>}
    </Box>
}