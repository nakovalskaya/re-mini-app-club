import { Outlet } from "react-router-dom";
import { TabBar } from "@/components/TabBar/TabBar";
import { initTelegramWebApp } from "@/features/telegram/telegram";
import { AppStateProvider } from "@/app/providers/AppStateProvider";
import { tabBarItems } from "@/shared/constants/routes";

initTelegramWebApp();

export function AppShell() {
  return (
    <AppStateProvider>
      <div className="screen-shell safe-top">
        <main className="screen-content">
          <Outlet />
        </main>
        <TabBar items={tabBarItems} />
      </div>
    </AppStateProvider>
  );
}
