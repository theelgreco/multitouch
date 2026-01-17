import { Link } from "react-router-dom";
import "./Install.css";

export function Install() {
    return (
        <div className="install">
            <div className="container">
                <header className="install-header">
                    <h1>
                        <span className="gradient-text">Installation</span>
                    </h1>
                    <p className="install-subtitle">Get Multitouch running in two simple steps</p>
                </header>

                <div className="install-steps">
                    {/* Step 1: macOS App */}
                    <div className="install-step card">
                        <div className="step-number">1</div>
                        <div className="step-content">
                            <h2>Install the macOS Application</h2>
                            <p className="step-description">
                                The Multitouch app runs in the background and captures raw trackpad data from your MacBook. It communicates
                                with the Chrome extension to send gesture events to web pages.
                            </p>

                            <div className="step-requirements">
                                <h3>Requirements</h3>
                                <ul>
                                    <li>macOS (version requirements TBD)</li>
                                    <li>MacBook with Force Touch trackpad</li>
                                </ul>
                            </div>

                            <a href="/Multitouch.pkg" download className="btn btn-apple download-btn">
                                <AppleLogo />
                                Download for macOS
                            </a>

                            <div className="step-note">
                                <strong>Note:</strong> After installation, you may need to grant Accessibility permissions in System
                                Preferences → Security & Privacy → Privacy → Accessibility.
                            </div>
                        </div>
                    </div>

                    {/* Step 2: Chrome Extension */}
                    <div className="install-step card">
                        <div className="step-number">2</div>
                        <div className="step-content">
                            <h2>Install the Chrome Extension</h2>
                            <p className="step-description">
                                The Chrome extension connects to the macOS app and injects trackpad events into web pages. This enables
                                websites to receive multi-finger gesture data through a simple JavaScript API.
                            </p>

                            <div className="step-requirements">
                                <h3>Requirements</h3>
                                <ul>
                                    <li>Google Chrome browser</li>
                                    <li>Multitouch macOS app running</li>
                                </ul>
                            </div>

                            <a
                                href="https://chromewebstore.google.com/detail/multitouch/hlgeacmfgefgckhjenodpopoggkgnpff"
                                className="btn btn-chrome download-btn"
                            >
                                <ChromeLogo />
                                Add to Chrome
                            </a>

                            <div className="step-note">
                                <strong>Note:</strong> The extension requires permission to access page content in order to dispatch
                                trackpad events.
                            </div>
                        </div>
                    </div>
                </div>

                {/* How it works */}
                <section className="how-it-works card">
                    <h2>How It Works</h2>
                    <div className="architecture">
                        <div className="arch-item">
                            <div className="arch-icon">🖐️</div>
                            <div className="arch-label">Trackpad</div>
                        </div>
                        <div className="arch-arrow">→</div>
                        <div className="arch-item">
                            <div className="arch-icon">🍎</div>
                            <div className="arch-label">macOS App</div>
                        </div>
                        <div className="arch-arrow">→</div>
                        <div className="arch-item">
                            <div className="arch-icon">🌐</div>
                            <div className="arch-label">Chrome Extension</div>
                        </div>
                        <div className="arch-arrow">→</div>
                        <div className="arch-item">
                            <div className="arch-icon">📄</div>
                            <div className="arch-label">Web Page</div>
                        </div>
                    </div>
                    <p className="arch-description">
                        The macOS app captures raw multi-touch data from the trackpad using native APIs. This data is sent to the Chrome
                        extension via a local WebSocket connection. The extension then dispatches custom <code>trackpad</code> events to the
                        active web page, which your JavaScript can listen to.
                    </p>
                </section>

                {/* Usage example */}
                <section className="usage-example card">
                    <h2>Quick Start</h2>
                    <p>Once installed, you can listen for trackpad events in your JavaScript:</p>
                    <pre className="code-block">
                        <code>{`window.addEventListener("trackpad", (event) => {
  const { fingers } = event.detail;
  
  console.log(\`\${fingers.length} fingers detected\`);
  
  fingers.forEach((finger, i) => {
    console.log(\`Finger \${i}: x=\${finger.position.x}, y=\${finger.position.y}\`);
  });
});`}</code>
                    </pre>
                </section>

                {/* Next steps */}
                <section className="next-steps">
                    <h2>Ready to explore?</h2>
                    <p>Check out our interactive examples to see what's possible.</p>
                    <Link to="/examples" className="btn btn-primary">
                        View Examples
                        <span className="btn-arrow">→</span>
                    </Link>
                </section>
            </div>
        </div>
    );
}

function AppleLogo() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
        </svg>
    );
}

function ChromeLogo() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
            <circle cx="12" cy="12" r="4" fill="currentColor" />
        </svg>
    );
}
