import { createRoot } from "react-dom/client";
import { setBaseUrl } from "@workspace/api-client-react";
import App from "./App";
import "./index.css";

// Configure API Base URL in production (e.g. Netlify)
const apiUrl = import.meta.env.VITE_API_URL;
const isLocalhost = typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");
const isSelfDomain = typeof window !== "undefined" && Boolean(apiUrl && (
  apiUrl === window.location.origin ||
  apiUrl === window.location.origin + "/" ||
  apiUrl === window.location.host ||
  apiUrl === "/" ||
  apiUrl === "/api"
));

if (apiUrl && !isSelfDomain && (!apiUrl.includes("localhost") || isLocalhost)) {
  setBaseUrl(apiUrl);
}

createRoot(document.getElementById("root")!).render(<App />);
