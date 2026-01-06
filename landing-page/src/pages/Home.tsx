import { Link } from "react-router-dom";
import "./Home.css";
import { useTrackpad } from "../hooks/useTrackpad";
import type { Finger } from "../types/trackpad";
import { useCallback, useRef, useState } from "react";

const features = [
    {
        icon: "👆",
        title: "Multi-finger Detection",
        description: "Access individual finger positions, pressure, and velocity data from your trackpad in real-time.",
    },
    {
        icon: "🎮",
        title: "Gaming & Interactivity",
        description: "Create immersive games and interactive experiences with gesture-based controls.",
    },
    {
        icon: "🎨",
        title: "Creative UI Patterns",
        description: "Build unique interfaces like rotary knobs, gesture menus, and multi-touch sliders.",
    },
    {
        icon: "⚡",
        title: "Low Latency",
        description: "Native macOS integration ensures responsive, real-time gesture recognition.",
    },
    {
        icon: "🔧",
        title: "Developer Friendly",
        description: "Simple event-based API that integrates seamlessly with any web framework.",
    },
    {
        icon: "🧪",
        title: "Experimental",
        description: "Push the boundaries of web interaction with cutting-edge trackpad capabilities.",
    },
];

export function Home() {
    const logo = useRef<HTMLImageElement>(null);
    const [fingerLocations, setFingerLocations] = useState<(Finger["position"] & { id: Finger["identifier"] })[]>([]);

    const handleTrackpad = useCallback((fingers: Finger[]) => {
        setFingerLocations(
            fingers.map((finger) => {
                return { x: finger.position.x, y: finger.position.y, id: finger.identifier };
            })
        );
    }, []);

    useTrackpad(handleTrackpad);

    return (
        <div className="home">
            {/* Hero Section */}
            <section className="hero">
                <div className="hero-content">
                    <h1 className="hero-title">
                        <span className="gradient-text">Multitouch</span>
                    </h1>
                    <p className="hero-tagline">Bringing trackpad gestures to the web</p>
                    <p className="hero-description">
                        Unlock the full potential of your MacBook's trackpad. Access raw multi-finger data, create gesture-controlled
                        interfaces, and build experiences that weren't possible before.
                    </p>
                    <div className="hero-actions">
                        <Link to="/install" className="btn btn-primary">
                            Install Now
                            <span className="btn-arrow">→</span>
                        </Link>
                        <Link to="/examples" className="btn btn-secondary">
                            View Examples
                        </Link>
                    </div>
                    <p className="hero-note">Currently available for macOS only (experimental)</p>
                </div>
                <div className="hero-visual" ref={logo}>
                    {fingerLocations.map((finger) => (
                        <div
                            className="hero-finger"
                            style={{ "--x": `${finger.x * 100}%`, "--y": `${finger.y * 100}%` } as React.CSSProperties}
                        ></div>
                    ))}
                    <img className="hero-logo" src="/multitouch.svg" width={512} style={{ mixBlendMode: "lighten" }} />
                </div>
            </section>

            {/* Features Section */}
            <section className="features section">
                <div className="container">
                    <h2 className="section-title">
                        <span className="gradient-text">What's Possible</span>
                    </h2>
                    <p className="section-subtitle">Multitouch opens up new ways to interact with web applications</p>
                    <div className="features-grid">
                        {features.map((feature, index) => (
                            <div key={index} className="feature-card card">
                                <span className="feature-icon">{feature.icon}</span>
                                <h3 className="feature-title">{feature.title}</h3>
                                <p className="feature-description">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta section">
                <div className="container">
                    <div className="cta-content card">
                        <h2>Ready to get started?</h2>
                        <p>Install Multitouch and start building gesture-controlled web experiences today.</p>
                        <div className="cta-actions">
                            <Link to="/install" className="btn btn-primary">
                                Get Started
                                <span className="btn-arrow">→</span>
                            </Link>
                            <Link to="/examples" className="btn btn-secondary">
                                Try Examples
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
