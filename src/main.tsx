
  import { createRoot } from "react-dom/client";
  import App from "./app/App.tsx";
  import "./styles/index.css";
  // Leaflet map removed — no live location functionality

  createRoot(document.getElementById("root")!).render(<App />);
  