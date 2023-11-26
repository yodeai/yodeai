import { useCallback, useRef } from 'react';

const useDebouncedCallback = <T extends (...args: any[]) => void>(
    callback: T,
    delay: number
) => {
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const debouncedCallback = useCallback(
        (...args: Parameters<T>) => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }

            timeoutRef.current = setTimeout(() => {
                callback(...args);
            }, delay);
        },
        [callback, delay]
    );

    return debouncedCallback;
};

export default useDebouncedCallback;
