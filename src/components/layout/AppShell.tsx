import { useState } from "react";
import type { ReactNode } from "react";
import type { AppState } from "../../App";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";

type AppShellProps = {
  state: AppState;
  children: ReactNode;
};

export function AppShell({ state, children }: AppShellProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-canvas text-ink">
      <TopBar state={state} />
      <div className="flex h-[calc(100vh-4rem)]">
        <Sidebar
          state={state}
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed((c) => !c)}
        />
        <main className="compact-scrollbar flex-1 overflow-auto">
          <div className="mx-auto max-w-[1440px] space-y-5 px-6 py-5">{children}</div>
        </main>
      </div>
    </div>
  );
}
