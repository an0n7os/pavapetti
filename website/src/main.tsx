import { createRoot } from "react-dom/client";
import { setBaseUrl } from "@workspace/api-client-react";
import App from "./App";
import "./index.css";

// Configure API Base URL in production (e.g. Netlify)
const apiUrl = import.meta.env.VITE_API_URL;
const isLocalhost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";

if (apiUrl && (!apiUrl.includes("localhost") || isLocalhost)) {
  setBaseUrl(apiUrl);
}

createRoot(document.getElementById("root")!).render(<App />);
