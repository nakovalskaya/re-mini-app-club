import { RouterProvider } from "react-router-dom";
import { AppStateProvider } from "@/app/providers/AppStateProvider";
import { ChallengesProvider } from "@/app/providers/ChallengesProvider";
import { MaterialsProvider } from "@/app/providers/MaterialsProvider";
import { router } from "@/app/router";

export function App() {
  return (
    <AppStateProvider>
      <ChallengesProvider>
        <MaterialsProvider>
          <RouterProvider router={router} />
        </MaterialsProvider>
      </ChallengesProvider>
    </AppStateProvider>
  );
}
