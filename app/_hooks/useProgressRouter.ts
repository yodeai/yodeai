import { useAppContext } from "@contexts/context";
import { useMediaQuery } from "@mantine/hooks";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { nprogress } from '@mantine/nprogress';
import { useEffect, useMemo, useRef } from "react";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

export type ProgressRouterInstance = AppRouterInstance & {
    revalidate: () => void;
}

export const useProgressRouter = () => {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const matchMobileView = useMediaQuery("(max-width: 768px)");
    const $prevRoute = useRef<string | null>("/");

    const {
        navbarDisclosure: [openedNavbar, navbarActions],
        toolbarDisclosure: [openedToolbar, toolbarActions]
    } = useAppContext();

    const router = useRouter() as ProgressRouterInstance;

    useEffect(() => {
        nprogress.complete();
    }, [pathname, searchParams]);

    const routerPush = useMemo(() => router.push, [pathname]);
    
    router.push = (href, options) => {
        nprogress.reset();
        nprogress.start();

        $prevRoute.current = window.location.pathname;
        routerPush(href, options);

        if (matchMobileView) {
            navbarActions.close();
            toolbarActions.close();
        }
    };

    router.revalidate = () => {
        router.refresh();
        router.prefetch($prevRoute.current);
    }

    return router;
};