import { Bot, ChevronLeft, Filter, Plus, Search, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { agents, workspaces } from "../../data/mockData";
import type { AppState } from "../../App";

type Props = { state: AppState; collapsed: boolean; onCollapse: () => void };
type PanelProps = { state: AppState; onCollapse: () => void };

type SubNavItem = {
  label: string;
  to?: string;
  isActive: (pathname: string, search: string) => boolean;
};

const agentSubNav: SubNavItem[] = [
  { label: "Build",    to: "/build/development",         isActive: (p)    => p.startsWith("/build") },
  { label: "Test",                                   isActive: (p, s) => p === "/evaluate" && s.includes("test") },
  { label: "Evaluate", to: "/evaluate",                  isActive: (p, s) => p === "/evaluate" && !s.includes("test") },
];

type AgentQuick = "all" | "recent";

const agentStatusDot: Record<string, string> = {
  Live:   "bg-teal-500",
  Review: "bg-amber-500",
  Draft:  "bg-stone-400",
  Paused: "bg-red-400",
};
type WorkspaceQuick = "all" | "managed" | "recent";

/* ─── Shared small components ─────────────────────────────── */

function Chip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded px-2 py-1 text-xs font-medium transition ${
        active
          ? "bg-white/15 text-stone-100"
          : "text-stone-400 hover:bg-white/[0.05] hover:text-stone-200"
      }`}
    >
      {label}
    </button>
  );
}

function PopoverSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div>
      <div className="mb-1 text-[9px] font-semibold uppercase tracking-widest text-stone-500">
        {title}
      </div>
      <div className="flex flex-col">{children}</div>
    </div>
  );
}

function CheckOption({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-[11px] transition ${
        selected
          ? "text-stone-100"
          : "text-stone-400 hover:bg-white/[0.05] hover:text-stone-200"
      }`}
    >
      <span
        className={`h-3 w-3 shrink-0 rounded-sm border transition ${
          selected ? "border-stone-300 bg-stone-300" : "border-stone-600"
        }`}
      />
      {label}
    </button>
  );
}

function RadioOption({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-[11px] transition ${
        selected
          ? "text-stone-100"
          : "text-stone-400 hover:bg-white/[0.05] hover:text-stone-200"
      }`}
    >
      <span
        className={`h-3 w-3 shrink-0 rounded-full border transition ${
          selected ? "border-stone-300 bg-stone-300" : "border-stone-600"
        }`}
      />
      {label}
    </button>
  );
}

/* ─── Context router ───────────────────────────────────────── */

export function ContextPanel({ state, collapsed, onCollapse }: Props) {
  const location = useLocation();

  const showAgents =
    location.pathname.startsWith("/agent") ||
    location.pathname.startsWith("/build") ||
    location.pathname.startsWith("/evaluate");

  const showWorkspaces = location.pathname.startsWith("/workspace");

  if (!showAgents && !showWorkspaces) return null;

  return (
    <div className={`shrink-0 overflow-hidden transition-[width] duration-200 ease-in-out ${collapsed ? "w-0" : "w-60"}`}>
      {showAgents && <AgentPanel state={state} onCollapse={onCollapse} />}
      {showWorkspaces && <WorkspacePanel state={state} onCollapse={onCollapse} />}
    </div>
  );
}

/* ─── Agent panel ──────────────────────────────────────────── */

function AgentPanel({ state, onCollapse }: PanelProps) {
  const [query, setQuery] = useState("");
  const [quick, setQuick] = useState<AgentQuick>("all");
  const [showFilter, setShowFilter] = useState(false);
  const [filterLifecycle, setFilterLifecycle] = useState<string[]>([]);
  const [filterWorkspace, setFilterWorkspace] = useState<string[]>([]);
  const [filterAttention, setFilterAttention] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("Recently updated");
  const filterRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();

  const wsMap = Object.fromEntries(workspaces.map((w) => [w.id, w.name]));

  useEffect(() => {
    if (!showFilter) return;
    function onMouseDown(e: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setShowFilter(false);
      }
    }
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, [showFilter]);

  const filtered = agents.filter((a) => {
    const q = query.toLowerCase();
    if (q && !a.name.toLowerCase().includes(q) && !wsMap[a.workspaceId]?.toLowerCase().includes(q)) return false;
    if (filterLifecycle.length > 0 && !filterLifecycle.includes(a.status)) return false;
    if (filterWorkspace.length > 0 && !filterWorkspace.includes(wsMap[a.workspaceId])) return false;
    return true;
  });

  const hasAdvanced = filterLifecycle.length > 0 || filterWorkspace.length > 0 || filterAttention.length > 0;

  function toggle(arr: string[], val: string, set: (v: string[]) => void) {
    set(arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val]);
  }

  return (
    <div className="relative flex h-full w-60 shrink-0 flex-col border-r border-black/20 bg-[#1c1c24] text-stone-300">


      {/* Header */}
      <div className="shrink-0 border-b border-white/[0.12] p-3">
        <div className="mb-2.5 flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-widest text-stone-300">
            Agent
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowFilter((v) => !v)}
              title="Filter agents"
              className={`flex items-center gap-1 rounded border px-2 py-1 text-xs font-medium transition ${
                hasAdvanced || showFilter
                  ? "border-white/20 bg-white/10 text-stone-200"
                  : "border-white/10 text-stone-300 hover:border-white/20 hover:bg-white/10 hover:text-stone-200"
              }`}
            >
              <Filter size={12} />
              {hasAdvanced && (
                <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              )}
            </button>
            <button
              onClick={onCollapse}
              title="패널 접기"
              className="flex h-5 w-5 items-center justify-center rounded text-stone-600 transition hover:bg-white/10 hover:text-stone-400"
            >
              <ChevronLeft size={13} />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="flex items-center gap-2 rounded-md border border-white/[0.18] bg-white/[0.08] px-2.5 py-2">
          <Search size={13} className="shrink-0 text-stone-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search agents..."
            className="min-w-0 flex-1 bg-transparent text-sm text-stone-200 placeholder-stone-400 outline-none"
          />
          {query && (
            <button onClick={() => setQuery("")}>
              <X size={10} className="text-stone-600 hover:text-stone-400" />
            </button>
          )}
        </div>

        {/* Quick filter chips */}
        <div className="mt-2 flex gap-0.5">
          <Chip label="All"    active={quick === "all"}    onClick={() => setQuick("all")} />
          <Chip label="Recent" active={quick === "recent"} onClick={() => setQuick("recent")} />
        </div>
      </div>

      {/* Advanced filter popover */}
      {showFilter && (
        <div
          ref={filterRef}
          className="absolute left-full top-0 z-50 ml-1 w-56 rounded-lg border border-white/10 bg-[#1c1c24] p-3 shadow-2xl"
        >
          <div className="mb-3 flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-stone-400">
              Filter Agents
            </span>
            <button onClick={() => setShowFilter(false)}>
              <X size={11} className="text-stone-500 hover:text-stone-300" />
            </button>
          </div>

          <div className="flex flex-col gap-3.5">
            <PopoverSection title="Scope">
              {["All agents", "Assigned to me", "Recently viewed"].map((opt) => (
                <RadioOption key={opt} label={opt} selected={false} onClick={() => {}} />
              ))}
            </PopoverSection>

            <PopoverSection title="Workspace">
              {workspaces.map((ws) => (
                <CheckOption
                  key={ws.id}
                  label={ws.name}
                  selected={filterWorkspace.includes(ws.name)}
                  onClick={() => toggle(filterWorkspace, ws.name, setFilterWorkspace)}
                />
              ))}
            </PopoverSection>

            <PopoverSection title="Lifecycle">
              {["Draft", "Testing", "Live", "Paused"].map((opt) => (
                <CheckOption
                  key={opt}
                  label={opt}
                  selected={filterLifecycle.includes(opt)}
                  onClick={() => toggle(filterLifecycle, opt, setFilterLifecycle)}
                />
              ))}
            </PopoverSection>

            <PopoverSection title="Needs attention">
              {["Failed tests", "Approval pending", "Production risk"].map((opt) => (
                <CheckOption
                  key={opt}
                  label={opt}
                  selected={filterAttention.includes(opt)}
                  onClick={() => toggle(filterAttention, opt, setFilterAttention)}
                />
              ))}
            </PopoverSection>

            <PopoverSection title="Sort by">
              {["Recently updated", "Name A–Z", "Risk first"].map((opt) => (
                <RadioOption
                  key={opt}
                  label={opt}
                  selected={sortBy === opt}
                  onClick={() => setSortBy(opt)}
                />
              ))}
            </PopoverSection>
          </div>

          {hasAdvanced && (
            <button
              onClick={() => {
                setFilterLifecycle([]);
                setFilterWorkspace([]);
                setFilterAttention([]);
              }}
              className="mt-3 w-full rounded px-2 py-1.5 text-[11px] text-stone-500 transition hover:text-stone-300"
            >
              Clear filters
            </button>
          )}
        </div>
      )}

      {/* Agent list */}
      <div className="compact-scrollbar flex-1 overflow-y-auto py-1">
        {filtered.map((agent) => {
          const isSelected = agent.id === state.agent.id;
          return (
            <div key={agent.id}>
              <button
                onClick={() => {
                  state.setAgentId(agent.id);
                  navigate("/agent");
                }}
                style={{ width: "calc(100% - 12px)" }}
                className={`relative mx-1.5 flex items-center gap-2 rounded-md px-2.5 py-2 text-left transition ${
                  isSelected
                    ? "bg-accent/15 text-white"
                    : "text-stone-300 hover:bg-white/[0.05] hover:text-white"
                }`}
              >
                {isSelected && (
                  <span className="absolute left-0 top-0 h-full w-0.5 rounded-r-full bg-accent" />
                )}
                <div className="relative shrink-0">
                  <div className="flex h-5 w-5 items-center justify-center rounded bg-stone-600">
                    <Bot size={11} className="text-white" />
                  </div>
                  {agent.hasActivity && (
                    <span className="absolute -right-0.5 -top-0.5 h-1.5 w-1.5 rounded-full bg-purple-500 ring-1 ring-[#1c1c24]" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[13px] font-medium">{agent.name}</div>
                  <div className="truncate text-xs text-stone-400">
                    #{wsMap[agent.workspaceId]?.toUpperCase()}
                  </div>
                </div>
              </button>

              {/* Sub-nav — only for selected agent */}
              {isSelected && (
                <div className="mb-1 ml-4 mt-0.5 flex flex-col gap-0.5 border-l border-accent/30 pl-3">
                  {agentSubNav.map((item) => {
                    const active = item.isActive(location.pathname, location.search);
                    const className = `rounded px-2 py-1.5 text-xs transition ${
                      active
                        ? "font-medium text-white"
                        : "text-stone-400 hover:bg-white/[0.04] hover:text-stone-200"
                    }`;

                    if (!item.to) {
                      return (
                        <span key={item.label} className={className}>
                          {item.label}
                        </span>
                      );
                    }

                    return (
                      <Link
                        key={item.label}
                        to={item.to}
                        className={className}
                      >
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
        {filtered.length === 0 && (
          <p className="px-4 py-3 text-xs text-stone-400">No agents found</p>
        )}
      </div>

      {/* Footer */}
      {state.role !== "Agent Builder / Operator" && (
        <div className="shrink-0 border-t border-white/[0.12] p-3">
          <button className="flex w-full items-center justify-center gap-2 rounded-md border border-white/20 bg-white/[0.07] px-3 py-2 text-xs font-semibold text-stone-200 transition hover:border-white/30 hover:bg-white/[0.13] hover:text-white">
            <Plus size={13} />
            New Agent
          </button>
        </div>
      )}
    </div>
  );
}

/* ─── Workspace panel ──────────────────────────────────────── */

function WorkspacePanel({ state, onCollapse }: PanelProps) {
  const [query, setQuery] = useState("");
  const [quick, setQuick] = useState<WorkspaceQuick>("all");
  const [showFilter, setShowFilter] = useState(false);
  const [filterRegion, setFilterRegion] = useState<string[]>([]);
  const [filterState, setFilterState] = useState("");
  const [filterAttention, setFilterAttention] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("Recently updated");
  const filterRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!showFilter) return;
    function onMouseDown(e: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setShowFilter(false);
      }
    }
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, [showFilter]);

  const filtered = workspaces.filter((w) => {
    const q = query.toLowerCase();
    if (q && !w.name.toLowerCase().includes(q)) return false;
    if (filterRegion.length > 0 && !filterRegion.includes(w.region)) return false;
    return true;
  });

  const hasAdvanced = filterRegion.length > 0 || !!filterState || filterAttention.length > 0;

  function toggle(arr: string[], val: string, set: (v: string[]) => void) {
    set(arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val]);
  }

  return (
    <div className="relative flex h-full w-60 shrink-0 flex-col border-r border-black/20 bg-[#1c1c24] text-stone-300">
      {/* Header */}
      <div className="shrink-0 border-b border-white/[0.12] p-3">
        <div className="mb-2.5 flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-widest text-stone-300">
            Workspace
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowFilter((v) => !v)}
              title="Filter workspaces"
              className={`flex items-center gap-1 rounded border px-2 py-1 text-xs font-medium transition ${
                hasAdvanced || showFilter
                  ? "border-white/20 bg-white/10 text-stone-200"
                  : "border-white/10 text-stone-300 hover:border-white/20 hover:bg-white/10 hover:text-stone-200"
              }`}
            >
              <Filter size={12} />
              {hasAdvanced && (
                <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              )}
            </button>
            <button
              onClick={onCollapse}
              title="패널 접기"
              className="flex h-5 w-5 items-center justify-center rounded text-stone-600 transition hover:bg-white/10 hover:text-stone-400"
            >
              <ChevronLeft size={13} />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="flex items-center gap-2 rounded-md border border-white/[0.18] bg-white/[0.08] px-2.5 py-2">
          <Search size={13} className="shrink-0 text-stone-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search workspaces..."
            className="min-w-0 flex-1 bg-transparent text-sm text-stone-200 placeholder-stone-400 outline-none"
          />
          {query && (
            <button onClick={() => setQuery("")}>
              <X size={10} className="text-stone-600 hover:text-stone-400" />
            </button>
          )}
        </div>

        {/* Quick filter chips */}
        <div className="mt-2 flex gap-0.5">
          <Chip label="All"           active={quick === "all"}     onClick={() => setQuick("all")} />
          <Chip label="My Workspaces" active={quick === "managed"} onClick={() => setQuick("managed")} />
          <Chip label="Recent"        active={quick === "recent"}  onClick={() => setQuick("recent")} />
        </div>
      </div>

      {/* Advanced filter popover */}
      {showFilter && (
        <div
          ref={filterRef}
          className="absolute left-full top-0 z-50 ml-1 w-56 rounded-lg border border-white/10 bg-[#1c1c24] p-3 shadow-2xl"
        >
          <div className="mb-3 flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-stone-400">
              Filter Workspaces
            </span>
            <button onClick={() => setShowFilter(false)}>
              <X size={11} className="text-stone-500 hover:text-stone-300" />
            </button>
          </div>

          <div className="flex flex-col gap-3.5">
            <PopoverSection title="Scope">
              {["All workspaces", "My Workspaces", "Recently viewed"].map((opt) => (
                <RadioOption key={opt} label={opt} selected={false} onClick={() => {}} />
              ))}
            </PopoverSection>

            <PopoverSection title="Region">
              {["KR", "APAC", "Global"].map((opt) => (
                <CheckOption
                  key={opt}
                  label={opt}
                  selected={filterRegion.includes(opt)}
                  onClick={() => toggle(filterRegion, opt, setFilterRegion)}
                />
              ))}
            </PopoverSection>

            <PopoverSection title="Workspace state">
              {["Active", "Archived"].map((opt) => (
                <RadioOption
                  key={opt}
                  label={opt}
                  selected={filterState === opt}
                  onClick={() => setFilterState(filterState === opt ? "" : opt)}
                />
              ))}
            </PopoverSection>

            <PopoverSection title="Needs attention">
              {["Has failed tests", "Has pending approvals", "Has production risks"].map((opt) => (
                <CheckOption
                  key={opt}
                  label={opt}
                  selected={filterAttention.includes(opt)}
                  onClick={() => toggle(filterAttention, opt, setFilterAttention)}
                />
              ))}
            </PopoverSection>

            <PopoverSection title="Sort by">
              {["Recently updated", "Name A–Z", "Most agents", "Issues first"].map((opt) => (
                <RadioOption
                  key={opt}
                  label={opt}
                  selected={sortBy === opt}
                  onClick={() => setSortBy(opt)}
                />
              ))}
            </PopoverSection>
          </div>

          {hasAdvanced && (
            <button
              onClick={() => {
                setFilterRegion([]);
                setFilterState("");
                setFilterAttention([]);
              }}
              className="mt-3 w-full rounded px-2 py-1.5 text-[11px] text-stone-500 transition hover:text-stone-300"
            >
              Clear filters
            </button>
          )}
        </div>
      )}

      {/* Workspace list */}
      <div className="compact-scrollbar flex-1 overflow-y-auto py-1">
        {filtered.map((ws) => {
          const active = ws.id === state.workspace.id;
          return (
            <button
              key={ws.id}
              onClick={() => {
                state.setWorkspaceId(ws.id);
                navigate("/workspace");
              }}
              className={`relative flex w-full items-center gap-2 py-3 pl-4 pr-3 text-left transition ${
                active
                  ? "text-white"
                  : "text-stone-300 hover:bg-white/[0.05] hover:text-white"
              }`}
            >
              {active && (
                <div className="absolute left-0 top-0 h-full w-0.5 rounded-r-full bg-accent" />
              )}
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium uppercase tracking-wide">#{ws.name}</div>
                <div className="text-xs text-stone-400">{ws.region}</div>
              </div>
              <span className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] tabular-nums ${
                active ? "bg-white/10 text-stone-300" : "text-stone-600"
              }`}>
                {ws.agents}
              </span>
            </button>
          );
        })}
        {filtered.length === 0 && (
          <p className="px-4 py-3 text-xs text-stone-400">No workspaces found</p>
        )}
      </div>

      {/* Footer */}
      {(state.role === "Org Admin" || state.role === "Workspace Admin") && (
        <div className="shrink-0 border-t border-white/[0.12] p-3">
          <button className="flex w-full items-center justify-center gap-2 rounded-md border border-white/20 bg-white/[0.07] px-3 py-2 text-xs font-semibold text-stone-200 transition hover:border-white/30 hover:bg-white/[0.13] hover:text-white">
            <Plus size={13} />
            New Workspace
          </button>
        </div>
      )}
    </div>
  );
}
