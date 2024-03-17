import { useRouter } from "next/navigation";
import NProgress from "nprogress";
import { getPagePathVersion } from '../_utils/localStorage';

export const useProgressRouter = () => {
    const router = useRouter();
    const { push } = router;

    router.push = (href, options) => {
        NProgress.start();

        const getPagePathVersionValue = getPagePathVersion(href);
        href = getPagePathVersionValue ? `${href}?v=${getPagePathVersionValue}` : href;

        push(href, options);
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                NProgress.done();
                resolve(true);
            }, 1500);
        });
    };

    return router;
};