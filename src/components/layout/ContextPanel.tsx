import { Plus, Search, X } from "lucide-react";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { agents, workspaces } from "../../data/mockData";
import type { AppState } from "../../App";

type Props = { state: AppState };

type SubNavItem = {
  label: string;
  to: string;
  isActive: (pathname: string, search: string) => boolean;
};

const agentSubNav: SubNavItem[] = [
  { label: "Build",    to: "/build/development",         isActive: (p)    => p.startsWith("/build") },
  { label: "Test",     to: "/evaluate?tab=test-results", isActive: (p, s) => p === "/evaluate" && s.includes("test") },
  { label: "Evaluate", to: "/evaluate",                  isActive: (p, s) => p === "/evaluate" && !s.includes("test") },
];

export function ContextPanel({ state }: Props) {
  const location = useLocation();

  const showAgents =
    location.pathname.startsWith("/agent") ||
    location.pathname.startsWith("/build") ||
    location.pathname.startsWith("/evaluate");

  const showWorkspaces = location.pathname.startsWith("/workspace");

  if (showAgents) return <AgentPanel state={state} />;
  if (showWorkspaces) return <WorkspacePanel state={state} />;
  return null;
}

function AgentPanel({ state }: Props) {
  const [query, setQuery] = useState("");
  const location = useLocation();
  const navigate = useNavigate();

  const wsMap = Object.fromEntries(workspaces.map((w) => [w.id, w.name]));

  const filtered = agents.filter(
    (a) =>
      a.name.toLowerCase().includes(query.toLowerCase()) ||
      wsMap[a.workspaceId]?.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div className="flex h-full w-60 shrink-0 flex-col border-r border-black/20 bg-[#1c1c24] text-stone-300">
      {/* Header */}
      <div className="shrink-0 border-b border-white/[0.07] p-3">
        <div className="mb-2.5 flex items-center justify-between">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-stone-400">
            Agent
          </span>
          <button className="flex items-center gap-1 rounded px-1.5 py-1 text-[10px] text-stone-400 transition hover:bg-white/10 hover:text-stone-200">
            <Plus size={11} />
            New
          </button>
        </div>
        <div className="flex items-center gap-2 rounded-md border border-white/10 bg-white/[0.05] px-2.5 py-1.5">
          <Search size={11} className="shrink-0 text-stone-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search agents…"
            className="min-w-0 flex-1 bg-transparent text-xs text-stone-300 placeholder-stone-500 outline-none"
          />
          {query && (
            <button onClick={() => setQuery("")}>
              <X size={10} className="text-stone-600 hover:text-stone-400" />
            </button>
          )}
        </div>
      </div>

      {/* Agent list */}
      <div className="compact-scrollbar flex-1 overflow-y-auto py-1">
        {filtered.map((agent) => {
          const isSelected = agent.id === state.agent.id;
          return (
            <div key={agent.id}>
              {/* Agent row */}
              <button
                onClick={() => {
                  state.setAgentId(agent.id);
                  navigate("/agent");
                }}
                className={`flex w-full items-start gap-2.5 rounded-md mx-1.5 px-2.5 py-2 text-left transition ${
                  isSelected
                    ? "ring-1 ring-accent/60 bg-accent/[0.08] text-white"
                    : "text-stone-300 hover:bg-white/[0.05] hover:text-white"
                }`}
                style={{ width: "calc(100% - 12px)" }}
              >
                <div className="min-w-0 flex-1">
                  <div className="truncate text-xs font-medium">{agent.name}</div>
                  <div className="truncate text-[10px] text-stone-500">
                    {wsMap[agent.workspaceId]}
                  </div>
                </div>
              </button>

              {/* Sub-nav — only for selected agent */}
              {isSelected && (
                <div className="ml-4 mt-0.5 mb-1 flex flex-col gap-0.5 border-l border-accent/30 pl-3">
                  {agentSubNav.map((item) => {
                    const active = item.isActive(location.pathname, location.search);
                    return (
                      <Link
                        key={item.label}
                        to={item.to}
                        className={`rounded px-2 py-1.5 text-xs transition ${
                          active
                            ? "font-medium text-white"
                            : "text-stone-400 hover:bg-white/[0.04] hover:text-stone-200"
                        }`}
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
    </div>
  );
}

function WorkspacePanel({ state }: Props) {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const filtered = workspaces.filter((w) =>
    w.name.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div className="flex h-full w-60 shrink-0 flex-col border-r border-black/20 bg-[#1c1c24] text-stone-300">
      {/* Header */}
      <div className="shrink-0 border-b border-white/[0.07] p-3">
        <div className="mb-2.5 flex items-center justify-between">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-stone-400">
            Workspace
          </span>
          <button className="flex items-center gap-1 rounded px-1.5 py-1 text-[10px] text-stone-400 transition hover:bg-white/10 hover:text-stone-200">
            <Plus size={11} />
            New
          </button>
        </div>
        <div className="flex items-center gap-2 rounded-md border border-white/10 bg-white/[0.05] px-2.5 py-1.5">
          <Search size={11} className="shrink-0 text-stone-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search workspaces…"
            className="min-w-0 flex-1 bg-transparent text-xs text-stone-300 placeholder-stone-500 outline-none"
          />
          {query && (
            <button onClick={() => setQuery("")}>
              <X size={10} className="text-stone-600 hover:text-stone-400" />
            </button>
          )}
        </div>
      </div>

      {/* List */}
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
              className={`flex w-full items-start gap-2.5 px-3 py-2 text-left transition ${
                active
                  ? "bg-white/[0.08] text-white"
                  : "text-stone-300 hover:bg-white/[0.05] hover:text-white"
              }`}
            >
              <div className="min-w-0 flex-1">
                <div className="truncate text-xs font-medium">{ws.name}</div>
                <div className="text-[10px] text-stone-500">
                  {ws.agents} agents · {ws.region}
                </div>
              </div>
            </button>
          );
        })}
        {filtered.length === 0 && (
          <p className="px-4 py-3 text-xs text-stone-400">No workspaces found</p>
        )}
      </div>
    </div>
  );
}
