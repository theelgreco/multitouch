import { useCallback, useRef } from "react";
import { useTrackpadListener, type TrackpadCallback } from "../../hooks/useTrackpad";
import type { Finger } from "../../types/trackpad";
import "./SliderExample.css";
import { useEventListener } from "../../hooks/useEventListener";

const startValue = 50;

export function SliderExample() {
    const sliderTrackRef = useRef<HTMLDivElement>(null);
    const sliderFillRef = useRef<HTMLDivElement>(null);
    const sliderThumbRef = useRef<HTMLDivElement>(null);
    const sliderValueRef = useRef<HTMLDivElement>(null);
    const finger1Ref = useRef<HTMLDivElement>(null);
    const finger2Ref = useRef<HTMLDivElement>(null);
    const distanceRef = useRef<HTMLDivElement>(null);

    const initialDistance = useRef<number | null>(null);
    const initialValue = useRef<number | null>(null);
    const value = useRef(50);

    const getFingerDistance = (f1: Finger, f2: Finger): number => {
        const dx = f1.position.x - f2.position.x;
        const dy = f1.position.y - f2.position.y;
        return Math.sqrt(dx * dx + dy * dy);
    };

    const handleTrackpad = useCallback<TrackpadCallback>((e) => {
        const fingers = e.detail.fingers;

        const f1 = fingers[0];
        const f2 = fingers[1];

        if (finger1Ref.current) {
            finger1Ref.current.textContent = `Finger 1: ${f1 ? `x=${f1.position.x.toFixed(3)}, y=${f1.position.y.toFixed(3)}` : "--"}`;
        }

        if (finger2Ref.current) {
            finger2Ref.current.textContent = `Finger 2: ${f2 ? `x=${f2.position.x.toFixed(3)}, y=${f2.position.y.toFixed(3)}` : "--"}`;
        }

        if (distanceRef.current) {
            distanceRef.current.textContent = `Distance: ${f1 && f2 ? getFingerDistance(f1, f2).toFixed(4) : "--"}`;
        }

        if (fingers.length === 2) {
            const distance = getFingerDistance(f1, f2);

            // Initialize on first two-finger touch
            if (initialDistance.current === null) {
                initialDistance.current = distance;
                initialValue.current = value.current;
            }

            // Calculate new value based on distance change
            const distanceDelta = distance - initialDistance.current;
            const sensitivity = 200;
            value.current = Math.max(0, Math.min(100, initialValue.current! + distanceDelta * sensitivity));

            if (sliderFillRef.current) sliderFillRef.current.style.width = `${value.current}%`;
            if (sliderThumbRef.current) sliderThumbRef.current.style.left = `${value.current}%`;
            if (sliderValueRef.current) sliderValueRef.current.textContent = `${Math.round(value.current)}%`;
        } else {
            initialDistance.current = null;
            initialValue.current = null;
        }
    }, []);

    useTrackpadListener(sliderTrackRef, handleTrackpad);
    useEventListener("mouseleave", sliderTrackRef, () => {
        requestAnimationFrame(() => {
            if (finger1Ref.current) finger1Ref.current.textContent = `Finger 1: --`;
            if (finger2Ref.current) finger2Ref.current.textContent = `Finger 2: --`;
            if (distanceRef.current) distanceRef.current.textContent = `Distance: --`;
        });
    });

    return (
        <div className="slider-example">
            <h2>Two-Finger Slider</h2>
            <p className="example-instructions">
                Use two fingers on your trackpad to control the slider. Spread apart to increase, pinch to decrease.
            </p>

            <div className="slider-container">
                <div ref={sliderTrackRef} className="slider-track">
                    <div ref={sliderFillRef} className="slider-fill" style={{ width: `${startValue}%` }} />
                    <div ref={sliderThumbRef} className="slider-thumb" style={{ left: `${startValue}%` }} />
                </div>
                <div ref={sliderValueRef} className="slider-value">
                    {Math.round(startValue)}%
                </div>
            </div>

            <div className="debug-panel">
                <div ref={finger1Ref} className="debug-info">
                    Finger 1: --
                </div>
                <div ref={finger2Ref} className="debug-info">
                    Finger 2: --
                </div>
                <div ref={distanceRef} className="debug-info" style={{ color: "var(--color-secondary)" }}>
                    Distance: --
                </div>
            </div>
        </div>
    );
}
