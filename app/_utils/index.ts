
export const truncateText = (text: string, {
    from,
    maxLength = 16
}: {
    from: "start" | "center" | "end",
    maxLength?: number
}) => {
    if (text.length > maxLength) {
        switch (from) {
            case "start":
                return text.slice(0, 16) + "...";
            case "center":
                return text.slice(0, 8) + " ..." + text.slice(text.length - 4);
            case "end":
                return "..." + text.slice(text.length - maxLength);
        }
    }

    return text;
}