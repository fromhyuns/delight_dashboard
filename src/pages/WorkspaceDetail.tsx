import { Bot, LayoutGrid, List, MoreHorizontal, Plus, Search, Settings, ShieldCheck } from "lucide-react";
import { useMemo, useState } from "react";
import type { AppState } from "../App";
import { ActionButton } from "../components/ui/ActionButton";
import { Card } from "../components/ui/Card";
import { DataTable } from "../components/ui/DataTable";
import { StatusChip } from "../components/ui/StatusChip";

type PageProps = { app: AppState };

type WorkspaceAgentStatus = "At Risk" | "Attention" | "Stable" | "In Progress" | "Draft";
type FilterStatus = "All" | WorkspaceAgentStatus;
type FilterEnvironment = "All" | "Dev" | "Staging" | "Prod";
type SortMode = "Risk first" | "Recently updated" | "Agent A-Z";

type WorkspaceAgent = {
  id: string;
  name: string;
  status: WorkspaceAgentStatus;
  environments: Array<{
    name: "Dev" | "Staging" | "Prod";
    state: string;
    tone: "neutral" | "success" | "warning" | "danger";
  }>;
  lastUpdated: string;
  updatedRank: number;
  owner: string;
  assigned: boolean;
};

const sortOptions: SortMode[] = ["Risk first", "Recently updated", "Agent A-Z"];

const allWorkspaceAgents: Record<string, WorkspaceAgent[]> = {
  "naver-pay": [
    {
      id: "payment-issue-resolver",
      name: "Payment Issue Resolver",
      status: "At Risk",
      environments: [
        { name: "Dev",     state: "Updated", tone: "warning" },
        { name: "Staging", state: "Failed",  tone: "danger"  },
        { name: "Prod",    state: "Risk",    tone: "danger"  },
      ],
      lastUpdated: "12 min ago", updatedRank: 1, owner: "Sora Kim",    assigned: true,
    },
    {
      id: "refund-assistant",
      name: "Refund Assistant",
      status: "Stable",
      environments: [
        { name: "Dev",     state: "Stable", tone: "success" },
        { name: "Staging", state: "Passed", tone: "success" },
        { name: "Prod",    state: "Live",   tone: "success" },
      ],
      lastUpdated: "28 min ago", updatedRank: 2, owner: "Daniel Choi", assigned: true,
    },
    {
      id: "transaction-failure-bot",
      name: "Transaction Failure Bot",
      status: "Attention",
      environments: [
        { name: "Dev",     state: "Updated",      tone: "warning" },
        { name: "Staging", state: "Test required", tone: "warning" },
        { name: "Prod",    state: "Live",          tone: "success" },
      ],
      lastUpdated: "41 min ago", updatedRank: 3, owner: "Mina Park",   assigned: true,
    },
    {
      id: "card-verification-bot",
      name: "Card Verification Bot",
      status: "In Progress",
      environments: [
        { name: "Dev",     state: "Draft",        tone: "neutral" },
        { name: "Staging", state: "Not run",      tone: "neutral" },
        { name: "Prod",    state: "Not deployed", tone: "neutral" },
      ],
      lastUpdated: "1 hr ago",   updatedRank: 4, owner: "Sora Kim",    assigned: true,
    },
    {
      id: "fraud-detection-bot",
      name: "Fraud Detection Bot",
      status: "Stable",
      environments: [
        { name: "Dev",     state: "Stable", tone: "success" },
        { name: "Staging", state: "Passed", tone: "success" },
        { name: "Prod",    state: "Live",   tone: "success" },
      ],
      lastUpdated: "2 hrs ago",  updatedRank: 5, owner: "Jae Lee",     assigned: false,
    },
    {
      id: "shipping-info-bot",
      name: "Shipping Info Bot",
      status: "Stable",
      environments: [
        { name: "Dev",     state: "Stable", tone: "success" },
        { name: "Staging", state: "Passed", tone: "success" },
        { name: "Prod",    state: "Live",   tone: "success" },
      ],
      lastUpdated: "Yesterday",  updatedRank: 6, owner: "Hana Jung",   assigned: false,
    },
    {
      id: "cancel-refund-bot",
      name: "Cancel & Refund Bot",
      status: "Draft",
      environments: [
        { name: "Dev",     state: "Draft",        tone: "neutral" },
        { name: "Staging", state: "Not run",      tone: "neutral" },
        { name: "Prod",    state: "Not deployed", tone: "neutral" },
      ],
      lastUpdated: "Yesterday",  updatedRank: 7, owner: "Sora Kim",    assigned: true,
    },
    {
      id: "faq-assistant",
      name: "FAQ Assistant",
      status: "Stable",
      environments: [
        { name: "Dev",     state: "Stable", tone: "success" },
        { name: "Staging", state: "Passed", tone: "success" },
        { name: "Prod",    state: "Live",   tone: "success" },
      ],
      lastUpdated: "Apr 25",     updatedRank: 8, owner: "Daniel Choi", assigned: false,
    },
  ],

  "shopping-support": [
    {
      id: "catalog-monitor",
      name: "Catalog Monitor",
      status: "At Risk",
      environments: [
        { name: "Dev",     state: "Updated", tone: "warning" },
        { name: "Staging", state: "Failed",  tone: "danger"  },
        { name: "Prod",    state: "Risk",    tone: "danger"  },
      ],
      lastUpdated: "31 min ago", updatedRank: 1, owner: "Jisu Han",    assigned: true,
    },
    {
      id: "return-policy-guide",
      name: "Return Policy Guide",
      status: "Attention",
      environments: [
        { name: "Dev",     state: "Updated",      tone: "warning" },
        { name: "Staging", state: "Test required", tone: "warning" },
        { name: "Prod",    state: "Live",          tone: "success" },
      ],
      lastUpdated: "1 hr ago",   updatedRank: 2, owner: "Jisu Han",    assigned: true,
    },
    {
      id: "product-qa-bot",
      name: "Product Q&A Bot",
      status: "Stable",
      environments: [
        { name: "Dev",     state: "Stable", tone: "success" },
        { name: "Staging", state: "Passed", tone: "success" },
        { name: "Prod",    state: "Live",   tone: "success" },
      ],
      lastUpdated: "2 hrs ago",  updatedRank: 3, owner: "Minwoo Oh",   assigned: true,
    },
    {
      id: "price-alert-agent",
      name: "Price Alert Agent",
      status: "Stable",
      environments: [
        { name: "Dev",     state: "Stable", tone: "success" },
        { name: "Staging", state: "Passed", tone: "success" },
        { name: "Prod",    state: "Live",   tone: "success" },
      ],
      lastUpdated: "3 hrs ago",  updatedRank: 4, owner: "Minwoo Oh",   assigned: false,
    },
    {
      id: "order-status-checker",
      name: "Order Status Checker",
      status: "Stable",
      environments: [
        { name: "Dev",     state: "Stable", tone: "success" },
        { name: "Staging", state: "Passed", tone: "success" },
        { name: "Prod",    state: "Live",   tone: "success" },
      ],
      lastUpdated: "Yesterday",  updatedRank: 5, owner: "Yuna Choi",   assigned: false,
    },
    {
      id: "shipping-assistant",
      name: "Shipping Info Assistant",
      status: "Draft",
      environments: [
        { name: "Dev",     state: "Draft",        tone: "neutral" },
        { name: "Staging", state: "Not run",      tone: "neutral" },
        { name: "Prod",    state: "Not deployed", tone: "neutral" },
      ],
      lastUpdated: "Apr 28",     updatedRank: 6, owner: "Jisu Han",    assigned: true,
    },
  ],

  "reservation-cx": [
    {
      id: "cancellation-handler",
      name: "Cancellation Handler",
      status: "Attention",
      environments: [
        { name: "Dev",     state: "Updated",      tone: "warning" },
        { name: "Staging", state: "Test required", tone: "warning" },
        { name: "Prod",    state: "Live",          tone: "success" },
      ],
      lastUpdated: "22 min ago", updatedRank: 1, owner: "Taehyun Lim", assigned: true,
    },
    {
      id: "reservation-change-triage",
      name: "Reservation Change Triage",
      status: "In Progress",
      environments: [
        { name: "Dev",     state: "Draft",        tone: "neutral" },
        { name: "Staging", state: "Not run",      tone: "neutral" },
        { name: "Prod",    state: "Not deployed", tone: "neutral" },
      ],
      lastUpdated: "1 hr ago",   updatedRank: 2, owner: "Taehyun Lim", assigned: true,
    },
    {
      id: "booking-confirmation-bot",
      name: "Booking Confirmation Bot",
      status: "Stable",
      environments: [
        { name: "Dev",     state: "Stable", tone: "success" },
        { name: "Staging", state: "Passed", tone: "success" },
        { name: "Prod",    state: "Live",   tone: "success" },
      ],
      lastUpdated: "3 hrs ago",  updatedRank: 3, owner: "Soojin Bae",  assigned: true,
    },
    {
      id: "availability-checker",
      name: "Availability Checker",
      status: "Stable",
      environments: [
        { name: "Dev",     state: "Stable", tone: "success" },
        { name: "Staging", state: "Passed", tone: "success" },
        { name: "Prod",    state: "Live",   tone: "success" },
      ],
      lastUpdated: "Yesterday",  updatedRank: 4, owner: "Soojin Bae",  assigned: false,
    },
    {
      id: "refund-request-guide",
      name: "Refund Request Guide",
      status: "Stable",
      environments: [
        { name: "Dev",     state: "Stable", tone: "success" },
        { name: "Staging", state: "Passed", tone: "success" },
        { name: "Prod",    state: "Live",   tone: "success" },
      ],
      lastUpdated: "Apr 27",     updatedRank: 5, owner: "Taehyun Lim", assigned: false,
    },
  ],

  "global-care": [
    {
      id: "ticket-routing-agent",
      name: "Ticket Routing Agent",
      status: "At Risk",
      environments: [
        { name: "Dev",     state: "Updated", tone: "warning" },
        { name: "Staging", state: "Passed",  tone: "success" },
        { name: "Prod",    state: "Paused",  tone: "danger"  },
      ],
      lastUpdated: "18 min ago", updatedRank: 1, owner: "Chris Moon",  assigned: true,
    },
    {
      id: "escalation-manager",
      name: "Escalation Manager",
      status: "Attention",
      environments: [
        { name: "Dev",     state: "Updated",      tone: "warning" },
        { name: "Staging", state: "Test required", tone: "warning" },
        { name: "Prod",    state: "Live",          tone: "success" },
      ],
      lastUpdated: "45 min ago", updatedRank: 2, owner: "Chris Moon",  assigned: true,
    },
    {
      id: "issue-classifier",
      name: "Issue Classifier",
      status: "Stable",
      environments: [
        { name: "Dev",     state: "Stable", tone: "success" },
        { name: "Staging", state: "Passed", tone: "success" },
        { name: "Prod",    state: "Live",   tone: "success" },
      ],
      lastUpdated: "2 hrs ago",  updatedRank: 3, owner: "Amy Shin",    assigned: true,
    },
    {
      id: "faq-bot-global",
      name: "FAQ Bot",
      status: "Stable",
      environments: [
        { name: "Dev",     state: "Stable", tone: "success" },
        { name: "Staging", state: "Passed", tone: "success" },
        { name: "Prod",    state: "Live",   tone: "success" },
      ],
      lastUpdated: "3 hrs ago",  updatedRank: 4, owner: "Amy Shin",    assigned: false,
    },
    {
      id: "live-chat-assistant",
      name: "Live Chat Assistant",
      status: "Stable",
      environments: [
        { name: "Dev",     state: "Stable", tone: "success" },
        { name: "Staging", state: "Passed", tone: "success" },
        { name: "Prod",    state: "Live",   tone: "success" },
      ],
      lastUpdated: "Yesterday",  updatedRank: 5, owner: "Jin Park",    assigned: false,
    },
    {
      id: "knowledge-base-agent",
      name: "Knowledge Base Agent",
      status: "Stable",
      environments: [
        { name: "Dev",     state: "Stable", tone: "success" },
        { name: "Staging", state: "Passed", tone: "success" },
        { name: "Prod",    state: "Live",   tone: "success" },
      ],
      lastUpdated: "Yesterday",  updatedRank: 6, owner: "Jin Park",    assigned: false,
    },
    {
      id: "feedback-analyzer",
      name: "Feedback Analyzer",
      status: "Draft",
      environments: [
        { name: "Dev",     state: "Draft",        tone: "neutral" },
        { name: "Staging", state: "Not run",      tone: "neutral" },
        { name: "Prod",    state: "Not deployed", tone: "neutral" },
      ],
      lastUpdated: "Apr 26",     updatedRank: 7, owner: "Chris Moon",  assigned: true,
    },
  ],
};

const riskOrder: Record<WorkspaceAgentStatus, number> = {
  "At Risk":     0,
  Attention:     1,
  "In Progress": 2,
  Draft:         3,
  Stable:        4,
};

const tonePriority = { danger: 0, warning: 1, neutral: 2, success: 3 } as const;

function sortedEnvs(agent: WorkspaceAgent) {
  return [...agent.environments].sort((a, b) => tonePriority[a.tone] - tonePriority[b.tone]);
}

function criticalIssueText(agent: WorkspaceAgent): string {
  const critical = sortedEnvs(agent).filter((e) => e.tone !== "success");
  if (critical.length === 0) return "";
  return critical.map((e) => `${e.name} ${e.state}`).join(" · ");
}

function envTextColor(tone: WorkspaceAgent["environments"][number]["tone"]) {
  if (tone === "danger")  return "text-danger";
  if (tone === "warning") return "text-warning";
  if (tone === "success") return "text-success";
  return "text-muted";
}

function roleCopy(role: AppState["role"]) {
  if (role === "Workspace Admin") {
    return {
      settingsLabel: "Workspace Settings",
      primaryLabel: "Add Agent",
      primaryDisabled: false,
      context: "Can add agents, manage workspace settings, and run staging tests.",
      tableAction: (a: WorkspaceAgent) => (a.status === "Stable" ? "Execute Preview" : "Open Agent"),
    };
  }
  if (role === "Org Admin") {
    return {
      settingsLabel: "Workspace Settings",
      primaryLabel: "Review Governance",
      primaryDisabled: false,
      context: "Viewing workspace health with governance and production-risk permissions.",
      tableAction: (a: WorkspaceAgent) => (a.status === "At Risk" ? "Review Risk" : "View Agent"),
    };
  }
  return {
    settingsLabel: "View Settings",
    primaryLabel: "New Agent",
    primaryDisabled: true,
    context: "Can open Relevant Items and evaluate changes. New agent creation requires workspace admin access.",
    tableAction: (a: WorkspaceAgent) => (a.assigned ? "Open Agent" : "View Only"),
  };
}

/* ── Environment summary cell ─────────────────────────────── */

function EnvSummaryCell({ environments }: { environments: WorkspaceAgent["environments"] }) {
  const sorted = sortedEnvs({ environments } as WorkspaceAgent);
  const primary = sorted[0];

  if (primary.tone === "success") {
    return <span className="text-xs text-muted">All Stable</span>;
  }

  const otherProblematic = sorted.slice(1).filter((e) => e.tone !== "success");
  const tooltipText = otherProblematic.map((e) => `${e.name}: ${e.state}`).join(", ");

  return (
    <div className="flex items-center gap-1.5">
      <span className={`text-xs font-medium ${envTextColor(primary.tone)}`}>
        {primary.name} · {primary.state}
      </span>
      {otherProblematic.length > 0 && (
        <span
          title={tooltipText}
          className="cursor-help text-[11px] text-stone-400 underline decoration-dashed underline-offset-2"
        >
          +{otherProblematic.length}
        </span>
      )}
    </div>
  );
}

/* ── Thumbnail card ───────────────────────────────────────── */

function AgentCard({
  agent,
  actionLabel,
  locked,
}: {
  agent: WorkspaceAgent;
  actionLabel: string;
  locked: boolean;
}) {
  const borderAccent =
    agent.status === "At Risk"   ? "border-danger/40"  :
    agent.status === "Attention" ? "border-warning/40" : "border-line";

  return (
    <div className={`flex flex-col rounded-lg border bg-white ${borderAccent}`}>
      {/* Top */}
      <div className="flex items-start justify-between gap-2 p-4 pb-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-stone-100">
            <Bot size={15} className="text-stone-500" />
          </div>
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold text-ink">{agent.name}</div>
            <div className="text-[10px] text-muted">{agent.owner}</div>
          </div>
        </div>
        <StatusChip status={agent.status} />
      </div>

      {/* Environments */}
      <div className="flex gap-1.5 px-4 pb-3">
        {agent.environments.map((env) => (
          <div key={env.name} className="flex-1 rounded-md bg-stone-50 px-2 py-1.5 text-center">
            <div className="text-[9px] font-bold uppercase tracking-wider text-stone-400">{env.name}</div>
            <div className={`mt-0.5 truncate text-[10px] font-medium ${envTextColor(env.tone)}`}>{env.state}</div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-auto flex items-center justify-between gap-2 border-t border-line px-4 py-2.5">
        <span className="text-[10px] text-muted">{agent.lastUpdated}</span>
        <div className="flex items-center gap-1">
          <ActionButton
            variant={locked ? "quiet" : "secondary"}
            className="h-7 px-2.5 text-xs"
            disabled={locked}
          >
            {locked ? "View Only" : actionLabel}
          </ActionButton>
          <button className="flex h-7 w-7 items-center justify-center rounded-md border border-line text-muted hover:bg-stone-50 hover:text-ink">
            <MoreHorizontal size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Page ─────────────────────────────────────────────────── */

type SummaryCell = {
  label: string;
  count: number;
  numColor: string;
  filterVal: FilterStatus;
};

export function WorkspaceDetail({ app }: PageProps) {
  const [query, setQuery]                         = useState("");
  const [statusFilter, setStatusFilter]           = useState<FilterStatus>("All");
  const [environmentFilter, setEnvironmentFilter] = useState<FilterEnvironment>("All");
  const [sortMode, setSortMode]                   = useState<SortMode>("Risk first");
  const [viewMode, setViewMode]                   = useState<"grid" | "list">("grid");

  const permissions = roleCopy(app.role);
  const wsAgents = allWorkspaceAgents[app.workspace.id] ?? [];

  const counts = useMemo(() => ({
    atRisk:    wsAgents.filter((a) => a.status === "At Risk").length,
    attention: wsAgents.filter((a) => a.status === "Attention").length,
    stable:    wsAgents.filter((a) => a.status === "Stable").length,
    total:     wsAgents.length,
  }), [wsAgents]);

  const summaryCells: SummaryCell[] = [
    { label: "Total Agents",    count: counts.total,     numColor: "text-accent",  filterVal: "All"        },
    { label: "At Risk",         count: counts.atRisk,    numColor: "text-danger",  filterVal: "At Risk"    },
    { label: "Needs Attention", count: counts.attention, numColor: "text-warning", filterVal: "Attention"  },
    { label: "Stable",          count: counts.stable,    numColor: "text-success", filterVal: "Stable"     },
  ];

  const needsAttentionFiltered = useMemo(() => {
    if (statusFilter === "All") {
      return wsAgents.filter((a) => a.status === "At Risk" || a.status === "Attention");
    }
    return wsAgents.filter((a) => a.status === statusFilter);
  }, [statusFilter, wsAgents]);

  const filteredAgents = useMemo(() => {
    const q = query.trim().toLowerCase();
    return wsAgents
      .filter((agent) => {
        if (q && !agent.name.toLowerCase().includes(q) && !agent.owner.toLowerCase().includes(q)) return false;
        if (statusFilter !== "All" && agent.status !== statusFilter) return false;
        if (environmentFilter !== "All" && !agent.environments.some((e: WorkspaceAgent["environments"][number]) => e.name === environmentFilter)) return false;
        return true;
      })
      .sort((a: WorkspaceAgent, b: WorkspaceAgent) => {
        if (sortMode === "Recently updated") return a.updatedRank - b.updatedRank;
        if (sortMode === "Agent A-Z") return a.name.localeCompare(b.name);
        return riskOrder[a.status] - riskOrder[b.status] || a.updatedRank - b.updatedRank;
      });
  }, [environmentFilter, query, sortMode, statusFilter, wsAgents]);

  function handleSummaryClick(filterVal: FilterStatus) {
    if (filterVal === "All") {
      setStatusFilter("All");
    } else {
      setStatusFilter((prev) => (prev === filterVal ? "All" : filterVal));
    }
  }

  return (
    <div className="space-y-6">

      {/* ── Page header ─────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-5">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-accent">Workspace</div>
          <h1 className="mt-1 text-3xl font-bold text-ink">{app.workspace.name}</h1>
          <p className="mt-2 text-sm text-muted">{permissions.context}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <ActionButton variant="secondary">
            <Settings size={16} />
            {permissions.settingsLabel}
          </ActionButton>
          {!permissions.primaryDisabled && (
            <ActionButton variant="primary">
              {app.role === "Org Admin" ? <ShieldCheck size={16} /> : <Plus size={16} />}
              {permissions.primaryLabel}
            </ActionButton>
          )}
        </div>
      </div>

      {/* ── Unified: Status Summary + Needs Attention ────────── */}
      <div className="rounded-lg border border-line bg-white">

        {/* Status filter row */}
        <div className="grid grid-cols-4 border-b border-line">
          {summaryCells.map((cell) => {
            const isActive = statusFilter === cell.filterVal;
            return (
              <button
                key={cell.label}
                onClick={() => handleSummaryClick(cell.filterVal)}
                className={`border-r border-r-line border-t-[3px] px-4 py-3 text-left transition last:border-r-0 ${
                  isActive
                    ? "border-t-[#1f2933] bg-stone-100 ring-1 ring-inset ring-stone-300/60"
                    : "border-t-transparent hover:bg-stone-50/60"
                }`}
              >
                <div className="text-[11px] font-semibold uppercase tracking-wide text-muted">{cell.label}</div>
                <div className={`mt-1 text-2xl font-bold ${cell.numColor}`}>{cell.count}</div>
              </button>
            );
          })}
        </div>

        {/* Needs Attention header */}
        <div className="flex shrink-0 items-center justify-between border-b border-line px-4 py-2.5">
          <h2 className="text-[12px] font-bold uppercase tracking-wide text-muted">Needs Attention</h2>
          <div className="flex items-center gap-2">
            {statusFilter !== "All" && (
              <button
                onClick={() => setStatusFilter("All")}
                className="rounded bg-stone-100 px-2 py-0.5 text-[10px] font-medium text-stone-500 transition hover:bg-stone-200"
              >
                {statusFilter} ×
              </button>
            )}
            <span className="text-[11px] text-muted">{needsAttentionFiltered.length} agents</span>
          </div>
        </div>

        {/* Needs Attention list */}
        <div className="divide-y divide-line">
          {needsAttentionFiltered.length === 0 ? (
            <div className="px-4 py-6 text-center text-sm text-muted">
              {statusFilter === "Stable"
                ? "All stable — no action needed"
                : "No agents match this filter"}
            </div>
          ) : (
            needsAttentionFiltered.map((agent: WorkspaceAgent) => {
              const issue = criticalIssueText(agent);
              const locked = app.role === "Agent Builder / Operator" && !agent.assigned;
              return (
                <div key={agent.id} className="flex items-center justify-between gap-4 px-4 py-3">
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <StatusChip status={agent.status} />
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium text-ink">{agent.name}</div>
                      {issue && <div className="mt-0.5 text-xs text-muted">{issue}</div>}
                    </div>
                  </div>
                  <ActionButton
                    variant={locked ? "quiet" : "secondary"}
                    className="h-7 shrink-0 px-2.5 text-xs"
                    disabled={locked}
                  >
                    {locked ? "View Only" : permissions.tableAction(agent)}
                  </ActionButton>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ── Agent List ───────────────────────────────────────── */}
      <Card className="overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-line px-4 py-3">
          <h2 className="text-[13px] font-bold uppercase tracking-wide text-ink">
            Agent List
            {statusFilter !== "All" && (
              <span className="ml-2 font-normal normal-case text-muted">
                — filtered by {statusFilter}
                <button
                  onClick={() => setStatusFilter("All")}
                  className="ml-1.5 text-accent hover:underline"
                >
                  Clear
                </button>
              </span>
            )}
          </h2>
          <div className="flex items-center rounded-md border border-line bg-stone-50 p-0.5">
            <button
              onClick={() => setViewMode("grid")}
              title="Thumbnail view"
              className={`flex h-7 w-7 items-center justify-center rounded transition ${
                viewMode === "grid" ? "bg-white shadow-sm text-ink" : "text-muted hover:text-ink"
              }`}
            >
              <LayoutGrid size={14} />
            </button>
            <button
              onClick={() => setViewMode("list")}
              title="List view"
              className={`flex h-7 w-7 items-center justify-center rounded transition ${
                viewMode === "list" ? "bg-white shadow-sm text-ink" : "text-muted hover:text-ink"
              }`}
            >
              <List size={14} />
            </button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="border-b border-line bg-stone-50/60 px-3 py-3">
          <div className="grid grid-cols-[1fr_170px_190px_170px] gap-3">
            <label className="flex h-9 items-center gap-2 rounded-md border border-line bg-white px-3 text-muted">
              <Search size={15} />
              <input
                aria-label="Search agents"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search agents..."
                className="min-w-0 flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-muted"
              />
            </label>

            <select
              aria-label="Health status filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as FilterStatus)}
              className="h-9 rounded-md border border-line bg-white px-2 text-sm text-ink outline-none focus:border-accent"
            >
              <option value="All">Health Status</option>
              <option value="At Risk">At Risk</option>
              <option value="Attention">Attention</option>
              <option value="Stable">Stable</option>
              <option value="In Progress">In Progress</option>
              <option value="Draft">Draft</option>
            </select>

            <select
              aria-label="Environment stage filter"
              value={environmentFilter}
              onChange={(e) => setEnvironmentFilter(e.target.value as FilterEnvironment)}
              className="h-9 rounded-md border border-line bg-white px-2 text-sm text-ink outline-none focus:border-accent"
            >
              <option value="All">Environment Stage</option>
              <option value="Dev">Dev</option>
              <option value="Staging">Staging</option>
              <option value="Prod">Prod</option>
            </select>

            <select
              aria-label="Sort agents"
              value={sortMode}
              onChange={(e) => setSortMode(e.target.value as SortMode)}
              className="h-9 rounded-md border border-line bg-white px-2 text-sm text-ink outline-none focus:border-accent"
            >
              {sortOptions.map((s) => (
                <option key={s} value={s}>Sort: {s}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Content */}
        {filteredAgents.length === 0 ? (
          <div className="p-3">
            <div className="rounded-md border border-dashed border-line py-8 text-center text-sm text-muted">
              No agents match the current filters.
            </div>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-3 gap-3 p-3">
            {filteredAgents.map((agent) => {
              const locked = app.role === "Agent Builder / Operator" && !agent.assigned;
              return (
                <AgentCard
                  key={agent.id}
                  agent={agent}
                  actionLabel={permissions.tableAction(agent)}
                  locked={locked}
                />
              );
            })}
          </div>
        ) : (
          <div className="p-3">
            <DataTable<WorkspaceAgent>
              rows={filteredAgents}
              getRowKey={(a) => a.id}
              columns={[
                {
                  key: "agent",
                  header: "Agent",
                  render: (a) => (
                    <div>
                      <div className="font-semibold text-ink">{a.name}</div>
                      <div className="text-xs text-muted">{app.workspace.name}</div>
                    </div>
                  ),
                },
                {
                  key: "status",
                  header: "Status",
                  render: (a) => <StatusChip status={a.status} />,
                },
                {
                  key: "env",
                  header: "Environments",
                  render: (a) => <EnvSummaryCell environments={a.environments} />,
                },
                {
                  key: "updated",
                  header: "Last Updated",
                  render: (a) => <span className="text-sm text-muted">{a.lastUpdated}</span>,
                },
                {
                  key: "owner",
                  header: "Owner",
                  render: (a) => <span className="text-sm text-ink">{a.owner}</span>,
                },
                {
                  key: "action",
                  header: "Action",
                  render: (a) => {
                    const locked = app.role === "Agent Builder / Operator" && !a.assigned;
                    return (
                      <div className="flex items-center gap-2">
                        <ActionButton
                          variant={locked ? "quiet" : "secondary"}
                          className="h-7 px-2 text-xs"
                          disabled={locked}
                          title={locked ? "Only Relevant Items can be opened by this role." : undefined}
                        >
                          {locked ? "View Only" : permissions.tableAction(a)}
                        </ActionButton>
                        <button
                          aria-label={`More actions for ${a.name}`}
                          className="flex h-7 w-7 items-center justify-center rounded-md border border-line bg-white text-muted hover:bg-stone-50 hover:text-ink"
                        >
                          <MoreHorizontal size={15} />
                        </button>
                      </div>
                    );
                  },
                },
              ]}
            />
          </div>
        )}
      </Card>

    </div>
  );
}
