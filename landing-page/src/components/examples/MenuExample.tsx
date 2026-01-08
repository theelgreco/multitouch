import { useCallback, useRef } from "react";
import { useTrackpadListener, type TrackpadCallback } from "../../hooks/useTrackpad";
import type { Finger } from "../../types/trackpad";
import "./MenuExample.css";
import { useEventListener } from "../../hooks/useEventListener";

const MENU_HEIGHT = 300;
const HANDLE_HEIGHT = 37;
const HIDDEN_OFFSET = MENU_HEIGHT - HANDLE_HEIGHT;
const START_TRANSLATE_PERCENT = (HIDDEN_OFFSET / MENU_HEIGHT) * 100;

export function MenuExample() {
    const containerRef = useRef<HTMLDivElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);
    const finger1Ref = useRef<HTMLDivElement>(null);
    const finger2Ref = useRef<HTMLDivElement>(null);
    const menuInfoRef = useRef<HTMLDivElement>(null);
    const swipeInfoRef = useRef<HTMLDivElement>(null);

    const isGestureActive = useRef(false);
    const gestureStartY = useRef<number | null>(null);
    const menuOpenRef = useRef(false);
    const menuOffset = useRef(HIDDEN_OFFSET);

    const getAverageY = (f1: Finger, f2: Finger): number => {
        return (f1.position.y + f2.position.y) / 2;
    };

    const updateMenuTransform = (offset: number) => {
        if (menuRef.current) {
            const translatePercent = (offset / MENU_HEIGHT) * 100;
            menuRef.current.style.transform = `translateX(-50%) translateY(${translatePercent}%)`;
        }
        if (menuInfoRef.current) {
            const visiblePercent = Math.round((1 - offset / HIDDEN_OFFSET) * 100);
            menuInfoRef.current.textContent = `Menu: ${visiblePercent}% visible`;
        }
    };

    const snapMenu = (currentOffset: number) => {
        if (!menuRef.current) return;

        menuRef.current.classList.add("transitioning");

        if (currentOffset < HIDDEN_OFFSET / 2) {
            menuOffset.current = 0;
            menuOpenRef.current = true;
            menuRef.current.classList.add("open");
        } else {
            menuOffset.current = HIDDEN_OFFSET;
            menuOpenRef.current = false;
            menuRef.current.classList.remove("open");
        }

        updateMenuTransform(menuOffset.current);

        menuRef.current?.classList.remove("transitioning");
    };

    const handleTrackpad = useCallback<TrackpadCallback>((e) => {
        const fingers = e.detail.fingers;
        const f1 = fingers[0];
        const f2 = fingers[1];

        if (finger1Ref.current) {
            finger1Ref.current.textContent = `Finger 1: ${f1 ? `y=${f1.position.y.toFixed(3)}` : "--"}`;
        }
        if (finger2Ref.current) {
            finger2Ref.current.textContent = `Finger 2: ${f2 ? `y=${f2.position.y.toFixed(3)}` : "--"}`;
        }
        if (swipeInfoRef.current) {
            swipeInfoRef.current.textContent = `Swipe: --`;
        }

        if (fingers.length === 2) {
            const currentY = getAverageY(f1, f2);

            if (!isGestureActive.current) {
                isGestureActive.current = true;
                gestureStartY.current = currentY;
                menuRef.current?.classList.remove("transitioning");
            }

            if (gestureStartY.current !== null && isGestureActive.current) {
                const swipeDelta = currentY - gestureStartY.current;
                const sensitivity = 600;
                const baseOffset = menuOpenRef.current ? 0 : HIDDEN_OFFSET;
                const newOffset = Math.max(0, Math.min(HIDDEN_OFFSET, baseOffset - swipeDelta * sensitivity));

                menuOffset.current = newOffset;
                updateMenuTransform(newOffset);

                const direction = swipeDelta > 0 ? "↑ up" : swipeDelta < 0 ? "↓ down" : "—";
                if (swipeInfoRef.current) {
                    swipeInfoRef.current.textContent = `Swipe: ${direction} (${(swipeDelta * 100).toFixed(1)})`;
                }
            }
        } else {
            if (isGestureActive.current) {
                isGestureActive.current = false;
                gestureStartY.current = null;
                snapMenu(menuOffset.current);
            }
        }
    }, []);

    useTrackpadListener(containerRef, handleTrackpad);
    useEventListener("mouseleave", containerRef, () => {
        requestAnimationFrame(() => {
            if (finger1Ref.current) finger1Ref.current.textContent = "Finger 1: --";
            if (finger2Ref.current) finger2Ref.current.textContent = "Finger 2: --";
            if (menuInfoRef.current) menuInfoRef.current.textContent = "Menu: 0% visible";
            if (swipeInfoRef.current) swipeInfoRef.current.textContent = "Swipe: --";
        });
    });

    return (
        <div className="menu-example">
            <h2>Gesture Menu</h2>
            <p className="example-instructions">Swipe up with two fingers from the bottom-center of your trackpad to reveal the menu.</p>

            <div ref={containerRef} className="menu-demo-area">
                <div className="gesture-hint">
                    <div className="arrow-up" />
                    <span>Swipe Up</span>
                </div>

                <div ref={menuRef} className="demo-menu" style={{ transform: `translateX(-50%) translateY(${START_TRANSLATE_PERCENT}%)` }}>
                    <div className="menu-handle">
                        <div className="handle-bar" />
                    </div>
                    <div className="menu-content">Menu Content</div>
                </div>
            </div>

            <div className="debug-panel">
                <div ref={finger1Ref} className="debug-info">
                    Finger 1: --
                </div>
                <div ref={finger2Ref} className="debug-info">
                    Finger 2: --
                </div>
                <div ref={menuInfoRef} className="debug-info">
                    Menu: 0% visible
                </div>
                <div ref={swipeInfoRef} className="debug-info" style={{ color: "var(--color-secondary)" }}>
                    Swipe: --
                </div>
            </div>
        </div>
    );
}
