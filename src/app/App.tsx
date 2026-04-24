import { RouterProvider } from "react-router-dom";
import { AppStateProvider } from "@/app/providers/AppStateProvider";
import { MaterialsProvider } from "@/app/providers/MaterialsProvider";
import { router } from "@/app/router";

export function App() {
  return (
    <AppStateProvider>
      <MaterialsProvider>
        <RouterProvider router={router} />
      </MaterialsProvider>
    </AppStateProvider>
  );
}
