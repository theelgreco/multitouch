import { useEffect, type RefObject } from "react";

type UseMouseLeaveCallback = (e: Event) => void;

export function useEventListener(
    event: keyof HTMLElementEventMap,
    elementRef: RefObject<HTMLElement | null>,
    callback: UseMouseLeaveCallback
) {
    useEffect(() => {
        const element = elementRef.current;
        if (!element) return;

        element.addEventListener(event, callback);

        return () => {
            element.removeEventListener(event, callback);
        };
    }, [callback]);
}
