import { useEffect, useRef, type RefObject } from "react";
import type { TrackpadEvent } from "../types/trackpad";

export type TrackpadCallback = (e: TrackpadEvent) => void;

export function useTrackpad() {
    const positionRef = useRef({ x: 0, y: 0 });

    useEffect(() => {
        const dispatchTrackpadAt = (x: number, y: number, e: TrackpadEvent) => {
            document.elementFromPoint(x, y)?.dispatchEvent(
                new CustomEvent("trackpad:element", {
                    detail: e.detail,
                    bubbles: true,
                    composed: true,
                    cancelable: true,
                })
            );
        };
        const handleTrackpad = (e: TrackpadEvent) => {
            dispatchTrackpadAt(positionRef.current.x, positionRef.current.y, e);
        };
        const handleMouseMove = (e: MouseEvent) => {
            positionRef.current = { x: e.clientX, y: e.clientY };
        };

        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("trackpad", handleTrackpad);

        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("trackpad", handleTrackpad);
        };
    }, []);
}

export function useTrackpadListener(elementRef: RefObject<HTMLElement | null>, callback: TrackpadCallback) {
    const rafId = useRef(0);

    useEffect(() => {
        const element = elementRef.current;
        if (!element) return;

        const preventWheel = (e: WheelEvent) => e.preventDefault();
        const preventGesture = (e: Event) => e.preventDefault();

        const animCb: TrackpadCallback = (e) => {
            if (rafId.current) cancelAnimationFrame(rafId.current);

            rafId.current = requestAnimationFrame(() => {
                callback(e);
            });
        };

        element.addEventListener("trackpad:element", animCb);
        element.addEventListener("wheel", preventWheel, { passive: false });
        element.addEventListener("gesturestart", preventGesture, { passive: false });

        return () => {
            element.removeEventListener("trackpad:element", animCb);
            element.removeEventListener("wheel", preventWheel);
            element.removeEventListener("gesturestart", preventGesture);
        };
    }, [callback]);

    // Cleanup animation frame on unmount
    useEffect(() => {
        return () => {
            if (rafId.current) {
                cancelAnimationFrame(rafId.current);
            }
        };
    }, []);
}
