
export const removeNullValues = (obj: Record<string, unknown>) => {
    for (const key in obj) {
        if (obj[key] === null) {
            delete obj[key];
        }
    }
    return obj;
}