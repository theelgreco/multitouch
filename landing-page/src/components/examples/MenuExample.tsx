import { useState, useCallback, useRef } from "react";
import { useTrackpad } from "../../hooks/useTrackpad";
import type { Finger } from "../../types/trackpad";
import "./MenuExample.css";

const MENU_HEIGHT = 300;
const HANDLE_HEIGHT = 37;
const HIDDEN_OFFSET = MENU_HEIGHT - HANDLE_HEIGHT;

export function MenuExample() {
    const [menuOffset, setMenuOffset] = useState(HIDDEN_OFFSET);
    const [isOpen, setIsOpen] = useState(false);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [fingerInfo, setFingerInfo] = useState({ f1: "--", f2: "--", swipe: "--" });

    const isGestureActive = useRef(false);
    const gestureStartY = useRef<number | null>(null);
    const menuOpenRef = useRef(false);

    const getAverageY = (f1: Finger, f2: Finger): number => {
        return (f1.position.y + f2.position.y) / 2;
    };

    const isInStartRegion = (f1: Finger, f2: Finger): boolean => {
        const avgX = (f1.position.x + f2.position.x) / 2;
        const avgY = (f1.position.y + f2.position.y) / 2;
        return avgY < -0.3 && avgX > -0.4 && avgX < 0.4;
    };

    const snapMenu = (currentOffset: number) => {
        setIsTransitioning(true);

        if (currentOffset < HIDDEN_OFFSET / 2) {
            setMenuOffset(0);
            setIsOpen(true);
            menuOpenRef.current = true;
        } else {
            setMenuOffset(HIDDEN_OFFSET);
            setIsOpen(false);
            menuOpenRef.current = false;
        }

        setTimeout(() => setIsTransitioning(false), 300);
    };

    const handleTrackpad = useCallback(
        (fingers: Finger[]) => {
            const f1 = fingers[0];
            const f2 = fingers[1];

            setFingerInfo({
                f1: f1 ? `y=${f1.position.y.toFixed(3)}` : "--",
                f2: f2 ? `y=${f2.position.y.toFixed(3)}` : "--",
                swipe: "--",
            });

            if (fingers.length === 2) {
                const currentY = getAverageY(f1, f2);

                if (!isGestureActive.current) {
                    if (menuOpenRef.current || isInStartRegion(f1, f2)) {
                        isGestureActive.current = true;
                        gestureStartY.current = currentY;
                        setIsTransitioning(false);
                    }
                }

                if (gestureStartY.current !== null && isGestureActive.current) {
                    const swipeDelta = currentY - gestureStartY.current;
                    const sensitivity = 600;
                    const baseOffset = menuOpenRef.current ? 0 : HIDDEN_OFFSET;
                    const newOffset = Math.max(0, Math.min(HIDDEN_OFFSET, baseOffset - swipeDelta * sensitivity));

                    setMenuOffset(newOffset);

                    const direction = swipeDelta > 0 ? "↑ up" : swipeDelta < 0 ? "↓ down" : "—";
                    setFingerInfo((prev) => ({
                        ...prev,
                        swipe: `${direction} (${(swipeDelta * 100).toFixed(1)})`,
                    }));
                }
            } else {
                if (isGestureActive.current) {
                    isGestureActive.current = false;
                    gestureStartY.current = null;
                    snapMenu(menuOffset);
                }
            }
        },
        [menuOffset]
    );

    useTrackpad(handleTrackpad);

    const translatePercent = (menuOffset / MENU_HEIGHT) * 100;
    const visiblePercent = Math.round((1 - menuOffset / HIDDEN_OFFSET) * 100);

    return (
        <div className="menu-example">
            <h2>Gesture Menu</h2>
            <p className="example-instructions">Swipe up with two fingers from the bottom-center of your trackpad to reveal the menu.</p>

            <div className="menu-demo-area">
                <div className="gesture-hint">
                    <div className="arrow-up" />
                    <span>Swipe Up</span>
                </div>

                <div
                    className={`demo-menu ${isOpen ? "open" : ""} ${isTransitioning ? "transitioning" : ""}`}
                    style={{ transform: `translateX(-50%) translateY(${translatePercent}%)` }}
                >
                    <div className="menu-handle">
                        <div className="handle-bar" />
                    </div>
                    <div className="menu-content">Menu Content</div>
                </div>
            </div>

            <div className="debug-panel">
                <div className="debug-info">Finger 1: {fingerInfo.f1}</div>
                <div className="debug-info">Finger 2: {fingerInfo.f2}</div>
                <div className="debug-info">Menu: {visiblePercent}% visible</div>
                <div className="debug-info" style={{ color: "var(--color-secondary)" }}>
                    Swipe: {fingerInfo.swipe}
                </div>
            </div>
        </div>
    );
}
