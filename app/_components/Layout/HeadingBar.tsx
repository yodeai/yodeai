"use client";

import Link from "next/link";
import UserAccountHandler from '../UserAccount';
import { AppShell, Burger, Image } from '@mantine/core';
import { useAppContext } from "@contexts/context";

export default function HeadingBar() {
    const {
        navbarDisclosure: [openedNavbar, navbarActions],
        toolbarDisclosure: [openedToolbar, toolbarActions],
    } = useAppContext();

    return (
        <AppShell.Header className="flex items-center align-middle">
            <Burger
                opened={openedNavbar}
                onClick={() => {
                    toolbarActions.close();
                    navbarActions.toggle();
                }}
                hiddenFrom="sm"
                size="sm"
            />
            <nav className="flex justify-between items-center w-full bg-white p-[12px] h-[60px] border-b border-b-[#eeeeee]">
                <Link href="/">
                    <Image src="/yodeai.png" h={32} alt="yodeai logo" />
                </Link>
                <UserAccountHandler />
            </nav>
        </AppShell.Header>
    );
}
