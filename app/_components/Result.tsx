import { Text, Title } from "@mantine/core"
import { useEffect } from "react"
import { useRouter } from "next/navigation"

type ResultProps = {
    title?: string
    description?: string
    icon: JSX.Element
    refreshInvervally?: boolean
}
export const Result = ({
    title,
    description,
    icon,
    refreshInvervally = false
}: ResultProps) => {
    const router = useRouter()
    const refreshEvery = 5000; // in ms

    useEffect(() => {
        if (refreshInvervally) {
            const interval = setInterval(() => router.refresh(), refreshEvery)
            return () => clearInterval(interval)
        }
    }, [])

    return (
        <div className="container p-16">
            <div className="flex flex-row items-center gap-2">
                {icon}
                <Title order={2}>{title}</Title>
            </div>
            <Text size="xl" className="block" c="gray.7">{description}</Text>
        </div>
    )
}