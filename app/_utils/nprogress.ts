import { useAppContext } from "@contexts/context";
import { useMediaQuery } from "@mantine/hooks";
import { useRouter } from "next/navigation";
import NProgress from "nprogress";

export const useProgressRouter = () => {
    const matchMobileView = useMediaQuery("(max-width: 768px)");
    const {
        navbarDisclosure: [openedNavbar, navbarActions],
        toolbarDisclosure: [openedToolbar, toolbarActions],
        user
    } = useAppContext();

    const router = useRouter();
    const { push } = router;

    router.push = (href, options) => {
        NProgress.start();
        push(href, options);
        if (matchMobileView) {
            navbarActions.close();
            toolbarActions.close();
        }
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                NProgress.done();
                resolve(true);
            }, 1500);
        });
    };

    return router;
};