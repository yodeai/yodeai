import { useAppContext } from "@contexts/context";
import { useMediaQuery } from "@mantine/hooks";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { getPagePathVersion } from '@utils/localStorage';
import { nprogress } from '@mantine/nprogress';
import { useEffect } from "react";

export const useProgressRouter = () => {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const matchMobileView = useMediaQuery("(max-width: 768px)");

    const {
        navbarDisclosure: [openedNavbar, navbarActions],
        toolbarDisclosure: [openedToolbar, toolbarActions]
    } = useAppContext();

    const router = useRouter();
    const { push } = router;

    useEffect(() => {
        nprogress.complete();
    }, [pathname, searchParams])

    router.push = (href, options) => {
        nprogress.reset();
        nprogress.start();

        const getPagePathVersionValue = getPagePathVersion(href);
        href = getPagePathVersionValue ? `${href}?v=${getPagePathVersionValue}` : href;

        push(href, options);
        if (matchMobileView) {
            navbarActions.close();
            toolbarActions.close();
        }
    };

    return router;
};