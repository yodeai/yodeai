import { MantineProvider } from '@mantine/core';
import React, { useEffect } from 'react';
import { render } from 'react-dom';
import { createRoot } from 'react-dom/client';

type usePortalProps = {
    children: JSX.Element;
    containerSelector?: string
}
export const usePortal = ({ children, containerSelector }: usePortalProps, dependencies: any[]) => {
    useEffect(() => {
        if (document.querySelector(containerSelector)) {
            const container = document.querySelector(containerSelector);
            render(children, container);
        }
    }, [dependencies])

    return null;
}