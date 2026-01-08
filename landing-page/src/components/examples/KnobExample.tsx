import { useCallback, useRef } from "react";
import { useTrackpadListener, type TrackpadCallback } from "../../hooks/useTrackpad";
import type { Finger } from "../../types/trackpad";
import "./KnobExample.css";
import { useEventListener } from "../../hooks/useEventListener";

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

// Pre-compute tick angle data for faster lookup
const TICK_DATA = TICK_ANGLES.map((angle) => ({
    angle,
    normalized: normalizeAngle(angle),
}));

const getActiveTickIndex = (rot: number): number => {
    const indicatorAngle = normalizeAngle(rot);
    for (let i = 0; i < TICK_DATA.length; i++) {
        let angleDiff = Math.abs(indicatorAngle - TICK_DATA[i].normalized);
        if (angleDiff > 180) angleDiff = 360 - angleDiff;
        if (angleDiff <= 22.5) {
            return i;
        }
    }
    return -1;
};

export function KnobExample() {
    const rotationRef = useRef(0);
    const initialAngle = useRef<number | null>(null);
    const initialRotation = useRef(0);
    const lastActiveTickIndex = useRef(4);
    const containerRef = useRef<HTMLDivElement>(null);
    const knobRef = useRef<HTMLDivElement>(null);
    const finger1Ref = useRef<HTMLDivElement>(null);
    const finger2Ref = useRef<HTMLDivElement>(null);
    const angleRef = useRef<HTMLDivElement>(null);
    const valueRef = useRef<HTMLSpanElement>(null);
    const tickRefs = useRef<(HTMLSpanElement | null)[]>([]);

    const handleTrackpad = useCallback<TrackpadCallback>((e) => {
        const fingers = e.detail.fingers;
        const f1 = fingers[0];
        const f2 = fingers[1];

        // Update debug info directly via refs (no state update)
        if (finger1Ref.current) {
            finger1Ref.current.textContent = `Finger 1: ${f1 ? `x=${f1.position.x.toFixed(3)}, y=${f1.position.y.toFixed(3)}` : "--"}`;
        }
        if (finger2Ref.current) {
            finger2Ref.current.textContent = `Finger 2: ${f2 ? `x=${f2.position.x.toFixed(3)}, y=${f2.position.y.toFixed(3)}` : "--"}`;
        }
        if (angleRef.current) {
            angleRef.current.textContent = `Rotation Angle: ${
                fingers.length === 2 ? `${getAngleBetweenFingers(f1, f2).toFixed(1)}°` : "--"
            }`;
        }

        if (fingers.length === 2) {
            const currentAngle = getAngleBetweenFingers(f1, f2);

            if (initialAngle.current === null) {
                initialAngle.current = currentAngle;
                initialRotation.current = rotationRef.current;
            }

            const angleDelta = normalizeAngleDelta(currentAngle - initialAngle.current);
            const sensitivity = 2.5;
            const newRotation = initialRotation.current - angleDelta * sensitivity;
            rotationRef.current = newRotation;

            // Update knob rotation directly
            if (knobRef.current) {
                knobRef.current.style.transform = `rotate(${newRotation}deg)`;
            }

            // Calculate display value
            let val = newRotation % 360;
            if (val < 0) val += 360;
            const roundedVal = Math.round(val);

            // Update value display directly
            if (valueRef.current) {
                valueRef.current.textContent = `${roundedVal}°`;
            }

            // Update active tick directly via DOM
            const newActiveIndex = getActiveTickIndex(newRotation);
            if (newActiveIndex !== lastActiveTickIndex.current) {
                // Remove active class from previous tick
                if (lastActiveTickIndex.current >= 0 && tickRefs.current[lastActiveTickIndex.current]) {
                    tickRefs.current[lastActiveTickIndex.current]!.classList.remove("active");
                }
                // Add active class to new tick
                if (newActiveIndex >= 0 && tickRefs.current[newActiveIndex]) {
                    tickRefs.current[newActiveIndex]!.classList.add("active");
                }
                lastActiveTickIndex.current = newActiveIndex;
            }
        } else {
            initialAngle.current = null;
            initialRotation.current = rotationRef.current;
        }
    }, []);

    useTrackpadListener(knobRef, handleTrackpad);
    useEventListener("mouseleave", knobRef, () => {
        requestAnimationFrame(() => {
            if (finger1Ref.current) finger1Ref.current.textContent = "Finger 1: --";
            if (finger2Ref.current) finger2Ref.current.textContent = "Finger 2: --";
        });
    });

    return (
        <div ref={containerRef} className="knob-example">
            <h2>Two-Finger Knob</h2>
            <p className="example-instructions">
                Use two fingers to rotate the knob like a dial. Rotate your fingers clockwise or counter-clockwise.
            </p>

            <div className="knob-container">
                <div className="knob-outer">
                    <div ref={knobRef} className="knob" style={{ willChange: "transform" }}>
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
                    {TICK_ANGLES.map((angle, index) => (
                        <span
                            key={angle}
                            ref={(el) => {
                                tickRefs.current[index] = el;
                            }}
                            className={`tick ${index === 3 ? "active" : ""}`}
                            style={{
                                transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(-100px)`,
                            }}
                        />
                    ))}
                </div>
            </div>

            <div className="value-display">
                <span className="value-label">Value</span>
                <span ref={valueRef} className="value-number">
                    0°
                </span>
            </div>

            <div className="debug-panel">
                <div ref={finger1Ref} className="debug-info">
                    Finger 1: --
                </div>
                <div ref={finger2Ref} className="debug-info">
                    Finger 2: --
                </div>
                <div ref={angleRef} className="debug-info" style={{ color: "var(--color-secondary)" }}>
                    Rotation Angle: --
                </div>
            </div>
        </div>
    );
}
