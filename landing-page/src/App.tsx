import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Navigation } from "./components/Navigation";
import { Home } from "./pages/Home";
import { Install } from "./pages/Install";
import { Examples } from "./pages/Examples";
import "./App.css";
import { useTrackpad } from "./hooks/useTrackpad";

function App() {
    useTrackpad();

    return (
        <BrowserRouter>
            <Navigation />
            <main>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/install" element={<Install />} />
                    <Route path="/examples" element={<Examples />} />
                </Routes>
            </main>
        </BrowserRouter>
    );
}

export default App;
