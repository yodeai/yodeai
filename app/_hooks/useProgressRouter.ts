import { useAppContext } from "@contexts/context";
import { useMediaQuery } from "@mantine/hooks";
import { useRouter } from "next/navigation";
import { getPagePathVersion } from '../_utils/localStorage';

export const useProgressRouter = () => {
    const matchMobileView = useMediaQuery("(max-width: 768px)");
    const {
        navbarDisclosure: [openedNavbar, navbarActions],
        toolbarDisclosure: [openedToolbar, toolbarActions]
    } = useAppContext();

    const router = useRouter();
    const { push } = router;

    router.push = (href, options) => {
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