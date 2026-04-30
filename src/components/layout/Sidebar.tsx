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

type SidebarProps = {
  state: AppState;
  collapsed: boolean;
  onToggle: () => void;
};

type ExpandableSection = "Build" | "Test" | "Evaluate" | null;

// Shared base classes
const navItemBase = "flex h-9 items-center gap-3 rounded-md px-3 text-sm font-medium transition";
const navItemCollapsed = "flex h-9 w-full items-center justify-center rounded-md text-sm font-medium transition";
const sectionButtonBase = "flex h-9 w-full items-center gap-3 rounded-md px-3 text-sm font-medium transition";

// Workflow items — strong accent when active
const workflowActiveClass = "bg-white text-stone-900 [&_svg]:text-stone-900";
const workflowInactiveClass = "text-stone-300 hover:bg-white/5 hover:text-white";

// Overview item — subtle selection, no accent fill
const overviewActiveClass = "bg-white text-stone-900 [&_svg]:text-stone-900";
const overviewInactiveClass = "text-stone-400 hover:bg-white/5 hover:text-stone-200";

// Global nav (Home/Workspaces) — same as workflow
const globalActiveClass = "bg-white text-stone-900 [&_svg]:text-stone-900";
const globalInactiveClass = "text-stone-300 hover:bg-white/5 hover:text-white";

const disabledClass = "cursor-not-allowed text-stone-500 opacity-70";

function agentStatusDot(status: AppState["agent"]["status"]) {
  if (status === "Live") return "bg-success";
  if (status === "Review") return "bg-warning";
  return "bg-stone-500";
}

export function Sidebar({ state, collapsed, onToggle }: SidebarProps) {
  const location = useLocation();
  const [expanded, setExpanded] = useState<ExpandableSection>(null);
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

  const overviewActive = location.pathname === "/agent";
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

        {/* Collapse toggle */}
        <div className={`flex items-center ${collapsed ? "justify-center" : "justify-end px-1"}`}>
          <button
            onClick={onToggle}
            className="flex h-6 w-6 items-center justify-center rounded border border-white/15 bg-white/5 text-stone-400 hover:bg-white/10 hover:text-stone-300"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
          </button>
        </div>

        {/* ── GLOBAL ──────────────────────────────────────── */}
        <nav className="mt-3 space-y-0.5">
          <NavLink
            to="/"
            end
            title={collapsed ? "Home" : undefined}
            className={({ isActive }) =>
              `${collapsed ? navItemCollapsed : navItemBase} ${isActive ? globalActiveClass : globalInactiveClass}`
            }
          >
            <Gauge size={17} />
            {!collapsed && "Home"}
          </NavLink>
          <NavLink
            to="/workspace"
            title={collapsed ? "Workspaces" : undefined}
            className={({ isActive }) =>
              `${collapsed ? navItemCollapsed : navItemBase} ${isActive ? globalActiveClass : globalInactiveClass}`
            }
          >
            <Boxes size={17} />
            {!collapsed && "Workspaces"}
          </NavLink>
        </nav>

        <div className="mx-1 my-4 h-px bg-white/10" />

        {/* ── AGENT context ───────────────────────────────── */}
        {collapsed ? (
          /* Collapsed: avatar only */
          <div className="flex justify-center">
            {hasAgent ? (
              <span
                className="relative flex h-8 w-8 items-center justify-center rounded-md bg-white/10 text-xs font-semibold text-white"
                title={state.agent.name}
              >
                PI
                <span className={`absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full ring-1 ring-sidebar ${agentStatusDot(state.agent.status)}`} />
              </span>
            ) : (
              <span className="flex h-8 w-8 items-center justify-center rounded-md border border-dashed border-white/20 text-stone-500">
                —
              </span>
            )}
          </div>
        ) : (
          /* Expanded: agent context header */
          <>
            <div className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-stone-600">
              Agent
            </div>
            <div className="rounded-md border border-white/[0.07] bg-white/[0.03] px-2.5 py-2">
              {hasAgent ? (
                <div className="flex items-center gap-2">
                  <span className="relative flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-white/10 text-xs font-semibold text-white">
                    PI
                    <span className={`absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full ring-1 ring-sidebar ${agentStatusDot(state.agent.status)}`} />
                  </span>
                  <div className="min-w-0">
                    <div className="truncate text-xs font-medium text-stone-300">{state.agent.name}</div>
                    <div className="text-[10px] text-stone-600">Active working agent</div>
                  </div>
                </div>
              ) : (
                <div className="text-xs text-stone-500">No agent selected</div>
              )}
            </div>
          </>
        )}

        {/* ── OVERVIEW (read-only) ─────────────────────────── */}
        <div className={`${collapsed ? "mt-3" : "mt-4"}`}>
          {!collapsed && (
            <div className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-widest text-stone-600">
              Overview
            </div>
          )}
          {hasAgent ? (
            <Link
              to="/agent"
              title={collapsed ? "Overview" : undefined}
              className={`${collapsed ? navItemCollapsed : navItemBase} ${overviewActive ? overviewActiveClass : overviewInactiveClass}`}
            >
              <SquareStack size={17} />
              {!collapsed && "Overview"}
            </Link>
          ) : (
            <div
              className={`${collapsed ? navItemCollapsed : navItemBase} ${disabledClass}`}
              title={collapsed ? "Overview" : undefined}
            >
              <SquareStack size={17} />
              {!collapsed && "Overview"}
            </div>
          )}
        </div>

        <div className="mx-1 my-3 h-px bg-white/[0.07]" />

        {/* ── WORKFLOW (action-based) ──────────────────────── */}
        {!collapsed && (
          <div className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-widest text-stone-600">
            Workflow
          </div>
        )}

        {collapsed ? (
          <nav className="mt-1 space-y-0.5">
            <WorkflowNavIcon enabled={hasAgent} to="/build/development" active={buildActive} title="Build">
              <GitBranch size={17} />
            </WorkflowNavIcon>
            <WorkflowStaticIcon enabled={hasAgent} active={testActive} title="Test">
              <ClipboardCheck size={17} />
            </WorkflowStaticIcon>
            <WorkflowNavIcon enabled={hasAgent} to="/evaluate" active={evaluateActive} title="Evaluate">
              <BarChart3 size={17} />
            </WorkflowNavIcon>
          </nav>
        ) : (
          <div className="space-y-0.5 rounded-md border border-white/[0.06] bg-white/[0.02] p-1">
            <ExpandableNav
              label="Build" icon={<GitBranch size={17} />} enabled={hasAgent}
              active={buildActive} expanded={expanded === "Build"}
              onToggle={() => setExpanded(expanded === "Build" ? null : "Build")}
              defaultTo="/build/development"
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
              defaultTo="/evaluate?tab=test-results"
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
              defaultTo="/evaluate"
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
          </div>
        )}
      </div>

      {/* Bottom: Settings + Help */}
      <div className="shrink-0 border-t border-white/10 p-2">
        <div className="space-y-0.5">
          <Link
            to="/agent"
            title={collapsed ? "Settings" : undefined}
            className={`${collapsed ? navItemCollapsed : navItemBase} ${globalInactiveClass}`}
          >
            <Settings size={17} />
            {!collapsed && "Settings"}
          </Link>
          <button
            title={collapsed ? "Help" : undefined}
            className={`${collapsed ? navItemCollapsed : navItemBase} w-full ${globalInactiveClass}`}
          >
            <CircleHelp size={17} />
            {!collapsed && "Help"}
          </button>
        </div>
      </div>
    </aside>
  );
}

function WorkflowNavIcon({
  enabled, to, active, title, children,
}: {
  enabled: boolean;
  to: string;
  active: boolean;
  title: string;
  children: ReactNode;
}) {
  if (!enabled) {
    return <div className={`${navItemCollapsed} ${disabledClass}`} title={title}>{children}</div>;
  }
  return (
    <Link
      to={to}
      className={`${navItemCollapsed} ${active ? workflowActiveClass : workflowInactiveClass}`}
      title={title}
    >
      {children}
    </Link>
  );
}

function WorkflowStaticIcon({
  enabled, active, title, children,
}: {
  enabled: boolean;
  active: boolean;
  title: string;
  children: ReactNode;
}) {
  return (
    <div
      className={`${navItemCollapsed} ${enabled ? (active ? workflowActiveClass : workflowInactiveClass) : disabledClass}`}
      title={title}
    >
      {children}
    </div>
  );
}

function ExpandableNav({
  label, icon, enabled, active, expanded, onToggle, children,
}: {
  label: string;
  icon: ReactNode;
  enabled: boolean;
  active: boolean;
  expanded: boolean;
  onToggle: () => void;
  children: ReactNode;
  defaultTo?: string;
}) {
  if (!enabled) {
    return (
      <div className={`${sectionButtonBase} ${disabledClass}`}>
        {icon}
        <span className="flex-1 text-left">{label}</span>
        <ChevronRight size={14} className="opacity-50" />
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={onToggle}
        className={`${sectionButtonBase} ${active ? workflowActiveClass : workflowInactiveClass}`}
      >
        {icon}
        <span className="flex-1 text-left">{label}</span>
        {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
      </button>
      {expanded && <div className="mt-0.5 space-y-0.5 pb-1 pl-8">{children}</div>}
    </div>
  );
}

function SubLink({ to, active, children }: { to: string; active: boolean; children: ReactNode }) {
  return (
    <Link
      to={to}
      className={`flex h-8 items-center rounded-md px-3 text-sm transition ${
        active ? "bg-white/10 text-white" : "text-stone-400 hover:bg-white/5 hover:text-stone-200"
      }`}
    >
      {children}
    </Link>
  );
}
