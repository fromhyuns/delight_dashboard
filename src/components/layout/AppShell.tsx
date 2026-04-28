import type { ReactNode } from "react";
import type { AppState } from "../../App";
import { LeftRail } from "./LeftRail";
import { ContextPanel } from "./ContextPanel";
import { TopBar } from "./TopBar";

type AppShellProps = {
  state: AppState;
  children: ReactNode;
};

export function AppShell({ state, children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-canvas text-ink">
      <TopBar state={state} />
      <div className="flex h-[calc(100vh-3.5rem)]">
        <LeftRail />
        <ContextPanel state={state} />
        <main className={`compact-scrollbar flex-1 overflow-auto${state.environment === "Production" ? " prod-main" : ""}`}>
          <div className="mx-auto max-w-[1440px] space-y-5 px-6 py-5">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
