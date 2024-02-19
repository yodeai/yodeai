import { useRouter } from "next/navigation";
import NProgress from "nprogress";

export const useProgressRouter = () => {
    const router = useRouter();
    const { push } = router;

    router.push = (href, options) => {
        NProgress.start();
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