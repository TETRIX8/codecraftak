import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { installCdnProxy } from "./lib/cdn-proxy";

installCdnProxy();

createRoot(document.getElementById("root")!).render(<App />);
