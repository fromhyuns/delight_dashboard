import type { AppState } from "../App";
import { workspaces } from "../data/mockData";
import { ActionButton } from "../components/ui/ActionButton";
import { Card } from "../components/ui/Card";
import { DataTable } from "../components/ui/DataTable";
import { StatusChip } from "../components/ui/StatusChip";
import { AlertTriangle, ClipboardCheck, Gauge, GitBranch, ShieldCheck, Wrench } from "lucide-react";
import type { ReactNode } from "react";
import type { Role } from "../types";

type PageProps = {
  app: AppState;
};

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
};

type WorkspaceRow = {
  id: string;
  workspace: string;
  agents: number;
  issues: string;
  status: string;
  trend: string;
};

type AgentRow = {
  id: string;
  agent: string;
  workspace: string;
  environments: string;
  lastUpdated: string;
  status: string;
  action: string;
  permission: "enabled" | "approval" | "view";
};

type RoleContent = {
  metrics: Metric[];
  actions: HomeAction[];
  workspaces: WorkspaceRow[];
  agents: AgentRow[];
};

const roleContent: Record<Role, RoleContent> = {
  "Agent Builder / Operator": {
    metrics: [
      { label: "At Risk", value: "2", detail: "My agents with failing checks", tone: "risk" },
      { label: "Need Attention", value: "5", detail: "Drafts or test regressions", tone: "attention" },
      { label: "Stable", value: "19", detail: "Passing latest evaluation", tone: "stable" },
      { label: "Total Agents", value: "26", detail: "Across 4 workspaces", tone: "total" },
    ],
    actions: [
      {
        id: "op-1",
        icon: <AlertTriangle size={16} />,
        title: "Review failed staging test",
        description: "Payment Issue Resolver missed two policy edge cases in the latest suite.",
        cta: "Review Test",
        emphasized: true,
      },
      {
        id: "op-2",
        icon: <Wrench size={16} />,
        title: "Continue editing Catalog Monitor",
        description: "Draft instruction changes are ready for a focused build pass.",
        cta: "Open Build",
      },
      {
        id: "op-3",
        icon: <Gauge size={16} />,
        title: "Check performance variance",
        description: "Reservation CX latency increased after the last development run.",
        cta: "Evaluate",
      },
    ],
    workspaces: [
      { id: "w1", workspace: "Naver Pay Operations", agents: 8, issues: "2 test failures", status: "Need Attention", trend: "Improving" },
      { id: "w2", workspace: "Shopping Support", agents: 6, issues: "1 draft blocked", status: "Stable", trend: "Flat" },
      { id: "w3", workspace: "Reservation CX", agents: 5, issues: "1 latency check", status: "Need Attention", trend: "Watching" },
      { id: "w4", workspace: "Global Customer Care", agents: 7, issues: "None assigned", status: "Stable", trend: "Stable" },
    ],
    agents: [
      { id: "a1", agent: "Payment Issue Resolver", workspace: "Naver Pay Operations", environments: "Dev, Staging", lastUpdated: "14 min ago", status: "Review", action: "Review Test", permission: "enabled" },
      { id: "a2", agent: "Catalog Monitor", workspace: "Shopping Support", environments: "Development", lastUpdated: "32 min ago", status: "Draft", action: "Open Build", permission: "enabled" },
      { id: "a3", agent: "Reservation Change Triage", workspace: "Reservation CX", environments: "Staging", lastUpdated: "1 hr ago", status: "Watching", action: "Evaluate", permission: "enabled" },
      { id: "a4", agent: "Ticket Routing Agent", workspace: "Global Customer Care", environments: "Production", lastUpdated: "Yesterday", status: "Live", action: "View", permission: "view" },
    ],
  },
  "Workspace Admin": {
    metrics: [
      { label: "At Risk", value: "3", detail: "Workspace release blockers", tone: "risk" },
      { label: "Need Attention", value: "7", detail: "Agents awaiting admin review", tone: "attention" },
      { label: "Stable", value: "16", detail: "Ready or operating normally", tone: "stable" },
      { label: "Total Agents", value: "26", detail: "Workspace portfolio", tone: "total" },
    ],
    actions: [
      {
        id: "wa-1",
        icon: <ClipboardCheck size={16} />,
        title: "Review failed staging tests",
        description: "Naver Pay Operations has release candidates blocked by evaluation drift.",
        cta: "Review Failed Tests",
        emphasized: true,
      },
      {
        id: "wa-2",
        icon: <GitBranch size={16} />,
        title: "Validate deployment readiness",
        description: "Shopping Support needs a final staging run before approval request.",
        cta: "Run Test",
      },
      {
        id: "wa-3",
        icon: <ShieldCheck size={16} />,
        title: "Submit production approval",
        description: "Reservation CX has passed checks and is ready for controlled promotion.",
        cta: "Request Approval",
      },
    ],
    workspaces: [
      { id: "w1", workspace: "Naver Pay Operations", agents: 8, issues: "3 blockers", status: "At Risk", trend: "Watching" },
      { id: "w2", workspace: "Shopping Support", agents: 6, issues: "2 pending runs", status: "Need Attention", trend: "Flat" },
      { id: "w3", workspace: "Reservation CX", agents: 5, issues: "Approval ready", status: "Stable", trend: "Improving" },
      { id: "w4", workspace: "Global Customer Care", agents: 7, issues: "1 paused agent", status: "Need Attention", trend: "Stable" },
    ],
    agents: [
      { id: "a1", agent: "Payment Issue Resolver", workspace: "Naver Pay Operations", environments: "Staging, Prod", lastUpdated: "18 min ago", status: "Review", action: "Review Failed Tests", permission: "enabled" },
      { id: "a2", agent: "Catalog Monitor", workspace: "Shopping Support", environments: "Staging", lastUpdated: "41 min ago", status: "Watching", action: "Run Test", permission: "enabled" },
      { id: "a3", agent: "Reservation Change Triage", workspace: "Reservation CX", environments: "Dev, Staging", lastUpdated: "1 hr ago", status: "Approval required", action: "Request Approval", permission: "approval" },
      { id: "a4", agent: "Ticket Routing Agent", workspace: "Global Customer Care", environments: "Production", lastUpdated: "Yesterday", status: "Paused", action: "Review", permission: "enabled" },
    ],
  },
  "Org Admin": {
    metrics: [
      { label: "At Risk", value: "4", detail: "Org-wide production risks", tone: "risk" },
      { label: "Need Attention", value: "9", detail: "Workspace policy exceptions", tone: "attention" },
      { label: "Stable", value: "13", detail: "Within governance thresholds", tone: "stable" },
      { label: "Total Agents", value: "26", detail: "NAVER Corp scope", tone: "total" },
    ],
    actions: [
      {
        id: "oa-1",
        icon: <ShieldCheck size={16} />,
        title: "Inspect production risk queue",
        description: "Four agents have restricted actions pending policy review.",
        cta: "View Production Risks",
        emphasized: true,
      },
      {
        id: "oa-2",
        icon: <AlertTriangle size={16} />,
        title: "Review workspace issue concentration",
        description: "Naver Pay Operations and Global Customer Care need admin follow-up.",
        cta: "Review Workspace Issues",
      },
      {
        id: "oa-3",
        icon: <ClipboardCheck size={16} />,
        title: "Open governance coverage",
        description: "Confirm production permissions and trace retention policies.",
        cta: "View Governance",
      },
    ],
    workspaces: [
      { id: "w1", workspace: "Naver Pay Operations", agents: 8, issues: "2 production risks", status: "At Risk", trend: "Watching" },
      { id: "w2", workspace: "Shopping Support", agents: 6, issues: "1 policy exception", status: "Need Attention", trend: "Flat" },
      { id: "w3", workspace: "Reservation CX", agents: 5, issues: "None", status: "Stable", trend: "Improving" },
      { id: "w4", workspace: "Global Customer Care", agents: 7, issues: "2 access reviews", status: "Need Attention", trend: "Watching" },
    ],
    agents: [
      { id: "a1", agent: "Payment Issue Resolver", workspace: "Naver Pay Operations", environments: "Production", lastUpdated: "22 min ago", status: "Restricted", action: "View Production Risks", permission: "enabled" },
      { id: "a2", agent: "Ticket Routing Agent", workspace: "Global Customer Care", environments: "Production", lastUpdated: "Yesterday", status: "Paused", action: "Review Workspace Issues", permission: "enabled" },
      { id: "a3", agent: "Catalog Monitor", workspace: "Shopping Support", environments: "Staging", lastUpdated: "43 min ago", status: "Approval required", action: "View Governance", permission: "approval" },
      { id: "a4", agent: "Reservation Change Triage", workspace: "Reservation CX", environments: "Development", lastUpdated: "2 hrs ago", status: "Stable", action: "View", permission: "view" },
    ],
  },
};

function metricToneClasses(tone: Metric["tone"]) {
  if (tone === "risk") return "border-l-danger";
  if (tone === "attention") return "border-l-warning";
  if (tone === "stable") return "border-l-success";
  return "border-l-accent";
}

const envDotColor: Record<string, string> = {
  Development: "bg-sky-400",
  Staging: "bg-amber-400",
  Production: "bg-emerald-500",
};

export function HomeDashboard({ app }: PageProps) {
  const content = roleContent[app.role];
  const envDot = envDotColor[app.environment] ?? "bg-stone-400";

  return (
    <div className="space-y-3">
      {/* Page header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Welcome back, Sora</h1>
          <p className="mt-0.5 text-sm text-muted">
            NAVER Corp · {workspaces.length} workspaces · 26 agents
          </p>
        </div>
        {/* Environment indicator — contextual, not a primary control */}
        <div className="flex items-center gap-1.5 rounded border border-line bg-stone-50 px-2.5 py-1.5">
          <span className={`h-2 w-2 rounded-full ${envDot}`} />
          <span className="text-xs font-medium text-muted">{app.environment}</span>
        </div>
      </div>

      {/* ── Primary: Next Actions ─────────────────────────────── */}
      <div className="rounded-lg border border-line bg-stone-50 p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-ink">Next Actions</h2>
          <span className="text-xs text-muted">Prioritized for {app.role}</span>
        </div>
        <div className="divide-y divide-line">
          {content.actions.map((action) => (
            <div key={action.id} className="flex items-center gap-3 py-3">
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md border ${
                  action.emphasized
                    ? "border-stone-300 bg-ink text-white"
                    : "border-line bg-white text-muted"
                }`}
              >
                {action.icon}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold text-ink">{action.title}</div>
                <div className="truncate text-xs text-muted">{action.description}</div>
              </div>
              <ActionButton
                variant={action.emphasized ? "primary" : "secondary"}
                className="h-8 shrink-0 px-3 text-xs"
              >
                {action.cta}
              </ActionButton>
            </div>
          ))}
        </div>
      </div>

      {/* ── Secondary: Status summary ─────────────────────────── */}
      <div className="grid grid-cols-4 gap-2">
        {content.metrics.map((metric) => (
          <div
            key={metric.label}
            className={`flex items-center gap-3 rounded border border-line border-l-2 bg-white px-3 py-2.5 ${metricToneClasses(metric.tone)}`}
          >
            <div className="text-xl font-semibold text-ink">{metric.value}</div>
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-wide text-muted">{metric.label}</div>
              <div className="text-[11px] text-muted">{metric.detail}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Tertiary: Portfolio ───────────────────────────────── */}
      <div>
        <div className="mb-2 px-0.5 text-[11px] font-semibold uppercase tracking-wider text-muted">
          Portfolio
        </div>
        <div className="grid grid-cols-[0.95fr_1.35fr] gap-3">
          <Card className="p-3">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-ink">Workspace Overview</h2>
              <span className="text-xs text-muted">4 workspaces</span>
            </div>
            <DataTable<WorkspaceRow>
              rows={content.workspaces}
              getRowKey={(row) => row.id}
              columns={[
                { key: "workspace", header: "Workspace", render: (row) => <div className="font-medium">{row.workspace}</div> },
                { key: "agents", header: "Agents", render: (row) => row.agents, className: "w-16" },
                { key: "issues", header: "Issues", render: (row) => <span className="text-muted">{row.issues}</span> },
                { key: "status", header: "Status", render: (row) => <StatusChip status={row.status} /> },
                { key: "trend", header: "Trend", render: (row) => row.trend },
              ]}
            />
          </Card>

          <Card className="p-3">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-ink">Relevant Agents</h2>
              <span className="text-xs text-muted">Role-filtered</span>
            </div>
            <DataTable<AgentRow>
              rows={content.agents}
              getRowKey={(row) => row.id}
              columns={[
                { key: "agent", header: "Agent", render: (row) => <div className="font-medium">{row.agent}</div> },
                { key: "workspace", header: "Workspace", render: (row) => <span className="text-muted">{row.workspace}</span> },
                { key: "environments", header: "Environments", render: (row) => row.environments },
                { key: "last", header: "Last Updated", render: (row) => row.lastUpdated },
                { key: "status", header: "Status", render: (row) => <StatusChip status={row.status} /> },
                {
                  key: "action",
                  header: "Action",
                  render: (row) => (
                    <ActionButton
                      variant={row.permission === "enabled" ? "secondary" : "quiet"}
                      className="h-7 px-2 text-xs"
                      disabled={row.permission === "approval"}
                    >
                      {row.permission === "approval" ? "Approval needed" : row.action}
                    </ActionButton>
                  ),
                },
              ]}
            />
          </Card>
        </div>
      </div>
    </div>
  );
}
