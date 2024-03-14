import { useCallback, useRef } from 'react';

export const useDebouncedCallback = <T extends (...args: any[]) => void>(
    callback: T,
    delay: number,
    dependencies: any[] = []
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
        }, [callback, delay, ...dependencies]
    );

    return debouncedCallback;
};