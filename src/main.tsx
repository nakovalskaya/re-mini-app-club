import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { AppStateProvider } from "@/app/providers/AppStateProvider";
import { router } from "@/app/router";
import "@/index.css";

let zoomGuardsInstalled = false;

function installZoomGuards() {
  if (zoomGuardsInstalled || typeof document === "undefined") {
    return;
  }

  const preventGesture = (event: Event) => {
    event.preventDefault();
  };

  document.addEventListener("gesturestart", preventGesture, { passive: false });
  document.addEventListener("gesturechange", preventGesture, { passive: false });
  document.addEventListener("gestureend", preventGesture, { passive: false });
  document.addEventListener(
    "wheel",
    (event) => {
      if (event.ctrlKey) {
        event.preventDefault();
      }
    },
    { passive: false }
  );

  zoomGuardsInstalled = true;
}

installZoomGuards();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AppStateProvider>
      <RouterProvider router={router} />
    </AppStateProvider>
  </React.StrictMode>
);
