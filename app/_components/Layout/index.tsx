'use client';

import { Toaster } from "react-hot-toast";
import HeadingBar from "@components/Layout/HeadingBar";
import { Flex, AppShell } from '@mantine/core';

import { useAppContext } from '@contexts/context';

type AppLayoutProps = {
    children: React.ReactNode;
};
export default function AppLayout({ children }: AppLayoutProps) {
    const {
        navbarDisclosure: [openedNavbar],
        toolbarDisclosure: [openedToolbar]
    } = useAppContext();

    return <AppShell
        header={{ height: 60 }}
        navbar={{
            width: 260,
            breakpoint: 'sm',
            collapsed: {
                mobile: !openedNavbar,
                desktop: openedNavbar
            },
        }}
        aside={{
            width: openedToolbar ? 465 : 65,
            breakpoint: 'sm',
            collapsed: {
                mobile: !openedToolbar
            }
        }}
        footer={{ height: 60 }}
    >
        <HeadingBar />
        <Toaster />
        {children}
    </AppShell>
}
