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
const sliderFill = document.getElementById("sliderFill") as HTMLElement;
const sliderThumb = document.getElementById("sliderThumb") as HTMLElement;
const sliderValue = document.getElementById("sliderValue") as HTMLElement;
const finger1Display = document.getElementById("finger1") as HTMLElement;
const finger2Display = document.getElementById("finger2") as HTMLElement;
const distanceInfo = document.getElementById("distanceInfo") as HTMLElement;

// Slider state
let currentValue = 50; // 0-100
let initialDistance: number | null = null;
let initialValue: number = 50;

// Calculate distance between two fingers
function getFingerDistance(f1: Finger, f2: Finger): number {
    const dx = f1.position.x - f2.position.x;
    const dy = f1.position.y - f2.position.y;
    return Math.sqrt(dx * dx + dy * dy);
}

// Update slider UI
function updateSlider(value: number): void {
    currentValue = Math.max(0, Math.min(100, value));
    sliderFill.style.width = `${currentValue}%`;
    sliderThumb.style.left = `${currentValue}%`;
    sliderValue.textContent = `${Math.round(currentValue)}%`;
}

// Update finger display
function updateFingerDisplay(fingers: Finger[]): void {
    if (fingers.length >= 1) {
        const f1 = fingers[0];
        finger1Display.textContent = `Finger 1: x=${f1.position.x.toFixed(3)}, y=${f1.position.y.toFixed(3)}`;
    } else {
        finger1Display.textContent = "Finger 1: --";
    }

    if (fingers.length >= 2) {
        const f2 = fingers[1];
        finger2Display.textContent = `Finger 2: x=${f2.position.x.toFixed(3)}, y=${f2.position.y.toFixed(3)}`;
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

    // Two-finger slider control
    if (fingers.length === 2) {
        const distance = getFingerDistance(fingers[0], fingers[1]);
        distanceInfo.textContent = `Distance: ${distance.toFixed(4)}`;

        // Initialize on first two-finger touch
        if (initialDistance === null) {
            initialDistance = distance;
            initialValue = currentValue;
        }

        // Calculate new value based on distance change
        // Spreading fingers apart increases value, pinching decreases
        const distanceDelta = distance - initialDistance;
        const sensitivity = 200; // Adjust for responsiveness
        const newValue = initialValue + distanceDelta * sensitivity;

        updateSlider(newValue);
    } else {
        // Reset when not using two fingers
        initialDistance = null;
        initialValue = currentValue;
        distanceInfo.textContent = "Distance: --";
    }
});

// Initialize slider
updateSlider(currentValue);
