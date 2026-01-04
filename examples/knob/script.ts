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
const knob = document.getElementById("knob") as HTMLElement;
const valueDisplay = document.getElementById("valueDisplay") as HTMLElement;
const finger1Display = document.getElementById("finger1") as HTMLElement;
const finger2Display = document.getElementById("finger2") as HTMLElement;
const angleInfo = document.getElementById("angleInfo") as HTMLElement;
const ticks = document.querySelectorAll(".tick") as NodeListOf<HTMLElement>;

// Knob state
let currentRotation = 0; // Current rotation in degrees
let initialAngle: number | null = null; // Angle between fingers when gesture started
let initialRotation: number = 0; // Knob rotation when gesture started

// Calculate the angle between two fingers (in degrees)
function getAngleBetweenFingers(f1: Finger, f2: Finger): number {
    const dx = f2.position.x - f1.position.x;
    const dy = f2.position.y - f1.position.y;
    return Math.atan2(dy, dx) * (180 / Math.PI);
}

// Normalize angle difference to handle wraparound
function normalizeAngleDelta(delta: number): number {
    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;
    return delta;
}

// Normalize angle to 0-360 range
function normalizeAngle(angle: number): number {
    let normalized = angle % 360;
    if (normalized < 0) normalized += 360;
    return normalized;
}

// Update tick indicators based on knob rotation
function updateTicks(rotation: number): void {
    // The indicator is at the top (0°) when rotation is 0
    // We need to find which tick the indicator is pointing at
    const indicatorAngle = normalizeAngle(rotation);

    ticks.forEach((tick) => {
        const tickAngle = parseFloat(tick.dataset.angle || "0");
        // Normalize tick angle to 0-360 range
        const normalizedTickAngle = normalizeAngle(tickAngle);

        // Calculate the angular distance between indicator and tick
        let angleDiff = Math.abs(indicatorAngle - normalizedTickAngle);
        if (angleDiff > 180) angleDiff = 360 - angleDiff;

        // Light up the tick if the indicator is within 22.5 degrees (half of 45° spacing)
        if (angleDiff <= 22.5) {
            tick.classList.add("active");
        } else {
            tick.classList.remove("active");
        }
    });
}

// Update knob UI
function updateKnob(rotation: number): void {
    currentRotation = rotation;
    knob.style.transform = `rotate(${currentRotation}deg)`;

    // Display normalized value (0-360 range for display)
    let displayValue = currentRotation % 360;
    if (displayValue < 0) displayValue += 360;
    valueDisplay.textContent = `${Math.round(displayValue)}°`;
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

    // Two-finger rotation control
    if (fingers.length === 2) {
        const currentAngle = getAngleBetweenFingers(fingers[0], fingers[1]);
        angleInfo.textContent = `Rotation Angle: ${currentAngle.toFixed(1)}°`;

        // Initialize on first two-finger touch
        if (initialAngle === null) {
            initialAngle = currentAngle;
            initialRotation = currentRotation;
        }

        // Calculate rotation delta
        const angleDelta = normalizeAngleDelta(currentAngle - initialAngle);

        // Apply rotation (multiply for sensitivity adjustment if needed)
        const sensitivity = 2.5;
        const newRotation = initialRotation - angleDelta * sensitivity;

        updateKnob(newRotation);
        updateTicks(newRotation);
    } else {
        // Reset when not using two fingers
        initialAngle = null;
        initialRotation = currentRotation;
        angleInfo.textContent = "Rotation Angle: --";
    }
});

// Initialize knob
updateKnob(currentRotation);
