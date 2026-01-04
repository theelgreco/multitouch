interface Finger {
    frame: number;
    angle: number;
    majorAxis: number;
    minorAxis: number;
    position: {
        x: number;
        y: number;
    };
    velocity: {
        x: number;
        y: number;
    };
    identifier: number;
    state: number;
    foo3: number;
    foo4: number;
    size: number;
    unk2: number;
}

interface TrackpadEvent extends CustomEvent {
    detail: {
        frame: number;
        timestamp: number;
        fingers: Finger[];
    };
}

// DOM Elements
const menu = document.getElementById("menu") as HTMLElement;
const finger1Display = document.getElementById("finger1") as HTMLElement;
const finger2Display = document.getElementById("finger2") as HTMLElement;
const menuStateDisplay = document.getElementById("menuState") as HTMLElement;
const swipeInfo = document.getElementById("swipeInfo") as HTMLElement;

// Menu state
const MENU_HEIGHT = 350; // Height of the menu in pixels
const HANDLE_HEIGHT = 37; // Height of the handle area that peeks out
const HIDDEN_OFFSET = MENU_HEIGHT - HANDLE_HEIGHT; // Offset when "hidden" (handle visible)
let isMenuOpen = false;
let isGestureActive = false;
let gestureStartY: number | null = null;
let currentMenuOffset = HIDDEN_OFFSET; // 0 = fully visible, HIDDEN_OFFSET = hidden with handle peeking

// Get the average Y position of two fingers
function getAverageY(f1: Finger, f2: Finger): number {
    return (f1.position.y + f2.position.y) / 2;
}

// Update menu position during gesture
function setMenuOffset(offset: number): void {
    // Clamp offset between 0 (fully visible) and HIDDEN_OFFSET (hidden with handle peeking)
    currentMenuOffset = Math.max(0, Math.min(HIDDEN_OFFSET, offset));

    // Apply transform - translateY based on offset relative to menu height
    const translatePercent = (currentMenuOffset / MENU_HEIGHT) * 100;
    menu.style.transform = `translateX(-50%) translateY(${translatePercent}%)`;

    // Update debug display
    const visiblePercent = Math.round((1 - currentMenuOffset / HIDDEN_OFFSET) * 100);
    menuStateDisplay.textContent = `Menu: ${visiblePercent}% visible`;
}

// Snap menu to open or closed state
function snapMenu(): void {
    menu.classList.add("transitioning");

    // If past halfway point, snap to open; otherwise snap to closed
    if (currentMenuOffset < HIDDEN_OFFSET / 2) {
        // Snap open
        isMenuOpen = true;
        currentMenuOffset = 0;
        menu.classList.add("open");
        menuStateDisplay.textContent = "Menu: open";
    } else {
        // Snap closed
        isMenuOpen = false;
        currentMenuOffset = HIDDEN_OFFSET;
        menu.classList.remove("open");
        menuStateDisplay.textContent = "Menu: hidden";
    }

    setMenuOffset(currentMenuOffset);

    // Remove transition class after animation completes
    setTimeout(() => {
        menu.classList.remove("transitioning");
    }, 300);
}

// Update finger display
function updateFingerDisplay(fingers: Finger[]): void {
    if (fingers.length >= 1) {
        const f1 = fingers[0];
        finger1Display.textContent = `Finger 1: y=${f1.position.y.toFixed(3)}`;
    } else {
        finger1Display.textContent = "Finger 1: --";
    }

    if (fingers.length >= 2) {
        const f2 = fingers[1];
        finger2Display.textContent = `Finger 2: y=${f2.position.y.toFixed(3)}`;
    } else {
        finger2Display.textContent = "Finger 2: --";
    }
}

window.addEventListener(
    "wheel",
    (e) => {
        e.preventDefault();
    },
    { passive: false }
);

window.addEventListener(
    "gesturestart",
    (e) => {
        e.preventDefault();
    },
    { passive: false }
);

window.addEventListener("trackpad", (e) => {
    const ev = e as TrackpadEvent;
    const { fingers } = ev.detail;

    // Update finger display
    updateFingerDisplay(fingers);

    // Two-finger swipe control
    if (fingers.length === 2) {
        const currentY = getAverageY(fingers[0], fingers[1]);

        // Initialize gesture on first two-finger touch
        if (!isGestureActive) {
            isGestureActive = true;
            gestureStartY = currentY;
            menu.classList.remove("transitioning");
        }

        if (gestureStartY !== null) {
            // Calculate swipe delta (positive = swipe up, negative = swipe down)
            // Note: trackpad Y coordinates increase upward, so we negate
            const swipeDelta = currentY - gestureStartY;

            // Sensitivity: how much menu moves per unit of finger movement
            const sensitivity = 800;

            // Calculate new offset based on swipe direction and menu state
            let baseOffset = isMenuOpen ? 0 : HIDDEN_OFFSET;
            let newOffset = baseOffset - swipeDelta * sensitivity;

            setMenuOffset(newOffset);

            // Update swipe info
            const direction = swipeDelta > 0 ? "↑ up" : swipeDelta < 0 ? "↓ down" : "—";
            swipeInfo.textContent = `Swipe: ${direction} (${(swipeDelta * 100).toFixed(1)})`;
        }
    } else {
        // Fingers released - snap to nearest state
        if (isGestureActive) {
            isGestureActive = false;
            gestureStartY = null;
            snapMenu();
            swipeInfo.textContent = "Swipe: --";
        }
    }
});

// Initialize
setMenuOffset(currentMenuOffset);
