import { useState } from "react";
import { SliderExample } from "../components/examples/SliderExample";
import { KnobExample } from "../components/examples/KnobExample";
import { MenuExample } from "../components/examples/MenuExample";
import "./Examples.css";
import PressureExample from "../components/examples/PressureExample";

const examples = [
    {
        id: "slider",
        title: "Slider",
        description: "Control a slider with pinch gestures",
        component: SliderExample,
    },
    {
        id: "knob",
        title: "Knob",
        description: "Rotate a dial with two-finger rotation",
        component: KnobExample,
    },
    {
        id: "menu",
        title: "Gesture Menu",
        description: "Swipe to reveal a hidden menu",
        component: MenuExample,
    },
    {
        id: "pressure",
        title: "Pressure",
        description: "A pressure thing",
        component: PressureExample,
    },
];

export function Examples() {
    const [activeExample, setActiveExample] = useState(examples[0].id);

    const ActiveComponent = examples.find((e) => e.id === activeExample)?.component || SliderExample;

    return (
        <div className="examples">
            <div className="container">
                <header className="examples-header">
                    <h1>
                        <span className="gradient-text">Examples</span>
                    </h1>
                    <p className="examples-subtitle">
                        Interactive demos showcasing multitouch capabilities. Install Multitouch to try them yourself.
                    </p>
                </header>

                <div className="examples-layout">
                    <nav className="examples-nav">
                        {examples.map((example) => (
                            <button
                                key={example.id}
                                className={`example-tab ${activeExample === example.id ? "active" : ""}`}
                                onClick={() => setActiveExample(example.id)}
                            >
                                <span className="tab-title">{example.title}</span>
                                <span className="tab-description">{example.description}</span>
                            </button>
                        ))}
                    </nav>

                    <div className="example-display card">
                        <ActiveComponent />
                    </div>
                </div>

                <div className="examples-note card">
                    <h3>🖐️ Trackpad Required</h3>
                    <p>
                        These examples require Multitouch to be installed and running. Without it, the demos will display but won't respond
                        to gestures. Standard mouse/trackpad scrolling is disabled to prevent conflicts.
                    </p>
                </div>
            </div>
        </div>
    );
}
