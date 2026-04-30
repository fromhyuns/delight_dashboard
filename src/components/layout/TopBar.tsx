import { Bell, Check, ChevronRight, Search } from "lucide-react";

function TriangleDown({ open }: { open: boolean }) {
  return (
    <svg
      width="8"
      height="5"
      viewBox="0 0 8 5"
      fill="currentColor"
      className={`shrink-0 text-stone-400 transition-transform duration-150 ${open ? "rotate-180" : ""}`}
    >
      <path d="M0 0L4 5L8 0H0Z" />
    </svg>
  );
}
import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { agents, roles, workspaces } from "../../data/mockData";
import type { AppState } from "../../App";
import type { Environment, Role } from "../../types";
import { CommandPalette } from "../ui/CommandPalette";

type ProfileInfo = { name: string; initials: string; avatarBg: string };

const profileByRole: Record<Role, ProfileInfo> = {
  "Org Admin":                { name: "Sora Kim",   initials: "SK", avatarBg: "bg-violet-600" },
  "Workspace Admin":          { name: "Minho Park",  initials: "MP", avatarBg: "bg-blue-600"   },
  "Agent Builder / Operator": { name: "Jisoo Lee",   initials: "JL", avatarBg: "bg-teal-600"   },
};

const environments: Environment[] = ["Development", "Staging", "Production"];

const lockedEnvByRoute: Partial<Record<string, Environment>> = {
  "/build/production-safety": "Production",
  "/evaluate":                "Production",
};

const defaultEnvByRoute: Partial<Record<string, Environment>> = {
  "/build/development": "Development",
  ...lockedEnvByRoute,
};

type TopBarProps = { state: AppState };

/* ── Generic breadcrumb dropdown ──────────────────────────────── */
type DropdownItem = { id: string; label: string; sub?: string };

function BreadcrumbDropdown({
  label,
  items,
  selectedId,
  onSelect,
}: {
  label: string;
  items: DropdownItem[];
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onMouseDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 rounded px-1 py-0.5 hover:bg-stone-100 transition"
      >
        <span className="font-medium text-ink">{label}</span>
        <TriangleDown open={open} />
      </button>

      {open && (
        <div className="absolute left-0 top-[calc(100%+4px)] z-50 min-w-[180px] rounded-lg border border-line bg-white py-1 shadow-lg">
          {items.map((item) => {
            const isSelected = item.id === selectedId;
            return (
              <button
                key={item.id}
                onClick={() => { onSelect(item.id); setOpen(false); }}
                className={`flex w-full items-center justify-between gap-3 px-3 py-2 text-left transition ${
                  isSelected ? "bg-stone-50 text-ink" : "text-ink hover:bg-stone-50"
                }`}
              >
                <div className="flex min-w-0 flex-col gap-0.5">
                  <span className={`text-sm ${isSelected ? "font-semibold" : "font-medium"}`}>
                    {item.label}
                  </span>
                  {item.sub && (
                    <span className="text-[11px] text-muted">{item.sub}</span>
                  )}
                </div>
                {isSelected && <Check size={13} className="shrink-0 text-accent" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ── Profile dropdown ─────────────────────────────────────────── */
function ProfileDropdown({ state }: { state: AppState }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const profile = profileByRole[state.role];

  useEffect(() => {
    if (!open) return;
    function onMouseDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex h-[46px] items-center gap-3 rounded-xl border border-stone-200 bg-white px-3 transition hover:bg-stone-50"
      >
        <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white ${profile.avatarBg}`}>
          {profile.initials}
        </span>
        <div className="flex flex-col items-start leading-tight">
          <span className="text-sm font-semibold text-ink">{profile.name}</span>
          <span className="text-[11px] text-muted">{state.role}</span>
        </div>
        <TriangleDown open={open} />
      </button>

      {open && (
        <div className="absolute right-0 top-[calc(100%+4px)] z-50 w-[260px] rounded-lg border border-line bg-white py-1 shadow-lg">
          {roles.map((role) => {
            const p = profileByRole[role];
            const isSelected = state.role === role;
            return (
              <button
                key={role}
                onClick={() => { state.setRole(role); setOpen(false); }}
                className={`flex w-full items-center gap-3 px-3 py-2.5 text-left transition ${
                  isSelected ? "bg-stone-50" : "hover:bg-stone-50"
                }`}
              >
                <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white ${p.avatarBg}`}>
                  {p.initials}
                </span>
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className={`text-sm ${isSelected ? "font-semibold text-ink" : "font-medium text-ink"}`}>
                    {p.name}
                  </span>
                  <span className="text-[11px] text-muted">{role}</span>
                </div>
                {isSelected && <Check size={13} className="shrink-0 text-accent" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function TopBar({ state }: TopBarProps) {
  const location = useLocation();
  const [paletteOpen, setPaletteOpen] = useState(false);

  const lockedEnv  = lockedEnvByRoute[location.pathname];
  const prevEnvRef = useRef(state.environment);
  const [prodGlowKey, setProdGlowKey] = useState(0);

  useEffect(() => {
    const defaultEnv = defaultEnvByRoute[location.pathname];
    if (defaultEnv) state.setEnvironment(defaultEnv);
  }, [location.pathname]);

  useEffect(() => {
    if (state.environment === "Production" && prevEnvRef.current !== "Production") {
      setProdGlowKey((k) => k + 1);
    }
    prevEnvRef.current = state.environment;
  }, [state.environment]);

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

  const isHome         = location.pathname === "/";
  const isEvaluatePage = location.pathname === "/evaluate";
  const showWorkspace  = !isHome;
  const agentBelongsToWorkspace = state.agent?.workspaceId === state.workspace.id;
  const showAgent      = agentBelongsToWorkspace && ["/agent", "/build/development", "/build/production-safety", "/evaluate"].includes(location.pathname);
  const showEnv        = showAgent && location.pathname !== "/agent";

  const workspaceItems: DropdownItem[] = workspaces.map((ws) => ({
    id: ws.id,
    label: ws.name,
  }));

  const agentItems: DropdownItem[] = agents
    .filter((a) => a.workspaceId === state.workspace.id)
    .map((a) => ({ id: a.id, label: a.name }));

  return (
    <>
      <header className="relative flex h-14 items-center justify-between border-b border-line bg-white px-5">

        {/* Left: logo + breadcrumb */}
        <div className="flex items-center gap-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-sidebar text-xs font-bold text-white">
            D
          </div>

          {showWorkspace && (
            <>
              <div className="h-5 w-px bg-line" />
              <div className="flex items-center gap-1 text-sm">
                <BreadcrumbDropdown
                  label={state.workspace.name}
                  items={workspaceItems}
                  selectedId={state.workspace.id}
                  onSelect={state.setWorkspaceId}
                />

                {showAgent && (
                  <>
                    <ChevronRight size={16} className="shrink-0 text-stone-500" />
                    <BreadcrumbDropdown
                      label={state.agent.name}
                      items={agentItems}
                      selectedId={state.agent.id}
                      onSelect={state.setAgentId}
                    />
                  </>
                )}
              </div>
            </>
          )}
        </div>

        {/* Right: env pill switcher + search + bell + profile */}
        <div className="flex items-center gap-3">

          {showEnv && (
            <>
              <span className="text-xs font-medium text-muted">ENV:</span>
              <div className="flex items-center rounded-md border border-line bg-stone-50 p-0.5">
                {environments.map((env) => {
                  const isActive = state.environment === env;
                  const isLocked = !!lockedEnv && lockedEnv !== env;
                  const isProdActive = env === "Production" && isActive && !isEvaluatePage;
                  return (
                    <button
                      key={isProdActive ? `prod-${prodGlowKey}` : env}
                      disabled={isLocked}
                      onClick={() => { if (!lockedEnv) state.setEnvironment(env); }}
                      className={`rounded px-2.5 py-1 text-xs font-medium transition ${
                        isActive
                          ? "bg-stone-900 text-white"
                          : isLocked
                          ? "cursor-not-allowed text-stone-300"
                          : "text-muted hover:text-ink"
                      } ${isProdActive ? "prod-tab-glow" : ""}`}
                    >
                      {env}
                    </button>
                  );
                })}
              </div>
              <div className="h-5 w-px bg-line" />
            </>
          )}

          <button
            onClick={() => setPaletteOpen(true)}
            title="Search (⌘K)"
            className="flex h-8 w-8 items-center justify-center rounded-md border border-line bg-white text-muted hover:bg-stone-50 hover:text-ink"
          >
            <Search size={15} />
          </button>

          <button className="relative flex h-8 w-8 items-center justify-center rounded-md border border-line bg-white text-muted hover:bg-stone-50 hover:text-ink">
            <Bell size={16} />
            <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-0.5 text-[10px] font-semibold text-white">
              3
            </span>
          </button>

          <ProfileDropdown state={state} />
        </div>
      </header>

      {paletteOpen && (
        <CommandPalette state={state} onClose={() => setPaletteOpen(false)} />
      )}
    </>
  );
}
