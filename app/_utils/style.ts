import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function getInnerHeight(elm: HTMLElement) {
    if(!elm) return 0;
    var computed = getComputedStyle(elm),
        padding = parseInt(computed.paddingTop) + parseInt(computed.paddingBottom);

    return elm.clientHeight - padding
}

export const getInnerWidth = (elm: HTMLElement) => {
    if(!elm) return 0;
    var computed = getComputedStyle(elm),
        padding = parseInt(computed.paddingLeft) + parseInt(computed.paddingRight);

    return elm.clientWidth - padding
}