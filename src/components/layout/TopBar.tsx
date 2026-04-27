import { Bell, ChevronDown, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { agents, roles, workspaces } from "../../data/mockData";
import type { AppState } from "../../App";
import type { Environment, Role } from "../../types";
import { CommandPalette } from "../ui/CommandPalette";

const environments: Environment[] = ["Development", "Staging", "Production"];

const envDot: Record<Environment, string> = {
  Development: "bg-sky-400",
  Staging:     "bg-amber-400",
  Production:  "bg-emerald-500",
};

type TopBarProps = { state: AppState };

export function TopBar({ state }: TopBarProps) {
  const location = useLocation();
  const [paletteOpen, setPaletteOpen] = useState(false);

  // Auto-set environment for certain routes
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
        setPaletteOpen((v) => !v);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <header className="relative flex h-14 items-center justify-between border-b border-line bg-white px-5">
        {/* Left: branding + selectors */}
        <div className="flex items-center gap-5">
          {/* Brand */}
          <div className="flex shrink-0 items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-sidebar text-xs font-bold text-white">
              D
            </div>
            <span className="text-sm font-semibold text-ink">Delight.ai</span>
          </div>

          <div className="h-5 w-px bg-line" />

          {/* Org / Workspace / Agent breadcrumb selectors */}
          <div className="flex items-center gap-1 text-sm">
            {/* Organization — static label */}
            <span className="text-muted">NAVER Corp</span>

            <span className="px-1 text-stone-300">/</span>

            {/* Workspace — dropdown */}
            <div className="relative">
              <div className="flex cursor-pointer items-center gap-0.5">
                <span className="font-medium text-ink">{state.workspace.name}</span>
                <ChevronDown size={12} className="text-muted" />
              </div>
              <select
                value={state.workspace.id}
                onChange={(e) => state.setWorkspaceId(e.target.value)}
                className="absolute inset-0 cursor-pointer opacity-0"
              >
                {workspaces.map((ws) => (
                  <option key={ws.id} value={ws.id}>{ws.name}</option>
                ))}
              </select>
            </div>

            <span className="px-1 text-stone-300">/</span>

            {/* Agent — dropdown */}
            <div className="relative">
              <div className="flex cursor-pointer items-center gap-0.5">
                <span className="font-medium text-ink">{state.agent.name}</span>
                <ChevronDown size={12} className="text-muted" />
              </div>
              <select
                value={state.agent.id}
                onChange={(e) => state.setAgentId(e.target.value)}
                className="absolute inset-0 cursor-pointer opacity-0"
              >
                {agents
                  .filter((a) => a.workspaceId === state.workspace.id)
                  .map((a) => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
              </select>
            </div>
          </div>

          {/* Environment — hidden on Overview (all-env comparison), shown on Build/Test/Evaluate */}
          {location.pathname !== "/agent" && (
            <>
              <div className="h-5 w-px bg-line" />
              <div className="relative">
                <div className="flex cursor-pointer items-center gap-1.5">
                  <span className={`h-2 w-2 rounded-full ${envDot[state.environment]}`} />
                  <span className="text-sm font-medium text-ink">{state.environment}</span>
                  <ChevronDown size={12} className="text-muted" />
                </div>
                <select
                  value={state.environment}
                  onChange={(e) => state.setEnvironment(e.target.value as Environment)}
                  className="absolute inset-0 cursor-pointer opacity-0"
                >
                  {environments.map((env) => (
                    <option key={env} value={env}>{env}</option>
                  ))}
                </select>
              </div>
            </>
          )}
        </div>

        {/* Right: search + notifications + profile */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setPaletteOpen(true)}
            className="flex min-w-[200px] items-center gap-2 rounded-md border border-line bg-stone-50 px-3 text-muted hover:border-accent/40 hover:bg-white"
          >
            <Search size={14} className="shrink-0" />
            <span className="h-8 flex-1 text-left text-sm leading-8">Search anything...</span>
            <kbd className="shrink-0 rounded border border-line px-1.5 py-0.5 text-[10px]">⌘K</kbd>
          </button>

          <button className="relative flex h-8 w-8 items-center justify-center rounded-md border border-line bg-white text-muted hover:bg-stone-50 hover:text-ink">
            <Bell size={16} />
            <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-0.5 text-[10px] font-semibold text-white">
              3
            </span>
          </button>

          <div className="relative">
            <div className="flex cursor-pointer items-center gap-2 rounded-md border border-line bg-white px-2.5 py-1 hover:bg-stone-50">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-violet-600 text-xs font-semibold text-white">
                SK
              </span>
              <span>
                <span className="block text-sm font-medium leading-tight text-ink">Sora Kim</span>
                <span className="block text-[11px] leading-tight text-muted">{state.role}</span>
              </span>
              <ChevronDown size={13} className="ml-0.5 text-muted" />
            </div>
            <select
              value={state.role}
              onChange={(e) => state.setRole(e.target.value as Role)}
              className="absolute inset-0 cursor-pointer opacity-0"
              aria-label="Switch role"
            >
              {roles.map((r) => (
                <option key={r} value={r}>{r}</option>
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
