
export const revalidate = (path: string, type?: "page" | "layout") => {
    return fetch(`/api/revalidate?path=${path}&type=${type || "page"}`);
}