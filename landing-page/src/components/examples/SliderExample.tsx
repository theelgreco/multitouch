import { useState, useCallback, useRef } from "react";
import { useTrackpad } from "../../hooks/useTrackpad";
import type { Finger } from "../../types/trackpad";
import "./SliderExample.css";

export function SliderExample() {
    const [value, setValue] = useState(50);
    const [fingerInfo, setFingerInfo] = useState({ f1: "--", f2: "--", distance: "--" });

    const initialDistance = useRef<number | null>(null);
    const initialValue = useRef(50);

    const getFingerDistance = (f1: Finger, f2: Finger): number => {
        const dx = f1.position.x - f2.position.x;
        const dy = f1.position.y - f2.position.y;
        return Math.sqrt(dx * dx + dy * dy);
    };

    const handleTrackpad = useCallback(
        (fingers: Finger[]) => {
            // Update finger display
            const f1 = fingers[0];
            const f2 = fingers[1];

            setFingerInfo({
                f1: f1 ? `x=${f1.position.x.toFixed(3)}, y=${f1.position.y.toFixed(3)}` : "--",
                f2: f2 ? `x=${f2.position.x.toFixed(3)}, y=${f2.position.y.toFixed(3)}` : "--",
                distance: fingers.length === 2 ? getFingerDistance(f1, f2).toFixed(4) : "--",
            });

            // Two-finger slider control
            if (fingers.length === 2) {
                const distance = getFingerDistance(f1, f2);

                // Initialize on first two-finger touch
                if (initialDistance.current === null) {
                    initialDistance.current = distance;
                    initialValue.current = value;
                }

                // Calculate new value based on distance change
                const distanceDelta = distance - initialDistance.current;
                const sensitivity = 200;
                const newValue = Math.max(0, Math.min(100, initialValue.current + distanceDelta * sensitivity));

                setValue(newValue);
            } else {
                // Reset when not using two fingers
                initialDistance.current = null;
                initialValue.current = value;
            }
        },
        [value]
    );

    useTrackpad(handleTrackpad);

    return (
        <div className="slider-example">
            <h2>Two-Finger Slider</h2>
            <p className="example-instructions">
                Use two fingers on your trackpad to control the slider. Spread apart to increase, pinch to decrease.
            </p>

            <div className="slider-container">
                <div className="slider-track">
                    <div className="slider-fill" style={{ width: `${value}%` }} />
                    <div className="slider-thumb" style={{ left: `${value}%` }} />
                </div>
                <div className="slider-value">{Math.round(value)}%</div>
            </div>

            <div className="debug-panel">
                <div className="debug-info">Finger 1: {fingerInfo.f1}</div>
                <div className="debug-info">Finger 2: {fingerInfo.f2}</div>
                <div className="debug-info" style={{ color: "var(--color-secondary)" }}>
                    Distance: {fingerInfo.distance}
                </div>
            </div>
        </div>
    );
}
