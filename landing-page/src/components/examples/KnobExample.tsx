import { useState, useCallback, useRef } from "react";
import { useTrackpad } from "../../hooks/useTrackpad";
import type { Finger } from "../../types/trackpad";
import "./KnobExample.css";

const TICK_ANGLES = [-135, -90, -45, 0, 45, 90, 135, 180];

const getAngleBetweenFingers = (f1: Finger, f2: Finger): number => {
    const dx = f2.position.x - f1.position.x;
    const dy = f2.position.y - f1.position.y;
    return Math.atan2(dy, dx) * (180 / Math.PI);
};

const normalizeAngleDelta = (delta: number): number => {
    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;
    return delta;
};

const normalizeAngle = (angle: number): number => {
    let normalized = angle % 360;
    if (normalized < 0) normalized += 360;
    return normalized;
};

const getActiveTicks = (rot: number): Set<number> => {
    const indicatorAngle = normalizeAngle(rot);
    const active = new Set<number>();

    TICK_ANGLES.forEach((tickAngle) => {
        const normalizedTickAngle = normalizeAngle(tickAngle);
        let angleDiff = Math.abs(indicatorAngle - normalizedTickAngle);
        if (angleDiff > 180) angleDiff = 360 - angleDiff;
        if (angleDiff <= 22.5) {
            active.add(tickAngle);
        }
    });

    return active;
};

export function KnobExample() {
    const [rotation, setRotation] = useState(0);
    const [fingerInfo, setFingerInfo] = useState({ f1: "--", f2: "--", angle: "--" });
    const [activeTicks, setActiveTicks] = useState<Set<number>>(new Set([0]));

    const initialAngle = useRef<number | null>(null);
    const initialRotation = useRef(0);

    const handleTrackpad = useCallback(
        (fingers: Finger[]) => {
            const f1 = fingers[0];
            const f2 = fingers[1];

            setFingerInfo({
                f1: f1 ? `x=${f1.position.x.toFixed(3)}, y=${f1.position.y.toFixed(3)}` : "--",
                f2: f2 ? `x=${f2.position.x.toFixed(3)}, y=${f2.position.y.toFixed(3)}` : "--",
                angle: fingers.length === 2 ? `${getAngleBetweenFingers(f1, f2).toFixed(1)}°` : "--",
            });

            if (fingers.length === 2) {
                const currentAngle = getAngleBetweenFingers(f1, f2);

                if (initialAngle.current === null) {
                    initialAngle.current = currentAngle;
                    initialRotation.current = rotation;
                }

                const angleDelta = normalizeAngleDelta(currentAngle - initialAngle.current);
                const sensitivity = 2.5;
                const newRotation = initialRotation.current - angleDelta * sensitivity;

                setRotation(newRotation);
                setActiveTicks(getActiveTicks(newRotation));
            } else {
                initialAngle.current = null;
                initialRotation.current = rotation;
            }
        },
        [rotation]
    );

    useTrackpad(handleTrackpad);

    const displayValue = (() => {
        let val = rotation % 360;
        if (val < 0) val += 360;
        return Math.round(val);
    })();

    return (
        <div className="knob-example">
            <h2>Two-Finger Knob</h2>
            <p className="example-instructions">
                Use two fingers to rotate the knob like a dial. Rotate your fingers clockwise or counter-clockwise.
            </p>

            <div className="knob-container">
                <div className="knob-outer">
                    <div className="knob" style={{ transform: `rotate(${rotation}deg)` }}>
                        <div className="knob-indicator" />
                        {[0, 60, 120, 180, 240, 300].map((angle) => (
                            <div
                                key={angle}
                                className="knob-grip"
                                style={{
                                    transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(-45px)`,
                                }}
                            />
                        ))}
                    </div>
                </div>
                <div className="knob-ticks">
                    {TICK_ANGLES.map((angle) => (
                        <span
                            key={angle}
                            className={`tick ${activeTicks.has(angle) ? "active" : ""}`}
                            style={{
                                transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(-100px)`,
                            }}
                        />
                    ))}
                </div>
            </div>

            <div className="value-display">
                <span className="value-label">Value</span>
                <span className="value-number">{displayValue}°</span>
            </div>

            <div className="debug-panel">
                <div className="debug-info">Finger 1: {fingerInfo.f1}</div>
                <div className="debug-info">Finger 2: {fingerInfo.f2}</div>
                <div className="debug-info" style={{ color: "var(--color-secondary)" }}>
                    Rotation Angle: {fingerInfo.angle}
                </div>
            </div>
        </div>
    );
}
