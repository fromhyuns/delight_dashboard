import { Bell, ChevronDown, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { agents, roles, workspaces } from "../../data/mockData";
import type { AppState } from "../../App";
import type { Environment, Role } from "../../types";
import { CommandPalette } from "../ui/CommandPalette";

type ProfileInfo = { name: string; initials: string };

const profileByRole: Record<Role, ProfileInfo> = {
  "Org Admin":                  { name: "Sora Kim",   initials: "SK" },
  "Workspace Admin":            { name: "Minho Park",  initials: "MP" },
  "Agent Builder / Operator":   { name: "Jisoo Lee",   initials: "JL" },
};

const environments: Environment[] = ["Development", "Staging", "Production"];


const lockedEnvByRoute: Partial<Record<string, Environment>> = {
  "/build/development":       "Development",
  "/build/production-safety": "Production",
  "/evaluate":                "Production",
};

type TopBarProps = { state: AppState };

export function TopBar({ state }: TopBarProps) {
  const location = useLocation();
  const [paletteOpen, setPaletteOpen] = useState(false);

  const lockedEnv = lockedEnvByRoute[location.pathname];

  useEffect(() => {
    if (lockedEnv) state.setEnvironment(lockedEnv);
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

  const isHome      = location.pathname === "/";
  const showWorkspace = !isHome;
  const showAgent   = ["/agent", "/build/development", "/build/production-safety", "/evaluate"].includes(location.pathname);
  const showEnv     = showAgent && location.pathname !== "/agent";

  return (
    <>
      <header className="relative flex h-14 items-center justify-between border-b border-line bg-white px-5">

        {/* Left: logo + breadcrumb */}
        <div className="flex items-center gap-4">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-sidebar text-xs font-bold text-white">
            D
          </div>

          {showWorkspace && (
            <>
              <div className="h-5 w-px bg-line" />
              <div className="flex items-center gap-1 text-sm">
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

                {showAgent && (
                  <>
                    <span className="px-1 text-stone-300">/</span>
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
                  </>
                )}
              </div>
            </>
          )}
        </div>

        {/* Right: env pill switcher (conditional) + search + bell + profile */}
        <div className="flex items-center gap-3">

          {/* Environment pill tabs */}
          {showEnv && (
            <>
              <div className="flex items-center rounded-md border border-line bg-stone-50 p-0.5">
                {environments.map((env) => {
                  const isActive = state.environment === env;
                  const isLocked = !!lockedEnv && lockedEnv !== env;
                  return (
                    <button
                      key={env}
                      disabled={isLocked}
                      onClick={() => { if (!lockedEnv) state.setEnvironment(env); }}
                      className={`rounded px-2.5 py-1 text-xs font-medium transition ${
                        isActive
                          ? "bg-stone-900 text-white"
                          : isLocked
                          ? "cursor-not-allowed text-stone-300"
                          : "text-muted hover:text-ink"
                      }`}
                    >
                      {env}
                    </button>
                  );
                })}
              </div>
              <div className="h-5 w-px bg-line" />
            </>
          )}

          {/* Search icon */}
          <button
            onClick={() => setPaletteOpen(true)}
            title="Search (⌘K)"
            className="flex h-8 w-8 items-center justify-center rounded-md border border-line bg-white text-muted hover:bg-stone-50 hover:text-ink"
          >
            <Search size={15} />
          </button>

          {/* Notifications */}
          <button className="relative flex h-8 w-8 items-center justify-center rounded-md border border-line bg-white text-muted hover:bg-stone-50 hover:text-ink">
            <Bell size={16} />
            <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-0.5 text-[10px] font-semibold text-white">
              3
            </span>
          </button>

          {/* Profile — avatar + name + role, switcher via hidden select */}
          <div className="relative">
            <div className="flex h-[46px] cursor-pointer items-center gap-3 rounded-xl border border-stone-200 bg-white px-3 hover:bg-stone-50 transition">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-violet-600 text-xs font-semibold text-white">
                {profileByRole[state.role].initials}
              </span>
              <div className="flex flex-col leading-tight">
                <span className="text-sm font-semibold text-ink">
                  {profileByRole[state.role].name}
                </span>
                <span className="text-[11px] text-muted">{state.role}</span>
              </div>
              <ChevronDown size={14} className="ml-1 text-stone-400" />
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
