import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AppProvider } from "./state";
import { AppRouter } from "./AppRouter";
import { GlobalTooltips } from "./components/ui/Tooltip";
import "./styles.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AppProvider>
        <GlobalTooltips />
        <AppRouter />
      </AppProvider>
    </BrowserRouter>
  </React.StrictMode>
);
