import { RouterProvider } from "react-router-dom";
import { AppStateProvider } from "@/app/providers/AppStateProvider";
import { ChallengesProvider } from "@/app/providers/ChallengesProvider";
import { LinksProvider } from "@/app/providers/LinksProvider";
import { MaterialsProvider } from "@/app/providers/MaterialsProvider";
import { router } from "@/app/router";

export function App() {
  return (
    <AppStateProvider>
      <ChallengesProvider>
        <MaterialsProvider>
          <LinksProvider>
            <RouterProvider router={router} />
          </LinksProvider>
        </MaterialsProvider>
      </ChallengesProvider>
    </AppStateProvider>
  );
}
