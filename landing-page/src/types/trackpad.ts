export interface Finger {
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

export interface TrackpadEventDetail {
    frame: number;
    timestamp: number;
    fingers: Finger[];
}

export interface TrackpadEvent extends CustomEvent<TrackpadEventDetail> {}

// Declare the trackpad event on the window
declare global {
    interface WindowEventMap {
        trackpad: TrackpadEvent;
    }
}
