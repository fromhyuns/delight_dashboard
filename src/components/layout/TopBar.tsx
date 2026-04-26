import { Bell, ChevronDown, Search, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { agents, roles, workspaces } from "../../data/mockData";
import type { AppState } from "../../App";
import type { Environment, Role } from "../../types";

const environments: Environment[] = ["Development", "Staging", "Production"];

const envDot: Record<Environment, string> = {
  Development: "bg-emerald-500",
  Staging: "bg-amber-400",
  Production: "bg-red-400",
};
import { CommandPalette } from "../ui/CommandPalette";

type TopBarProps = {
  state: AppState;
};

export function TopBar({ state }: TopBarProps) {
  const location = useLocation();
  const [paletteOpen, setPaletteOpen] = useState(false);

  const isAgentOverview = location.pathname === "/agent";

  const routeEnvironment =
    location.pathname === "/build/development"
      ? "Development"
      : location.pathname === "/build/production-safety"
        ? "Production"
        : location.pathname === "/evaluate"
          ? "Production"
          : undefined;

  useEffect(() => {
    if (routeEnvironment) state.setEnvironment(routeEnvironment);
  }, [location.pathname]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setPaletteOpen((open) => !open);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <header className="relative flex h-16 items-center justify-between border-b border-line bg-white px-5">
        <div className="flex items-center gap-6">
          <div className="flex shrink-0 items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-sidebar text-sm font-semibold text-white">
              D
            </div>
            <div className="whitespace-nowrap">
              <div className="text-sm font-semibold text-ink">Delight.ai</div>
              <div className="text-xs text-muted">NAVER Corp</div>
            </div>
          </div>

          <div className="h-7 w-px bg-line" />

          <div className="flex items-center gap-8">
            <div className="relative cursor-pointer">
              <span className="block text-[11px] font-medium uppercase tracking-wide text-muted">
                Workspace
              </span>
              <div className="flex items-center gap-1">
                <span className="text-sm font-medium text-ink">{state.workspace.name}</span>
                <ChevronDown size={12} className="text-muted" />
              </div>
              <select
                value={state.workspace.id}
                onChange={(event) => state.setWorkspaceId(event.target.value)}
                className="absolute inset-0 cursor-pointer opacity-0"
              >
                {workspaces.map((workspace) => (
                  <option key={workspace.id} value={workspace.id}>
                    {workspace.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="relative cursor-pointer">
              <span className="block text-[11px] font-medium uppercase tracking-wide text-muted">
                Agent
              </span>
              <div className="flex items-center gap-1">
                <span className="text-sm font-medium text-ink">{state.agent.name}</span>
                <ChevronDown size={12} className="text-muted" />
              </div>
              <select
                value={state.agent.id}
                onChange={(event) => state.setAgentId(event.target.value)}
                className="absolute inset-0 cursor-pointer opacity-0"
              >
                {agents
                  .filter((agent) => agent.workspaceId === state.workspace.id)
                  .map((agent) => (
                    <option key={agent.id} value={agent.id}>
                      {agent.name}
                    </option>
                  ))}
              </select>
            </div>

            {!isAgentOverview && <div className="relative cursor-pointer">
              <span className="block text-[11px] font-medium uppercase tracking-wide text-muted">
                Environment
              </span>
              <div className="flex items-center gap-1.5">
                <span className={`h-2 w-2 rounded-full ${envDot[state.environment]}`} />
                <span className="text-sm font-medium text-ink">{state.environment}</span>
                <ChevronDown size={12} className="text-muted" />
              </div>
              <select
                value={state.environment}
                onChange={(event) => state.setEnvironment(event.target.value as Environment)}
                className="absolute inset-0 cursor-pointer opacity-0"
              >
                {environments.map((env) => (
                  <option key={env} value={env}>{env}</option>
                ))}
              </select>
            </div>}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setPaletteOpen(true)}
            className="flex min-w-[220px] items-center gap-2 rounded-md border border-line bg-stone-50 px-3 text-muted hover:border-accent/40 hover:bg-white"
          >
            <Search size={15} className="shrink-0" />
            <span className="h-9 flex-1 text-left text-sm leading-9">Search anything...</span>
            <kbd className="shrink-0 rounded border border-line px-1.5 py-0.5 text-[10px]">⌘K</kbd>
          </button>

          <button className="relative flex h-9 w-9 items-center justify-center rounded-md border border-line bg-white text-muted hover:bg-stone-50 hover:text-ink">
            <Bell size={17} />
            <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-0.5 text-[10px] font-semibold text-white">
              3
            </span>
          </button>

          <div className="relative">
            <div className="flex items-center gap-2.5 rounded-md border border-line bg-white px-2.5 py-1.5 hover:bg-stone-50">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-600 text-xs font-semibold text-white">
                SK
              </span>
              <span>
                <span className="block text-sm font-medium leading-tight text-ink">Sora Kim</span>
                <span className="block text-xs leading-tight text-muted">{state.role}</span>
              </span>
              <ChevronDown size={14} className="ml-0.5 text-muted" />
            </div>
            <select
              value={state.role}
              onChange={(e) => state.setRole(e.target.value as Role)}
              className="absolute inset-0 cursor-pointer opacity-0"
              aria-label="Switch role"
            >
              {roles.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </div>
        </div>
      </header>

      {paletteOpen && (
        <CommandPalette state={state} onClose={() => setPaletteOpen(false)} />
      )}
    </>
  );
}
