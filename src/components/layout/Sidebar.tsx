import {
  BarChart3,
  Boxes,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  ClipboardCheck,
  Gauge,
  GitBranch,
  Settings,
  SquareStack,
} from "lucide-react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import type { AppState } from "../../App";
import { agents } from "../../data/mockData";

type SidebarProps = {
  state: AppState;
  collapsed: boolean;
  onToggle: () => void;
};

type ExpandableSection = "Build" | "Test" | "Evaluate" | null;


const navItemBase = "flex h-9 items-center gap-3 rounded-md px-3 text-sm font-medium transition";
const navItemCollapsed = "flex h-9 w-full items-center justify-center rounded-md text-sm font-medium transition";
const sectionButtonBase = "flex h-9 w-full items-center gap-3 rounded-md px-3 text-sm font-medium transition";
const activeClass = "bg-accent/20 text-white";
const inactiveClass = "text-stone-300 hover:bg-white/5 hover:text-white";
const disabledClass = "cursor-not-allowed text-stone-500 opacity-70";

export function Sidebar({ state, collapsed, onToggle }: SidebarProps) {
  const location = useLocation();
  const [expanded, setExpanded] = useState<ExpandableSection>(null);
  const workspaceAgents = agents.filter((agent) => agent.workspaceId === state.workspace.id);
  const hasAgent = Boolean(state.agent);

  useEffect(() => {
    if (location.pathname.startsWith("/build")) {
      setExpanded("Build");
    } else if (location.pathname === "/evaluate" && location.search.includes("test")) {
      setExpanded("Test");
    } else if (location.pathname === "/evaluate") {
      setExpanded("Evaluate");
    }
  }, [location.pathname, location.search]);

  const buildActive = location.pathname.startsWith("/build");
  const testActive = location.pathname === "/evaluate" && location.search.includes("test");
  const evaluateActive = location.pathname === "/evaluate" && !testActive;

  return (
    <aside
      className={`flex h-full shrink-0 flex-col overflow-hidden border-r border-black/20 bg-sidebar text-stone-200 transition-[width] duration-200 ${
        collapsed ? "w-14" : "w-64"
      }`}
    >
      <div className="compact-scrollbar flex-1 overflow-y-auto px-2 py-4">

        {/* Header: label + collapse toggle */}
        <div className={`flex items-center ${collapsed ? "justify-center" : "justify-between px-1"}`}>
          {!collapsed && (
            <span className="px-2 text-xs font-semibold uppercase tracking-wide text-stone-500">
              Global Navigation
            </span>
          )}
          <button
            onClick={onToggle}
            className="flex h-6 w-6 items-center justify-center rounded border border-white/15 bg-white/5 text-stone-400 hover:bg-white/10 hover:text-stone-300"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
          </button>
        </div>

        {/* Global nav */}
        <nav className="mt-2 space-y-1">
          <NavLink
            to="/"
            end
            title={collapsed ? "Home" : undefined}
            className={({ isActive }) =>
              `${collapsed ? navItemCollapsed : navItemBase} ${isActive ? activeClass : inactiveClass}`
            }
          >
            <Gauge size={17} />
            {!collapsed && "Home"}
          </NavLink>
          <NavLink
            to="/workspace"
            title={collapsed ? "Workspaces" : undefined}
            className={({ isActive }) =>
              `${collapsed ? navItemCollapsed : navItemBase} ${isActive ? activeClass : inactiveClass}`
            }
          >
            <Boxes size={17} />
            {!collapsed && "Workspaces"}
          </NavLink>
        </nav>

        {/* Divider */}
        <div className="mx-1 my-4 h-px bg-white/10" />

        {/* Agent Workspace section label */}
        {!collapsed && (
          <div className="px-3 text-xs font-semibold uppercase tracking-wide text-stone-500">
            Agent Workspace
          </div>
        )}

        {/* Agent context group */}
        {collapsed ? (
          <>
            <div className="mt-2 flex justify-center">
              {hasAgent ? (
                <span
                  className="relative flex h-8 w-8 items-center justify-center rounded-md bg-white/10 text-xs font-semibold text-white"
                  title={state.agent.name}
                >
                  PI
                  <span className={"absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-accent ring-1 ring-sidebar"} />
                </span>
              ) : (
                <span className="flex h-8 w-8 items-center justify-center rounded-md border border-dashed border-white/20 text-stone-500">
                  —
                </span>
              )}
            </div>
            <nav className="mt-2 space-y-1">
              <AgentNavLink
                enabled={hasAgent}
                to="/agent"
                active={location.pathname === "/agent"}
                icon={<SquareStack size={17} />}
                collapsed={collapsed}
              >
                Overview
              </AgentNavLink>
              <ExpandableNav
                label="Build" icon={<GitBranch size={17} />} enabled={hasAgent}
                active={buildActive} expanded={false}
                onToggle={() => setExpanded(expanded === "Build" ? null : "Build")}
                collapsed={collapsed} defaultTo="/build/development"
              >
                <></>
              </ExpandableNav>
              <ExpandableNav
                label="Test" icon={<ClipboardCheck size={17} />} enabled={hasAgent}
                active={testActive} expanded={false}
                onToggle={() => setExpanded(expanded === "Test" ? null : "Test")}
                collapsed={collapsed} defaultTo="/evaluate?tab=test-results"
              >
                <></>
              </ExpandableNav>
              <ExpandableNav
                label="Evaluate" icon={<BarChart3 size={17} />} enabled={hasAgent}
                active={evaluateActive} expanded={false}
                onToggle={() => setExpanded(expanded === "Evaluate" ? null : "Evaluate")}
                collapsed={collapsed} defaultTo="/evaluate"
              >
                <></>
              </ExpandableNav>
            </nav>
          </>
        ) : (
          <div className="mt-2 rounded-lg border border-white/[0.08] bg-white/[0.03] p-1.5">
            {/* Agent selector */}
            <div
              className={`rounded-md border p-2 ${
                hasAgent ? "border-accent/30 bg-white/[0.06]" : "border-white/10 bg-white/[0.04]"
              }`}
            >
              {hasAgent ? (
                <>
                  <label className="flex items-center gap-2">
                    <span className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-white/10 text-xs font-semibold text-white">
                      PI
                      <span className={"absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-accent ring-1 ring-sidebar"} />
                    </span>
                    <select
                      aria-label="Sidebar agent selector"
                      value={state.agent.id}
                      onChange={(event) => state.setAgentId(event.target.value)}
                      className="h-8 min-w-0 flex-1 rounded-md border border-white/10 bg-sidebarSoft px-2 text-sm font-medium text-white outline-none focus:border-accent"
                    >
                      {workspaceAgents.map((agent) => (
                        <option key={agent.id} value={agent.id}>
                          {agent.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <p className="mt-1.5 px-1 text-[11px] text-stone-500">Active working agent</p>
                </>
              ) : (
                <div className="rounded-md border border-dashed border-white/10 px-3 py-2 text-sm text-stone-400">
                  Select an agent to start
                </div>
              )}
            </div>

            {/* Agent nav items */}
            <nav className="mt-1 space-y-0.5">
              <AgentNavLink
                enabled={hasAgent}
                to="/agent"
                active={location.pathname === "/agent"}
                icon={<SquareStack size={17} />}
                collapsed={collapsed}
              >
                Overview
              </AgentNavLink>
              <ExpandableNav
                label="Build" icon={<GitBranch size={17} />} enabled={hasAgent}
                active={buildActive} expanded={expanded === "Build"}
                onToggle={() => setExpanded(expanded === "Build" ? null : "Build")}
                collapsed={collapsed} defaultTo="/build/development"
              >
                <SubLink to="/build/development" active={location.pathname === "/build/development"}>
                  Development
                </SubLink>
                <SubLink to="/build/production-safety" active={location.pathname === "/build/production-safety"}>
                  Production Safety
                </SubLink>
              </ExpandableNav>
              <ExpandableNav
                label="Test" icon={<ClipboardCheck size={17} />} enabled={hasAgent}
                active={testActive} expanded={expanded === "Test"}
                onToggle={() => setExpanded(expanded === "Test" ? null : "Test")}
                collapsed={collapsed} defaultTo="/evaluate?tab=test-results"
              >
                <SubLink
                  to="/evaluate?tab=test-results"
                  active={location.pathname === "/evaluate" && location.search.includes("test-results")}
                >
                  Test Results
                </SubLink>
                <SubLink
                  to="/evaluate?tab=quality"
                  active={location.pathname === "/evaluate" && location.search.includes("quality")}
                >
                  Quality Checks
                </SubLink>
              </ExpandableNav>
              <ExpandableNav
                label="Evaluate" icon={<BarChart3 size={17} />} enabled={hasAgent}
                active={evaluateActive} expanded={expanded === "Evaluate"}
                onToggle={() => setExpanded(expanded === "Evaluate" ? null : "Evaluate")}
                collapsed={collapsed} defaultTo="/evaluate"
              >
                <SubLink
                  to="/evaluate"
                  active={location.pathname === "/evaluate" && location.search === ""}
                >
                  Overview
                </SubLink>
                <SubLink
                  to="/evaluate?tab=trends"
                  active={location.pathname === "/evaluate" && location.search.includes("trends")}
                >
                  Trends
                </SubLink>
                <SubLink
                  to="/evaluate?tab=reports"
                  active={location.pathname === "/evaluate" && location.search.includes("reports")}
                >
                  Reports
                </SubLink>
              </ExpandableNav>
            </nav>

            {!hasAgent && (
              <p className="mt-2 px-2 text-xs text-stone-500">Select an agent to start</p>
            )}
          </div>
        )}
      </div>

      <div className="shrink-0 border-t border-white/10 p-2">
        <div className="space-y-1">
          <Link
            to="/agent"
            title={collapsed ? "Settings" : undefined}
            className={`${collapsed ? navItemCollapsed : navItemBase} ${inactiveClass}`}
          >
            <Settings size={17} />
            {!collapsed && "Settings"}
          </Link>
          <button
            title={collapsed ? "Help" : undefined}
            className={`${collapsed ? navItemCollapsed : navItemBase} w-full ${inactiveClass}`}
          >
            <CircleHelp size={17} />
            {!collapsed && "Help"}
          </button>
        </div>
      </div>
    </aside>
  );
}

function AgentNavLink({
  enabled, to, active, icon, children, collapsed,
}: {
  enabled: boolean;
  to: string;
  active: boolean;
  icon: ReactNode;
  children: ReactNode;
  collapsed: boolean;
}) {
  const base = collapsed ? navItemCollapsed : navItemBase;
  const label = typeof children === "string" ? children : undefined;

  if (!enabled) {
    return (
      <div className={`${base} ${disabledClass}`} title={collapsed ? label : undefined}>
        {icon}
        {!collapsed && children}
      </div>
    );
  }
  return (
    <Link
      to={to}
      className={`${base} ${active ? activeClass : inactiveClass}`}
      title={collapsed ? label : undefined}
    >
      {icon}
      {!collapsed && children}
    </Link>
  );
}

function ExpandableNav({
  label, icon, enabled, active, expanded, onToggle, children, collapsed, defaultTo,
}: {
  label: string;
  icon: ReactNode;
  enabled: boolean;
  active: boolean;
  expanded: boolean;
  onToggle: () => void;
  children: ReactNode;
  collapsed: boolean;
  defaultTo: string;
}) {
  if (collapsed) {
    if (!enabled) {
      return <div className={`${navItemCollapsed} ${disabledClass}`} title={label}>{icon}</div>;
    }
    return (
      <Link to={defaultTo} className={`${navItemCollapsed} ${active ? activeClass : inactiveClass}`} title={label}>
        {icon}
      </Link>
    );
  }

  if (!enabled) {
    return (
      <div className={`${sectionButtonBase} ${disabledClass}`}>
        {icon}
        <span className="flex-1 text-left">{label}</span>
        <ChevronRight size={15} />
      </div>
    );
  }

  return (
    <div>
      <button onClick={onToggle} className={`${sectionButtonBase} ${active ? activeClass : inactiveClass}`}>
        {icon}
        <span className="flex-1 text-left">{label}</span>
        {expanded ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
      </button>
      {expanded && <div className="mt-1 space-y-1 pl-8">{children}</div>}
    </div>
  );
}

function SubLink({ to, active, children }: { to: string; active: boolean; children: ReactNode }) {
  return (
    <Link
      to={to}
      className={`flex h-8 items-center rounded-md px-3 text-sm transition ${
        active ? "bg-accent/15 text-white" : "text-stone-400 hover:bg-white/5 hover:text-white"
      }`}
    >
      {children}
    </Link>
  );
}
