import { useEffect } from 'react';
import { render } from 'react-dom';

type usePortalProps = {
    children: JSX.Element;
    containerSelector?: string
}
export const usePortal = ({ children, containerSelector }: usePortalProps, dependencies: any[]) => {
    useEffect(() => {
        const container = document.querySelector(containerSelector);
        if (container) {
            render(children, container);
        }

        const observer = new MutationObserver(() => {
            const updatedContainer = document.querySelector(containerSelector);
            if (updatedContainer) {
                render(children, updatedContainer);
            }
        });

        observer.observe(document.body, { childList: true });

        return () => {
            observer.disconnect();
        };
    }, dependencies);

    return null;
}