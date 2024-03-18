import { setPagePathVersion } from "./localStorage";

export const revalidateRouterCache = (path: string, type?: "page" | "layout") => {
    const version = `${Math.random().toString(36).substring(7)}`;
    setPagePathVersion(path, version);

    return fetch(`/api/revalidate?path=${path}&type=${type || "page"}`);
}