import { useEffect } from "react";
import type { TrackpadEvent, Finger } from "../types/trackpad";

type TrackpadCallback = (fingers: Finger[], event: TrackpadEvent) => void;

export function useTrackpad(callback: TrackpadCallback) {
    useEffect(() => {
        const handleTrackpad = (e: TrackpadEvent) => {
            callback(e.detail.fingers, e);
        };

        // Prevent default gestures
        const preventWheel = (e: WheelEvent) => e.preventDefault();
        const preventGesture = (e: Event) => e.preventDefault();

        window.addEventListener("trackpad", handleTrackpad);
        window.addEventListener("wheel", preventWheel, { passive: false });
        window.addEventListener("gesturestart", preventGesture, { passive: false });

        return () => {
            window.removeEventListener("trackpad", handleTrackpad);
            window.removeEventListener("wheel", preventWheel);
            window.removeEventListener("gesturestart", preventGesture);
        };
    }, [callback]);
}
