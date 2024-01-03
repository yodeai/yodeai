
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

export function timeAgo(input: any, lang: string = "en-US") {
    const date = input instanceof Date ? input : new Date(input);
    const rtf = new Intl.RelativeTimeFormat(lang, {
        numeric: "auto",
    });

    const dateInMilliseconds = date.getTime();
    const currentTimeInMilliseconds = Date.now();
    const timeDifferenceInMilliseconds = currentTimeInMilliseconds - dateInMilliseconds;

    const timeDifferenceInMinutes = Math.round(timeDifferenceInMilliseconds / 1000 / 60);

    if (timeDifferenceInMinutes < 1) {
        return "now";
    } else if (timeDifferenceInMinutes < 60) {
        return rtf.format(-timeDifferenceInMinutes, "minute");
    }

    const timeDifferenceInHours = Math.round(timeDifferenceInMinutes / 60);

    if (timeDifferenceInHours < 24) {
        return rtf.format(-timeDifferenceInHours, "hour");
    }

    const timeDifferenceInDays = Math.round(timeDifferenceInHours / 24);
    if (timeDifferenceInDays < 31) {
        return rtf.format(-timeDifferenceInDays, "day");
    }

    const timeDifferenceInMonths = Math.round(timeDifferenceInDays / 30);
    if (timeDifferenceInMonths < 12) {
        return rtf.format(-timeDifferenceInMonths, "month");
    }
    const timeDifferenceInYears = Math.round(timeDifferenceInMonths / 12);
    return rtf.format(-timeDifferenceInYears, "year");
}