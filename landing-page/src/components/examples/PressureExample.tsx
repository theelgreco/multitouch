import { useCallback, useRef } from "react";
import "./PressureExample.css";
import { useTrackpadListener, type TrackpadCallback } from "../../hooks/useTrackpad";
import { useEventListener } from "../../hooks/useEventListener";

export default function PressureExample() {
    const pressurePlateRef = useRef<HTMLDivElement>(null);
    const finger1Ref = useRef<HTMLDivElement>(null);

    const pressureCallback = useCallback<TrackpadCallback>((e) => {
        const fingers = e.detail.fingers;
        const f1 = fingers[0];

        if (!fingers.length) {
            if (finger1Ref.current) finger1Ref.current.textContent = "Finger 1: --";
            if (pressurePlateRef.current) pressurePlateRef.current.style.setProperty("--pressure-opacity", "0");
        } else if (fingers.length === 1) {
            // Update debug info directly via refs (no state update)
            if (finger1Ref.current) {
                finger1Ref.current.textContent = `Finger 1: ${
                    f1 ? `x=${f1.position.x.toFixed(3)}, y=${f1.position.y.toFixed(3)}, pressure=${f1.unk2}` : "--"
                }`;
            }

            if (pressurePlateRef.current) {
                pressurePlateRef.current.style.setProperty("--pressure-opacity", `${Math.min(f1.unk2, 1)}`);
            }
        }
    }, []);

    useTrackpadListener(pressurePlateRef, pressureCallback);

    useEventListener("mouseleave", pressurePlateRef, () => {
        requestAnimationFrame(() => {
            if (finger1Ref.current) finger1Ref.current.textContent = "Finger 1: --";
            if (pressurePlateRef.current) pressurePlateRef.current.style.setProperty("--pressure-opacity", "0");
        });
    });

    return (
        <div className="pressure-example">
            <h2>Pressure</h2>
            <p className="example-instructions">Hold with different pressures</p>
            <div className="pressure-container">
                <div ref={pressurePlateRef} className="pressure-plate"></div>
            </div>
            <div className="debug-panel">
                <div ref={finger1Ref} className="debug-info">
                    Finger 1:{" "}
                </div>
            </div>
        </div>
    );
}
