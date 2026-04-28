import { useState } from "react";
import type { AppState } from "../App";
import { ActionButton } from "../components/ui/ActionButton";
import { StatusChip } from "../components/ui/StatusChip";
import {
  AlertTriangle,
  ChevronRight,
  ClipboardCheck,
  Gauge,
  GitBranch,
  LayoutGrid,
  List,
  ShieldCheck,
  Wrench,
} from "lucide-react";
import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import type { Role } from "../types";

type PageProps = { app: AppState };

type Metric = {
  label: string;
  value: string;
  detail: string;
  tone: "risk" | "attention" | "stable" | "total";
};

type HomeAction = {
  id: string;
  icon: ReactNode;
  title: string;
  description: string;
  cta: string;
  emphasized?: boolean;
  workspaceId?: string;
  agentId?: string;
  route?: string;
};

type WorkspaceRow = {
  id: string;
  workspace: string;
  agents: number;
  issues: string;
  status: string;
};

type AgentRow = {
  id: string;
  agent: string;
  workspace: string;
  status: string;
  action: string;
  permission: "enabled" | "approval" | "view";
};

type FocusRow = {
  id: string;
  label: string;
  sublabel: string;
  status: string;
};

type ActivityItem = {
  id: string;
  text: string;
  time: string;
  type: "risk" | "attention" | "info";
};

type RoleContent = {
  metrics: Metric[];
  actions: HomeAction[];
  workspaces: WorkspaceRow[];
  agents: AgentRow[];
};

type RoleMeta = {
  userName: string;
  scopeText: string;
  primaryFocusTitle: string;
  primaryFocusCTA: string;
  defaultTab: "workspaces" | "agents";
  focusRows: FocusRow[];
  recentActivity: ActivityItem[];
};

/* ─── Role content ─────────────────────────────────────────── */

const roleContent: Record<Role, RoleContent> = {
  "Agent Builder / Operator": {
    metrics: [
      { label: "At Risk",       value: "2",  detail: "My agents with failing checks",    tone: "risk" },
      { label: "Need Attention", value: "5",  detail: "Drafts or test regressions",       tone: "attention" },
      { label: "Stable",         value: "19", detail: "Passing latest evaluation",        tone: "stable" },
      { label: "Total Agents",   value: "26", detail: "Across 4 workspaces",              tone: "total" },
    ],
    actions: [
      { id: "op-1", icon: <AlertTriangle size={14} />, title: "Review failed staging test",    description: "Payment Issue Resolver missed two policy edge cases in the latest suite.", cta: "Review Test",   emphasized: true, workspaceId: "naver-pay",      agentId: "refund-review",    route: "/evaluate" },
      { id: "op-2", icon: <Wrench size={14} />,        title: "Continue editing Catalog Monitor", description: "Draft instruction changes are ready for a focused build pass.",             cta: "Open Build",                   workspaceId: "shopping-support", agentId: "catalog-monitor",  route: "/build/development" },
      { id: "op-3", icon: <Gauge size={14} />,         title: "Check performance variance",    description: "Reservation CX latency increased after the last development run.",          cta: "Evaluate",                     workspaceId: "reservation-cx",   agentId: "query-intent",     route: "/evaluate" },
    ],
    workspaces: [
      { id: "w1", workspace: "Naver Pay Operations", agents: 8, issues: "2 test failures",   status: "Need Attention" },
      { id: "w2", workspace: "Shopping Support",     agents: 6, issues: "1 draft blocked",   status: "Stable" },
      { id: "w3", workspace: "Reservation CX",       agents: 5, issues: "1 latency check",   status: "Need Attention" },
      { id: "w4", workspace: "Global Customer Care", agents: 7, issues: "None assigned",      status: "Stable" },
    ],
    agents: [
      { id: "a1", agent: "Payment Issue Resolver",       workspace: "Naver Pay Operations", status: "Review",            action: "Review Test", permission: "enabled" },
      { id: "a2", agent: "Catalog Monitor",              workspace: "Shopping Support",     status: "Draft",             action: "Open Build",  permission: "enabled" },
      { id: "a3", agent: "Reservation Change Triage",    workspace: "Reservation CX",       status: "Watching",          action: "Evaluate",    permission: "enabled" },
      { id: "a4", agent: "Ticket Routing Agent",         workspace: "Global Customer Care", status: "Live",              action: "View",        permission: "view" },
    ],
  },
  "Workspace Admin": {
    metrics: [
      { label: "At Risk",       value: "3",  detail: "Workspace release blockers",        tone: "risk" },
      { label: "Need Attention", value: "7",  detail: "Agents awaiting admin review",      tone: "attention" },
      { label: "Stable",         value: "16", detail: "Ready or operating normally",       tone: "stable" },
      { label: "Total Agents",   value: "26", detail: "Workspace portfolio",               tone: "total" },
    ],
    actions: [
      { id: "wa-1", icon: <ClipboardCheck size={14} />, title: "Review failed staging tests",    description: "Naver Pay Operations has release candidates blocked by evaluation drift.", cta: "Review Failed Tests", emphasized: true, workspaceId: "naver-pay",      agentId: "refund-review",   route: "/evaluate" },
      { id: "wa-2", icon: <GitBranch size={14} />,      title: "Validate deployment readiness",  description: "Shopping Support needs a final staging run before approval request.",      cta: "Run Test",                      workspaceId: "shopping-support", agentId: "catalog-monitor", route: "/build/development" },
      { id: "wa-3", icon: <ShieldCheck size={14} />,    title: "Submit production approval",     description: "Reservation CX has passed checks and is ready for controlled promotion.", cta: "Request Approval",              workspaceId: "reservation-cx",   agentId: "query-intent",    route: "/build/production-safety" },
    ],
    workspaces: [
      { id: "w1", workspace: "Naver Pay Operations", agents: 8, issues: "3 blockers",       status: "At Risk" },
      { id: "w2", workspace: "Shopping Support",     agents: 6, issues: "2 pending runs",   status: "Need Attention" },
      { id: "w3", workspace: "Reservation CX",       agents: 5, issues: "Approval ready",   status: "Stable" },
      { id: "w4", workspace: "Global Customer Care", agents: 7, issues: "1 paused agent",   status: "Need Attention" },
    ],
    agents: [
      { id: "a1", agent: "Payment Issue Resolver",    workspace: "Naver Pay Operations", status: "Review",            action: "Review Failed Tests", permission: "enabled" },
      { id: "a2", agent: "Catalog Monitor",           workspace: "Shopping Support",     status: "Watching",          action: "Run Test",            permission: "enabled" },
      { id: "a3", agent: "Reservation Change Triage", workspace: "Reservation CX",       status: "Approval required", action: "Request Approval",    permission: "approval" },
      { id: "a4", agent: "Ticket Routing Agent",      workspace: "Global Customer Care", status: "Paused",            action: "Review",              permission: "enabled" },
    ],
  },
  "Org Admin": {
    metrics: [
      { label: "At Risk",       value: "4",  detail: "Org-wide production risks",         tone: "risk" },
      { label: "Need Attention", value: "9",  detail: "Workspace policy exceptions",       tone: "attention" },
      { label: "Stable",         value: "13", detail: "Within governance thresholds",      tone: "stable" },
      { label: "Total Agents",   value: "26", detail: "NAVER Corp scope",                  tone: "total" },
    ],
    actions: [
      { id: "oa-1", icon: <ShieldCheck size={14} />,    title: "Inspect production risk queue",        description: "Four agents have restricted actions pending policy review.",            cta: "View Production Risks",  emphasized: true, workspaceId: "naver-pay",    agentId: "refund-review", route: "/build/production-safety" },
      { id: "oa-2", icon: <AlertTriangle size={14} />,  title: "Review workspace issue concentration", description: "Naver Pay Operations and Global Customer Care need admin follow-up.",   cta: "Review Workspace Issues",               workspaceId: "naver-pay",                          route: "/workspace" },
      { id: "oa-3", icon: <ClipboardCheck size={14} />, title: "Open governance coverage",             description: "Confirm production permissions and trace retention policies.",          cta: "View Governance",                       workspaceId: "naver-pay",    agentId: "refund-review", route: "/build/production-safety" },
    ],
    workspaces: [
      { id: "w1", workspace: "Naver Pay Operations", agents: 8, issues: "2 production risks",  status: "At Risk" },
      { id: "w2", workspace: "Shopping Support",     agents: 6, issues: "1 policy exception",  status: "Need Attention" },
      { id: "w3", workspace: "Reservation CX",       agents: 5, issues: "None",                status: "Stable" },
      { id: "w4", workspace: "Global Customer Care", agents: 7, issues: "2 access reviews",    status: "Need Attention" },
    ],
    agents: [
      { id: "a1", agent: "Payment Issue Resolver",    workspace: "Naver Pay Operations", status: "Restricted",        action: "View Production Risks",  permission: "enabled" },
      { id: "a2", agent: "Ticket Routing Agent",      workspace: "Global Customer Care", status: "Paused",            action: "Review Workspace Issues", permission: "enabled" },
      { id: "a3", agent: "Catalog Monitor",           workspace: "Shopping Support",     status: "Approval required", action: "View Governance",         permission: "approval" },
      { id: "a4", agent: "Reservation Change Triage", workspace: "Reservation CX",       status: "Stable",            action: "View",                    permission: "view" },
    ],
  },
};

const roleMeta: Record<Role, RoleMeta> = {
  "Org Admin": {
    userName: "Sora Kim",
    scopeText: "NAVER Corp · 4 workspaces · 26 agents",
    primaryFocusTitle: "Organization Risk Overview",
    primaryFocusCTA: "View Production Risks",
    defaultTab: "workspaces",
    focusRows: [
      { id: "f1", label: "Naver Pay Operations",  sublabel: "2 production risks pending review",   status: "At Risk" },
      { id: "f2", label: "Global Customer Care",  sublabel: "2 access reviews required",           status: "Need Attention" },
      { id: "f3", label: "Shopping Support",      sublabel: "1 policy exception flagged",          status: "Need Attention" },
    ],
    recentActivity: [
      { id: "r1", text: "Production promotion blocked — Naver Pay Operations", time: "14 min ago",  type: "risk" },
      { id: "r2", text: "Production agent restricted — Payment Issue Resolver", time: "1 hr ago",    type: "risk" },
      { id: "r3", text: "Governance policy updated — NAVER Corp",               time: "2 hr ago",    type: "info" },
      { id: "r4", text: "Access review raised — Global Customer Care",           time: "4 hr ago",    type: "attention" },
      { id: "r5", text: "Workspace exception flagged — Shopping Support",        time: "Yesterday",   type: "attention" },
      { id: "r6", text: "Policy audit completed — NAVER Corp",                  time: "2 days ago",  type: "info" },
    ],
  },
  "Workspace Admin": {
    userName: "Minho Park",
    scopeText: "Naver Pay Operations · 8 agents",
    primaryFocusTitle: "Workspace Release Readiness",
    primaryFocusCTA: "Review Failed Tests",
    defaultTab: "agents",
    focusRows: [
      { id: "f1", label: "Payment Issue Resolver",    sublabel: "2 staging test failures blocking release", status: "At Risk" },
      { id: "f2", label: "Catalog Monitor",           sublabel: "Pending staging run before approval",       status: "Need Attention" },
      { id: "f3", label: "Reservation Change Triage", sublabel: "Ready for production approval",             status: "Stable" },
    ],
    recentActivity: [
      { id: "r1", text: "Staging test failed — Payment Issue Resolver",     time: "18 min ago",  type: "risk" },
      { id: "r2", text: "Deployment package created — Catalog Monitor",     time: "41 min ago",  type: "info" },
      { id: "r3", text: "Workspace review completed — Reservation CX",      time: "1 hr ago",    type: "info" },
      { id: "r4", text: "Agent paused by admin — Ticket Routing Agent",     time: "2 hr ago",    type: "attention" },
      { id: "r5", text: "Approval request received — Reservation Change Triage", time: "3 hr ago", type: "attention" },
      { id: "r6", text: "Staging run completed — Catalog Monitor",          time: "Yesterday",   type: "info" },
    ],
  },
  "Agent Builder / Operator": {
    userName: "Jisoo Lee",
    scopeText: "5 assigned agents · 4 workspaces",
    primaryFocusTitle: "Assigned Agents",
    primaryFocusCTA: "Continue Work",
    defaultTab: "agents",
    focusRows: [
      { id: "f1", label: "Payment Issue Resolver",    sublabel: "Failed staging test — 2 policy edge cases",  status: "Review" },
      { id: "f2", label: "Catalog Monitor",           sublabel: "Draft instruction changes pending build",     status: "Draft" },
      { id: "f3", label: "Reservation Change Triage", sublabel: "Approval pending from workspace admin",       status: "Approval required" },
    ],
    recentActivity: [
      { id: "r1", text: "Test case failed — Payment Issue Resolver",          time: "14 min ago",  type: "risk" },
      { id: "r2", text: "Build draft saved — Catalog Monitor",                time: "32 min ago",  type: "info" },
      { id: "r3", text: "Evaluation complete — Reservation Change Triage",    time: "1 hr ago",    type: "info" },
      { id: "r4", text: "Staging test run triggered — Payment Issue Resolver", time: "2 hr ago",   type: "info" },
      { id: "r5", text: "Approval request submitted — Reservation Change Triage", time: "3 hr ago", type: "attention" },
      { id: "r6", text: "Build version deployed to dev — Catalog Monitor",    time: "Yesterday",   type: "info" },
    ],
  },
};

/* ─── Helpers ──────────────────────────────────────────────── */

function metricBorderColor(tone: Metric["tone"]) {
  if (tone === "risk")      return "border-l-danger";
  if (tone === "attention") return "border-l-warning";
  if (tone === "stable")    return "border-l-success";
  return "border-l-accent";
}

function activityDot(type: ActivityItem["type"]) {
  if (type === "risk")      return "bg-danger";
  if (type === "attention") return "bg-warning";
  return "bg-stone-300";
}

/* ─── Component ────────────────────────────────────────────── */

export function HomeDashboard({ app }: PageProps) {
  const navigate = useNavigate();
  const content = roleContent[app.role];
  const meta = roleMeta[app.role];
  const [activeTab, setActiveTab] = useState<"workspaces" | "agents">(meta.defaultTab);
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  function handleAction(action: HomeAction) {
    if (action.workspaceId) app.setWorkspaceId(action.workspaceId);
    if (action.agentId) app.setAgentId(action.agentId);
    if (action.route) navigate(action.route);
  }

  return (
    /* h-[calc(100vh-6rem)]: 100vh - TopBar(3.5rem) - py-5 top+bottom(2.5rem)        */
    /* overflow-hidden: prevents any sub-pixel rounding from causing a page scrollbar */
    <div className="flex h-[calc(100vh-6rem)] flex-col gap-5 overflow-hidden">
      {/* Page header */}
      <div className="shrink-0">
        <h1 className="text-2xl font-bold leading-8 text-ink">Welcome back, {meta.userName}</h1>
        <p className="mt-1 text-sm text-muted">{meta.scopeText}</p>
      </div>

      {/* Two-column layout — flex-1 min-h-0 fills remaining height */}
      <div className="grid min-h-0 flex-1 grid-cols-[1fr_0.44fr] gap-6">

        {/* ── Left column ──────────────────────────────────── */}
        <div className="flex min-h-0 flex-col gap-4">

          {/* A. Summary metrics */}
          <div className="grid shrink-0 grid-cols-4 gap-3">
            {content.metrics.map((m) => (
              <div
                key={m.label}
                className={`rounded-lg border border-line border-l-4 bg-white px-4 py-3 ${metricBorderColor(m.tone)}`}
              >
                <div className="text-[11px] font-semibold uppercase tracking-wide text-muted">
                  {m.label}
                </div>
                <div className="mt-1 text-3xl font-bold text-ink">{m.value}</div>
                <div className="mt-0.5 text-[13px] text-muted">{m.detail}</div>
              </div>
            ))}
          </div>

          {/* B. Primary Focus Card */}
          <div className="shrink-0 rounded-lg border border-line bg-white p-5">
            <div className="mb-3.5 flex items-center justify-between">
              <h2 className="text-[13px] font-bold uppercase tracking-wide text-ink">{meta.primaryFocusTitle}</h2>
              <button
                onClick={() => handleAction(content.actions[0])}
                className="flex h-6 w-6 items-center justify-center rounded text-muted transition hover:bg-stone-100 hover:text-ink"
                title={meta.primaryFocusCTA}
              >
                <ChevronRight size={15} />
              </button>
            </div>
            <div className="space-y-2">
              {meta.focusRows.map((row) => (
                <div
                  key={row.id}
                  className="flex items-center gap-3 rounded border border-line px-3 py-2.5"
                >
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold text-ink">{row.label}</div>
                    <div className="text-[13px] text-muted">{row.sublabel}</div>
                  </div>
                  <StatusChip status={row.status} />
                </div>
              ))}
            </div>
          </div>

          {/* C. Entry table — flex-1 so it fills remaining left-column height */}
          <div className="flex min-h-0 flex-1 flex-col rounded-lg border border-line bg-white">
            {/* Tabs + view toggle */}
            <div className="flex shrink-0 items-center border-b border-line px-4">
              <div className="flex flex-1">
                {(["workspaces", "agents"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`-mb-px border-b-2 px-3 py-3 text-[13px] font-medium transition ${
                      activeTab === tab
                        ? "border-accent text-ink"
                        : "border-transparent text-muted hover:text-ink"
                    }`}
                  >
                    {tab === "workspaces" ? "Workspaces" : "Agents"}
                  </button>
                ))}
              </div>
              {/* Relevance label */}
              <span className="mr-2 text-[11px] text-stone-400">
                Relevant & recent · {activeTab === "workspaces" ? content.workspaces.length : content.agents.length} of {activeTab === "workspaces" ? "12" : "26"}
              </span>
              {/* View mode toggle */}
              <div className="flex items-center gap-0.5 rounded-md border border-line bg-stone-50 p-0.5">
                <button
                  onClick={() => setViewMode("table")}
                  title="Table view"
                  className={`flex items-center justify-center rounded p-1.5 transition ${
                    viewMode === "table" ? "bg-white text-ink shadow-sm" : "text-muted hover:text-ink"
                  }`}
                >
                  <List size={13} />
                </button>
                <button
                  onClick={() => setViewMode("grid")}
                  title="Grid view"
                  className={`flex items-center justify-center rounded p-1.5 transition ${
                    viewMode === "grid" ? "bg-white text-ink shadow-sm" : "text-muted hover:text-ink"
                  }`}
                >
                  <LayoutGrid size={13} />
                </button>
              </div>
            </div>

            {/* Table / Grid view — flex-1 scrollable */}
            {viewMode === "table" && (
              <div className="compact-scrollbar flex-1 overflow-y-auto px-4 py-2">
                {activeTab === "workspaces" ? (
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-[11px] uppercase tracking-wide text-muted">
                        <th className="pb-2 pt-2.5 font-medium">Workspace</th>
                        <th className="pb-2 pt-2.5 font-medium w-20 pr-6">Agents</th>
                        <th className="pb-2 pt-2.5 font-medium">Issues</th>
                        <th className="pb-2 pt-2.5 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line">
                      {content.workspaces.map((ws) => (
                        <tr
                          key={ws.id}
                          className="cursor-pointer hover:bg-stone-50 transition"
                          onClick={() => navigate("/workspace")}
                        >
                          <td className="py-2.5 text-sm font-semibold text-ink">{ws.workspace}</td>
                          <td className="py-2.5 pr-6 text-[13px] text-muted">{ws.agents}</td>
                          <td className="py-2.5 text-[13px] text-muted">{ws.issues}</td>
                          <td className="py-2.5"><StatusChip status={ws.status} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-[11px] uppercase tracking-wide text-muted">
                        <th className="pb-2 pt-2.5 font-medium">Agent</th>
                        <th className="pb-2 pt-2.5 font-medium">Workspace</th>
                        <th className="pb-2 pt-2.5 font-medium">Status</th>
                        <th className="pb-2 pt-2.5 font-medium text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line">
                      {content.agents.map((ag) => (
                        <tr key={ag.id} className="hover:bg-stone-50 transition">
                          <td className="py-2.5 text-sm font-semibold text-ink">{ag.agent}</td>
                          <td className="py-2.5 text-[13px] text-muted">{ag.workspace}</td>
                          <td className="py-2.5"><StatusChip status={ag.status} /></td>
                          <td className="py-2.5 text-right">
                            <ActionButton
                              variant={ag.permission === "enabled" ? "secondary" : "quiet"}
                              className="h-7 px-2 text-[13px] font-medium"
                              disabled={ag.permission === "approval"}
                            >
                              {ag.permission === "approval" ? "Approval needed" : ag.action}
                            </ActionButton>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {/* Grid view */}
            {viewMode === "grid" && (
              <div className="p-4">
                {activeTab === "workspaces" ? (
                  <div className="grid grid-cols-2 gap-2.5">
                    {content.workspaces.map((ws) => (
                      <button
                        key={ws.id}
                        className="rounded-lg border border-line p-3 text-left transition hover:bg-stone-50 hover:border-stone-300"
                        onClick={() => navigate("/workspace")}
                      >
                        <div className="mb-2 flex items-start justify-between gap-2">
                          <span className="text-sm font-semibold leading-snug text-ink">{ws.workspace}</span>
                          <StatusChip status={ws.status} />
                        </div>
                        <div className="text-[13px] text-muted">{ws.agents} agents</div>
                        <div className="text-[13px] text-muted">{ws.issues}</div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2.5">
                    {content.agents.map((ag) => (
                      <div key={ag.id} className="rounded-lg border border-line p-3 transition hover:bg-stone-50 hover:border-stone-300">
                        <div className="mb-1 text-sm font-semibold leading-snug text-ink">{ag.agent}</div>
                        <div className="mb-2.5 text-[13px] text-muted">{ag.workspace}</div>
                        <div className="flex items-center justify-between gap-2">
                          <StatusChip status={ag.status} />
                          <ActionButton
                            variant={ag.permission === "enabled" ? "secondary" : "quiet"}
                            className="h-6 px-2 text-[12px]"
                            disabled={ag.permission === "approval"}
                          >
                            {ag.permission === "approval" ? "Approval needed" : ag.action}
                          </ActionButton>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── Right column ─────────────────────────────────────────────────────── */}
        {/* h-full: percentage-height grid items don't contribute to row sizing,   */}
        {/* so row height = left column. overflow-hidden prevents content blowout. */}
        <div className="flex h-full flex-col overflow-hidden rounded-lg border border-line bg-white p-4">

          {/* Next Actions */}
          <div className="shrink-0">
            <div className="mb-3.5 flex items-center justify-between">
              <h2 className="text-[13px] font-bold uppercase tracking-wide text-ink">
                Next Actions
              </h2>
              <span className="text-[11px] text-muted">Prioritized</span>
            </div>
            <div className="space-y-2">
              {content.actions.map((action) => (
                <div
                  key={action.id}
                  className={`rounded-md p-3 ${
                    action.emphasized
                      ? "border border-line bg-stone-50"
                      : "border border-transparent"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <div
                      className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded ${
                        action.emphasized
                          ? "bg-ink text-white"
                          : "bg-stone-100 text-stone-500"
                      }`}
                    >
                      {action.icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-semibold leading-snug text-ink">
                        {action.title}
                      </div>
                      <div className="mt-0.5 text-[13px] leading-snug text-muted">
                        {action.description}
                      </div>
                    </div>
                  </div>
                  <div className="mt-2.5 flex justify-end">
                    <ActionButton
                      variant={action.emphasized ? "primary" : "secondary"}
                      className="h-7 px-2.5 text-[13px] font-semibold"
                      onClick={() => handleAction(action)}
                    >
                      {action.cta}
                    </ActionButton>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="my-4 shrink-0 border-t border-line" />

          {/* Recent Activity — fills remaining height, list scrolls on overflow */}
          <div className="flex min-h-0 flex-1 flex-col">
            <h2 className="mb-3.5 shrink-0 text-[13px] font-bold uppercase tracking-wide text-ink">
              Recent Activity
            </h2>
            <div className="compact-scrollbar min-h-0 flex-1 overflow-y-auto">
              <div className="flex flex-col gap-3">
              {meta.recentActivity.map((item) => (
                <div key={item.id} className="flex shrink-0 items-start gap-2.5">
                  <span
                    className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${activityDot(item.type)}`}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="text-[13px] leading-snug text-ink">{item.text}</div>
                    <div className="mt-0.5 text-[11px] text-muted">{item.time}</div>
                  </div>
                </div>
              ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
