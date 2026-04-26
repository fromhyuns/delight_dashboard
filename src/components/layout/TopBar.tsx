import { Bell, Search, X } from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { agents, workspaces } from "../../data/mockData";
import type { AppState } from "../../App";
import { AgentSelector } from "../controls/AgentSelector";
import { EnvironmentSelector } from "../controls/EnvironmentSelector";
import { RoleSwitcher } from "../controls/RoleSwitcher";
import type { Environment } from "../../types";

type TopBarProps = {
  state: AppState;
};

export function TopBar({ state }: TopBarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const routeEnvironment: Environment | undefined =
    location.pathname === "/build/development"
      ? "Development"
      : location.pathname === "/build/production-safety"
        ? "Production"
        : location.pathname === "/evaluate"
          ? "Production"
          : undefined;
  const normalizedQuery = query.trim().toLowerCase();
  const results = useMemo(
    () => ({
      agents: agents
        .filter((agent) => agent.name.toLowerCase().includes(normalizedQuery))
        .slice(0, 4),
      workspaces: workspaces
        .filter((workspace) => workspace.name.toLowerCase().includes(normalizedQuery))
        .slice(0, 4),
      actions: [
        { label: "Open Build", path: "/build/development" },
        { label: "Review Production Safety", path: "/build/production-safety" },
        { label: "Evaluate agent", path: "/evaluate" },
        { label: "View Workspace Detail", path: "/workspace" },
      ].filter((action) => action.label.toLowerCase().includes(normalizedQuery)),
    }),
    [normalizedQuery],
  );

  useEffect(() => {
    if (routeEnvironment) {
      state.setEnvironment(routeEnvironment);
    }
  }, [location.pathname]);

  function closeSearch() {
    setSearchOpen(false);
    setQuery("");
  }

  function go(path: string) {
    navigate(path);
    closeSearch();
  }

  return (
    <header className="relative flex h-16 items-center justify-between border-b border-line bg-white px-5">
      <div className="flex items-center gap-4">
        <div className="flex shrink-0 items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-sidebar text-sm font-semibold text-white">
            D
          </div>
          <div className="whitespace-nowrap">
            <div className="text-sm font-semibold text-ink">Delight.ai</div>
            <div className="text-xs text-muted">NAVER Corp</div>
          </div>
        </div>
        <label className="flex items-center gap-2 whitespace-nowrap text-xs text-muted">
          Workspace
          <select
            value={state.workspace.id}
            onChange={(event) => state.setWorkspaceId(event.target.value)}
            className="h-9 min-w-48 rounded-md border border-line bg-white px-2 text-sm font-medium text-ink outline-none focus:border-accent"
          >
            {workspaces.map((workspace) => (
              <option key={workspace.id} value={workspace.id}>
                {workspace.name}
              </option>
            ))}
          </select>
        </label>
        <AgentSelector workspaceId={state.workspace.id} value={state.agent.id} onChange={state.setAgentId} />
        {routeEnvironment && (
          <label className="flex items-center gap-2 whitespace-nowrap text-xs text-muted">
            Environment
            <EnvironmentSelector value={state.environment} onChange={state.setEnvironment} />
          </label>
        )}
      </div>

      <div className="flex min-w-[260px] items-center rounded-md border border-line bg-stone-50 px-3 text-muted focus-within:border-accent">
        <Search size={16} />
        <input
          aria-label="Global search"
          placeholder="Search workspaces, agents, runs"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onFocus={() => setSearchOpen(true)}
          className="h-9 flex-1 bg-transparent px-2 text-sm text-ink outline-none placeholder:text-muted"
        />
      </div>

      <div className="flex items-center gap-3">
        <button className="flex h-9 w-9 items-center justify-center rounded-md border border-line bg-white text-muted hover:bg-stone-50 hover:text-ink">
          <Bell size={17} />
        </button>
        <RoleSwitcher value={state.role} onChange={state.setRole} />
      </div>

      {searchOpen && (
        <div className="absolute left-1/2 top-14 z-30 w-[520px] -translate-x-1/2 rounded-lg border border-line bg-white p-2 shadow-lg">
          <div className="flex items-center justify-between border-b border-line px-2 py-1.5">
            <div className="text-xs font-semibold uppercase tracking-wide text-muted">Command palette</div>
            <button
              aria-label="Close search"
              onClick={closeSearch}
              className="flex h-7 w-7 items-center justify-center rounded-md text-muted hover:bg-stone-50 hover:text-ink"
            >
              <X size={15} />
            </button>
          </div>
          <div className="max-h-[420px] overflow-auto py-2">
            <SearchGroup title="Agents">
              {results.agents.map((agent) => (
                <button
                  key={agent.id}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => {
                    state.setWorkspaceId(agent.workspaceId);
                    state.setAgentId(agent.id);
                    go("/agent");
                  }}
                  className="flex w-full items-center justify-between rounded-md px-2 py-2 text-left hover:bg-stone-50"
                >
                  <span>
                    <span className="block text-sm font-medium text-ink">{agent.name}</span>
                    <span className="block text-xs text-muted">Open agent overview</span>
                  </span>
                  <span className="text-xs text-muted">Agent</span>
                </button>
              ))}
            </SearchGroup>
            <SearchGroup title="Workspaces">
              {results.workspaces.map((workspace) => (
                <button
                  key={workspace.id}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => {
                    state.setWorkspaceId(workspace.id);
                    go("/workspace");
                  }}
                  className="flex w-full items-center justify-between rounded-md px-2 py-2 text-left hover:bg-stone-50"
                >
                  <span>
                    <span className="block text-sm font-medium text-ink">{workspace.name}</span>
                    <span className="block text-xs text-muted">{workspace.agents} agents · {workspace.region}</span>
                  </span>
                  <span className="text-xs text-muted">Workspace</span>
                </button>
              ))}
            </SearchGroup>
            <SearchGroup title="Actions">
              {results.actions.map((action) => (
                <button
                  key={action.label}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => go(action.path)}
                  className="flex w-full items-center justify-between rounded-md px-2 py-2 text-left hover:bg-stone-50"
                >
                  <span className="text-sm font-medium text-ink">{action.label}</span>
                  <span className="text-xs text-muted">Action</span>
                </button>
              ))}
            </SearchGroup>
          </div>
        </div>
      )}
    </header>
  );
}

function SearchGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="px-1 py-1">
      <div className="px-2 py-1 text-xs font-semibold uppercase tracking-wide text-muted">{title}</div>
      {children}
    </div>
  );
}
