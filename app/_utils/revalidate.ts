
export const revalidate = (path: string) => {
    return fetch(`/api/revalidate?path=${path}`);
}