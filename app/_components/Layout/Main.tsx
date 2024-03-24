"use client";

import { useAppContext } from '@contexts/context';
import { AppShell } from '@mantine/core';

type MainProps = {
    children: React.ReactNode;
}
export const Main = ({ children }: MainProps) => {
    const { layoutRefs } = useAppContext();

    return <AppShell.Main ref={layoutRefs.main}>
        {children}
    </AppShell.Main>
}