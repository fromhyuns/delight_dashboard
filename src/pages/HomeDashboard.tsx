import { useState } from "react";
import { ChevronLeft, ChevronRight, Info, Pin } from "lucide-react";
import type { AppState } from "../App";
import { ActionButton } from "../components/ui/ActionButton";
import { useNavigate } from "react-router-dom";
import type { Role } from "../types";

type PageProps = { app: AppState };

type Metric = {
  label: string;
  value: string;
  detail: string;
  tone: "risk" | "attention" | "stable" | "total";
};

type ActionItem = {
  id: string;
  agentName: string;
  workspace: string;
  reason: string;
  tone: "risk" | "attention" | "stable";
  cta: string;
  emphasized?: boolean;
  workspaceId?: string;
  agentId?: string;
  route?: string;
};

type QuickAgent = {
  id: string;
  name: string;
  workspace: string;
  workspaceId: string;
  agentId: string;
  status: "stable" | "attention" | "risk";
};

type ActivityItem = {
  id: string;
  text: string;
  time: string;
  type: "risk" | "attention" | "info";
};

type UpcomingItem = {
  id: string;
  text: string;
  scheduledAt: string;
  type: "evaluation" | "deployment" | "review";
};

type RoleContent = {
  metrics: Metric[];
  actionItems: ActionItem[];
};

type RoleMeta = {
  userName: string;
  scopeText: string;
  quickAccess: QuickAgent[];
  recentActivity: ActivityItem[];
  upcoming: UpcomingItem[];
};

/* ─── Role content ─────────────────────────────────────────── */

const roleContent: Record<Role, RoleContent> = {
  "Agent Builder / Operator": {
    metrics: [
      { label: "At Risk",        value: "2",  detail: "My agents with failing checks", tone: "risk"      },
      { label: "Need Attention", value: "5",  detail: "Drafts or test regressions",    tone: "attention" },
      { label: "Stable",         value: "19", detail: "Passing latest evaluation",     tone: "stable"    },
      { label: "Total Agents",   value: "26", detail: "Across 4 workspaces",           tone: "total"     },
    ],
    actionItems: [
      { id: "a1", agentName: "Payment Issue Resolver",    workspace: "Naver Pay Operations", reason: "Failed staging test — 2 policy edge cases",    tone: "risk",      cta: "Review Test",      emphasized: true, workspaceId: "naver-pay",        agentId: "refund-review",   route: "/evaluate"          },
      { id: "a2", agentName: "Catalog Monitor",           workspace: "Shopping Support",     reason: "Draft instruction changes pending build",       tone: "attention", cta: "Open Build",                        workspaceId: "shopping-support", agentId: "catalog-monitor", route: "/build/development" },
      { id: "a3", agentName: "Reservation Change Triage", workspace: "Reservation CX",       reason: "Approval pending from workspace admin",         tone: "attention", cta: "View Status",                       workspaceId: "reservation-cx",  agentId: "query-intent",    route: "/agent"             },
    ],
  },
  "Workspace Admin": {
    metrics: [
      { label: "At Risk",        value: "3",  detail: "Workspace release blockers",    tone: "risk"      },
      { label: "Need Attention", value: "7",  detail: "Agents awaiting admin review",  tone: "attention" },
      { label: "Stable",         value: "16", detail: "Ready or operating normally",   tone: "stable"    },
      { label: "Total Agents",   value: "26", detail: "Workspace portfolio",           tone: "total"     },
    ],
    actionItems: [
      { id: "a1", agentName: "Payment Issue Resolver",    workspace: "Naver Pay Operations", reason: "2 staging test failures blocking release",      tone: "risk",      cta: "Review Failed Tests", emphasized: true, workspaceId: "naver-pay",        agentId: "refund-review",   route: "/evaluate"                },
      { id: "a2", agentName: "Catalog Monitor",           workspace: "Shopping Support",     reason: "Final staging run needed before approval",      tone: "attention", cta: "Execute Preview",               workspaceId: "shopping-support", agentId: "catalog-monitor", route: "/build/development"       },
      { id: "a3", agentName: "Ticket Routing Agent",      workspace: "Global Customer Care", reason: "Agent paused — pending admin review",           tone: "attention", cta: "Review",                        workspaceId: "global-care",      agentId: "ticket-routing",  route: "/agent"                   },
      { id: "a4", agentName: "Reservation Change Triage", workspace: "Reservation CX",       reason: "Checks passed, ready for production promotion", tone: "stable",    cta: "Request Approval",              workspaceId: "reservation-cx",  agentId: "query-intent",    route: "/build/production-safety" },
    ],
  },
  "Org Admin": {
    metrics: [
      { label: "At Risk",        value: "4",  detail: "Org-wide production risks",     tone: "risk"      },
      { label: "Need Attention", value: "9",  detail: "Workspace policy exceptions",   tone: "attention" },
      { label: "Stable",         value: "13", detail: "Within governance thresholds",  tone: "stable"    },
      { label: "Total Agents",   value: "26", detail: "NAVER Corp scope",              tone: "total"     },
    ],
    actionItems: [
      { id: "a1", agentName: "Payment Issue Resolver", workspace: "Naver Pay Operations", reason: "Restricted — production risk pending policy review",    tone: "risk",      cta: "View Production Risks",   emphasized: true, workspaceId: "naver-pay",        agentId: "refund-review",   route: "/build/production-safety" },
      { id: "a2", agentName: "Ticket Routing Agent",   workspace: "Global Customer Care", reason: "2 access reviews required by security",                 tone: "attention", cta: "Review Workspace Issues",               workspaceId: "global-care",                             route: "/workspace"               },
      { id: "a3", agentName: "Catalog Monitor",        workspace: "Shopping Support",     reason: "Policy exception flagged — needs governance sign-off",   tone: "attention", cta: "View Governance",                       workspaceId: "shopping-support", agentId: "catalog-monitor", route: "/build/production-safety" },
    ],
  },
};

const roleMeta: Record<Role, RoleMeta> = {
  "Agent Builder / Operator": {
    userName: "Jisoo Lee",
    scopeText: "3 items require your attention · 4 workspaces",
    quickAccess: [
      { id: "q1", name: "Refund Assistant",        workspace: "Naver Pay Operations", workspaceId: "naver-pay",        agentId: "refund-assistant",    status: "stable"    },
      { id: "q2", name: "Transaction Failure Bot", workspace: "Naver Pay Operations", workspaceId: "naver-pay",        agentId: "transaction-failure", status: "attention" },
      { id: "q3", name: "Catalog Monitor",         workspace: "Shopping Support",     workspaceId: "shopping-support", agentId: "catalog-monitor",     status: "risk"      },
      { id: "q4", name: "Query Intent Agent",      workspace: "Reservation CX",       workspaceId: "reservation-cx",  agentId: "query-intent",        status: "stable"    },
      { id: "q5", name: "Ticket Routing Agent",    workspace: "Global Customer Care", workspaceId: "global-care",     agentId: "ticket-routing",      status: "attention" },
    ],
    recentActivity: [
      { id: "r1", text: "Test case failed — Payment Issue Resolver",           time: "14 min ago", type: "risk"      },
      { id: "r2", text: "Build draft saved — Catalog Monitor",                 time: "32 min ago", type: "info"      },
      { id: "r3", text: "Evaluation complete — Reservation Change Triage",     time: "1 hr ago",   type: "info"      },
      { id: "r4", text: "Staging test run triggered — Payment Issue Resolver", time: "2 hr ago",   type: "info"      },
      { id: "r5", text: "Approval request submitted — Reservation Change",     time: "3 hr ago",   type: "attention" },
      { id: "r6", text: "Build version deployed to dev — Catalog Monitor",     time: "Yesterday",  type: "info"      },
    ],
    upcoming: [
      { id: "u1", text: "Staging evaluation — Payment Issue Resolver", scheduledAt: "Today, 3:00 PM",     type: "evaluation" },
      { id: "u2", text: "Build review — Catalog Monitor",              scheduledAt: "Tomorrow, 10:00 AM", type: "review"     },
      { id: "u3", text: "Dev deploy — Reservation Change Triage",      scheduledAt: "Thu, May 2",          type: "deployment" },
    ],
  },
  "Workspace Admin": {
    userName: "Minho Park",
    scopeText: "4 items require attention · Naver Pay Operations",
    quickAccess: [
      { id: "q1", name: "Refund Assistant",        workspace: "Naver Pay Operations", workspaceId: "naver-pay",        agentId: "refund-assistant",    status: "stable"    },
      { id: "q2", name: "Transaction Failure Bot", workspace: "Naver Pay Operations", workspaceId: "naver-pay",        agentId: "transaction-failure", status: "attention" },
      { id: "q3", name: "Catalog Monitor",         workspace: "Shopping Support",     workspaceId: "shopping-support", agentId: "catalog-monitor",     status: "risk"      },
    ],
    recentActivity: [
      { id: "r1", text: "Staging test failed — Payment Issue Resolver",   time: "18 min ago", type: "risk"      },
      { id: "r2", text: "Deployment package created — Catalog Monitor",   time: "41 min ago", type: "info"      },
      { id: "r3", text: "Workspace review completed — Reservation CX",    time: "1 hr ago",   type: "info"      },
      { id: "r4", text: "Agent paused by admin — Ticket Routing Agent",   time: "2 hr ago",   type: "attention" },
      { id: "r5", text: "Approval request received — Reservation Change", time: "3 hr ago",   type: "attention" },
      { id: "r6", text: "Staging run completed — Catalog Monitor",        time: "Yesterday",  type: "info"      },
    ],
    upcoming: [
      { id: "u1", text: "Release gate review — Naver Pay Operations", scheduledAt: "Today, 5:00 PM",    type: "review"     },
      { id: "u2", text: "Staging run — Catalog Monitor",              scheduledAt: "Tomorrow, 2:00 PM", type: "evaluation" },
    ],
  },
  "Org Admin": {
    userName: "Sora Kim",
    scopeText: "NAVER Corp · 4 workspaces · 26 agents",
    quickAccess: [
      { id: "q1", name: "Refund Assistant",        workspace: "Naver Pay Operations", workspaceId: "naver-pay",        agentId: "refund-assistant",    status: "stable"    },
      { id: "q2", name: "Transaction Failure Bot", workspace: "Naver Pay Operations", workspaceId: "naver-pay",        agentId: "transaction-failure", status: "attention" },
      { id: "q3", name: "Catalog Monitor",         workspace: "Shopping Support",     workspaceId: "shopping-support", agentId: "catalog-monitor",     status: "risk"      },
    ],
    recentActivity: [
      { id: "r1", text: "Production promotion blocked — Naver Pay Operations",  time: "14 min ago", type: "risk"      },
      { id: "r2", text: "Production agent restricted — Payment Issue Resolver", time: "1 hr ago",   type: "risk"      },
      { id: "r3", text: "Governance policy updated — NAVER Corp",               time: "2 hr ago",   type: "info"      },
      { id: "r4", text: "Access review raised — Global Customer Care",          time: "4 hr ago",   type: "attention" },
      { id: "r5", text: "Workspace exception flagged — Shopping Support",       time: "Yesterday",  type: "attention" },
      { id: "r6", text: "Policy audit completed — NAVER Corp",                  time: "2 days ago", type: "info"      },
    ],
    upcoming: [
      { id: "u1", text: "Policy audit review — NAVER Corp",             scheduledAt: "Today, 4:00 PM",     type: "review" },
      { id: "u2", text: "Workspace governance check — Shopping Support", scheduledAt: "Tomorrow, 11:00 AM", type: "review" },
      { id: "u3", text: "Security access review — Global Customer Care", scheduledAt: "Thu, May 2",          type: "review" },
    ],
  },
};

/* ─── Helpers ──────────────────────────────────────────────── */

const PAGE_SIZE = 4;

function metricValueColor(tone: Metric["tone"]) {
  if (tone === "risk")      return "text-danger";
  if (tone === "attention") return "text-warning";
  if (tone === "stable")    return "text-success";
  return "text-accent";
}

function activityDot(type: ActivityItem["type"]) {
  if (type === "risk")      return "bg-rose-400";
  if (type === "attention") return "bg-amber-400";
  return "bg-stone-400";
}

function statusBadge(status: QuickAgent["status"]) {
  if (status === "risk")      return "bg-danger/10 text-danger";
  if (status === "attention") return "bg-warning/10 text-warning";
  return "bg-success/10 text-success";
}

function statusLabel(status: QuickAgent["status"]) {
  if (status === "risk")      return "At Risk";
  if (status === "attention") return "Attention";
  return "Stable";
}

function initials(name: string) {
  return name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}

/* ─── Component ────────────────────────────────────────────── */

export function HomeDashboard({ app }: PageProps) {
  const navigate = useNavigate();
  const content = roleContent[app.role];
  const meta = roleMeta[app.role];
  const [statusFilter, setStatusFilter]   = useState<Metric["tone"] | null>(null);
  const [pinnedIds, setPinnedIds]         = useState<Set<string>>(new Set());
  const [quickPage, setQuickPage]         = useState(0);
  const [showPinnedOnly, setShowPinnedOnly] = useState(false);
  const [timelineTab, setTimelineTab]     = useState<"recent" | "upcoming">("recent");

  const filteredItems =
    statusFilter && statusFilter !== "total"
      ? content.actionItems.filter((item) => item.tone === statusFilter)
      : content.actionItems;

  const sortedAgents = [...meta.quickAccess].sort((a, b) =>
    (pinnedIds.has(b.id) ? 1 : 0) - (pinnedIds.has(a.id) ? 1 : 0),
  );
  const displayAgents = showPinnedOnly ? sortedAgents.filter((q) => pinnedIds.has(q.id)) : sortedAgents;
  const totalPages    = Math.ceil(displayAgents.length / PAGE_SIZE);
  const visibleAgents = displayAgents.slice(quickPage * PAGE_SIZE, (quickPage + 1) * PAGE_SIZE);

  function togglePin(id: string) {
    setPinnedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function togglePinnedOnly() {
    setShowPinnedOnly((p) => !p);
    setQuickPage(0);
  }

  function handleAction(item: ActionItem) {
    if (item.workspaceId) app.setWorkspaceId(item.workspaceId);
    if (item.agentId)     app.setAgentId(item.agentId);
    if (item.route)       navigate(item.route);
  }

  function handleQuickAccess(q: QuickAgent) {
    app.setWorkspaceId(q.workspaceId);
    app.setAgentId(q.agentId);
    navigate("/agent");
  }

  return (
    <div className="flex h-[calc(100vh-6rem)] flex-col gap-5 overflow-hidden">

      {/* Page header */}
      <div className="shrink-0">
        <h1 className="text-2xl font-bold leading-8 text-ink">Welcome back, {meta.userName}</h1>
        <p className="mt-1 text-sm text-muted">{meta.scopeText}</p>
      </div>

      {/* Two-column layout */}
      <div className="grid min-h-0 flex-1 grid-cols-[1fr_0.44fr] gap-6">

        {/* ── Left column ──────────────────────────────────── */}
        <div className="flex min-h-0 flex-col gap-4">

          {/* Unified card: metrics filter + Action Required */}
          <div className="flex min-h-0 flex-1 flex-col rounded-lg border border-line bg-white">

            {/* Metric filter row */}
            <div className="grid shrink-0 grid-cols-4 border-b border-line">
              {content.metrics.map((m) => (
                <button
                  key={m.label}
                  onClick={() => setStatusFilter((prev) => prev === m.tone ? null : m.tone)}
                  className={`border-r border-r-line border-t-[3px] px-4 py-3 text-left transition last:border-r-0 ${
                    statusFilter === m.tone
                      ? "border-t-[#1f2933] bg-stone-100 ring-1 ring-inset ring-stone-300/60"
                      : "border-t-transparent hover:bg-stone-50/60"
                  }`}
                >
                  <div className="text-[11px] font-semibold uppercase tracking-wide text-muted">{m.label}</div>
                  <div className={`mt-1 text-2xl font-bold ${metricValueColor(m.tone)}`}>{m.value}</div>
                  <div className="mt-0.5 text-[12px] text-muted">{m.detail}</div>
                </button>
              ))}
            </div>

            {/* Action Required header */}
            <div className="flex shrink-0 items-center justify-between border-b border-line px-4 py-2.5">
              <h2 className="text-[12px] font-bold uppercase tracking-wide text-muted">Action Required</h2>
              <div className="flex items-center gap-2">
                {statusFilter && statusFilter !== "total" && (
                  <button
                    onClick={() => setStatusFilter(null)}
                    className="rounded bg-stone-100 px-2 py-0.5 text-[10px] font-medium text-stone-500 transition hover:bg-stone-200"
                  >
                    {statusFilter} ×
                  </button>
                )}
                <span className="text-[11px] text-muted">{filteredItems.length} items</span>
              </div>
            </div>

            {/* Action Required list */}
            <div className="compact-scrollbar min-h-0 flex-1 overflow-y-auto">
              {filteredItems.length === 0 ? (
                <div className="flex h-full items-center justify-center">
                  <p className="text-sm text-muted">No items for this status</p>
                </div>
              ) : (
                <div className="divide-y divide-line">
                  {filteredItems.map((item) => (
                    <div
                      key={item.id}
                      className={`flex items-center gap-4 px-4 py-3 ${item.emphasized ? "bg-amber-50/50" : ""}`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-sm font-semibold text-ink">{item.agentName}</span>
                          <span className="text-[11px] text-stone-400">#{item.workspace.toUpperCase()}</span>
                        </div>
                        <div className="mt-0.5 text-[13px] text-muted">{item.reason}</div>
                      </div>
                      <ActionButton
                        variant={item.emphasized ? "primary" : "secondary"}
                        className="shrink-0"
                        onClick={() => handleAction(item)}
                      >
                        {item.cta}
                      </ActionButton>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Banner */}
          <div className="shrink-0 rounded-lg border border-sky-100 bg-sky-50 p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-white text-sky-500">
                <Info size={15} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[10px] font-bold uppercase tracking-wider text-sky-400">Platform Update</div>
                <div className="mt-0.5 text-sm font-semibold text-ink">Evaluation model updated to v3.2</div>
                <p className="mt-1 text-[12px] leading-relaxed text-stone-500">
                  Affects all staging runs from May 1. Review the updated scoring rubric before your next evaluation.
                </p>
              </div>
              <button className="shrink-0 text-[11px] font-medium text-sky-600 hover:underline">View</button>
            </div>
          </div>

        </div>

        {/* ── Right column ─────────────────────────────────── */}
        <div className="flex h-full flex-col gap-4 overflow-hidden">

          {/* Quick Access — 2-col card grid with pagination */}
          <div className="shrink-0 rounded-lg border border-line bg-white p-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-[13px] font-bold uppercase tracking-wide text-ink">Quick Access</h2>
              <button
                onClick={togglePinnedOnly}
                title={showPinnedOnly ? "Show all" : "Show pinned only"}
                className={`flex items-center gap-1 rounded px-2 py-1 text-[10px] font-semibold transition ${
                  showPinnedOnly
                    ? "bg-accent/10 text-accent"
                    : "text-stone-400 hover:bg-stone-100 hover:text-stone-600"
                }`}
              >
                <Pin size={10} fill={showPinnedOnly ? "currentColor" : "none"} />
                Pinned
              </button>
            </div>

            {showPinnedOnly && pinnedIds.size === 0 ? (
              <div className="flex h-20 items-center justify-center rounded-lg border border-dashed border-line">
                <p className="text-[12px] text-muted">Pin agents to see them here</p>
              </div>
            ) : (
            <div className="grid grid-cols-2 gap-2">
              {visibleAgents.map((q) => {
                const pinned = pinnedIds.has(q.id);
                return (
                  <button
                    key={q.id}
                    onClick={() => handleQuickAccess(q)}
                    className="group relative flex flex-col rounded-lg border border-line bg-white p-3 text-left transition hover:bg-stone-50 hover:shadow-sm"
                  >
                    {/* Pin — always visible, fill indicates pinned */}
                    <button
                      onClick={(e) => { e.stopPropagation(); togglePin(q.id); }}
                      aria-label={pinned ? "Unpin" : "Pin"}
                      className={`absolute right-2 top-2 transition-colors ${
                        pinned ? "text-accent" : "text-stone-200 hover:text-stone-400"
                      }`}
                    >
                      <Pin size={12} fill={pinned ? "currentColor" : "none"} />
                    </button>

                    {/* Avatar */}
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-stone-100 text-xs font-bold text-stone-500">
                      {initials(q.name)}
                    </div>

                    {/* Name */}
                    <div className="mt-2 pr-4 text-[13px] font-semibold leading-tight text-ink">{q.name}</div>

                    {/* Status badge */}
                    <span className={`mt-1.5 self-start rounded px-1.5 py-0.5 text-[10px] font-semibold ${statusBadge(q.status)}`}>
                      {statusLabel(q.status)}
                    </span>
                  </button>
                );
              })}
            </div>
            )}

            {/* Pagination — only when needed */}
            {totalPages > 1 && !(showPinnedOnly && pinnedIds.size === 0) && (
              <div className="mt-3 flex items-center justify-between">
                <button
                  onClick={() => setQuickPage((p) => Math.max(0, p - 1))}
                  disabled={quickPage === 0}
                  className="rounded p-1 text-muted transition hover:bg-stone-100 hover:text-ink disabled:opacity-30"
                >
                  <ChevronLeft size={14} />
                </button>
                <span className="text-[11px] text-muted">{quickPage + 1} / {totalPages}</span>
                <button
                  onClick={() => setQuickPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={quickPage === totalPages - 1}
                  className="rounded p-1 text-muted transition hover:bg-stone-100 hover:text-ink disabled:opacity-30"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            )}
          </div>

          {/* Timeline */}
          <div className="flex min-h-0 flex-1 flex-col rounded-lg border border-line bg-white">
            {/* Tabs */}
            <div className="flex shrink-0 border-b border-line">
              {(["recent", "upcoming"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setTimelineTab(tab)}
                  className={`relative -mb-px px-4 py-2.5 text-[11px] font-bold uppercase tracking-wide transition ${
                    timelineTab === tab
                      ? "border-b-2 border-stone-700 text-ink"
                      : "text-muted hover:text-ink"
                  }`}
                >
                  {tab === "recent" ? "Recent" : (
                    <span className="flex items-center gap-1.5">
                      Upcoming
                      {meta.upcoming.length > 0 && (
                        <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold leading-none ${
                          timelineTab === "upcoming"
                            ? "bg-stone-100 text-stone-600"
                            : "bg-accent/10 text-accent"
                        }`}>
                          {meta.upcoming.length}
                        </span>
                      )}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className="compact-scrollbar min-h-0 flex-1 overflow-y-auto p-4">
              {timelineTab === "recent" ? (
                <div className="flex flex-col gap-3">
                  {meta.recentActivity.map((item) => (
                    <div key={item.id} className="flex shrink-0 items-start gap-2.5">
                      <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${activityDot(item.type)}`} />
                      <div className="min-w-0 flex-1">
                        <div className="text-[13px] leading-snug text-ink">{item.text}</div>
                        <div className="mt-0.5 text-[11px] text-muted">{item.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {meta.upcoming.length === 0 ? (
                    <div className="flex h-full items-center justify-center">
                      <p className="text-sm text-muted">No upcoming events</p>
                    </div>
                  ) : (
                    meta.upcoming.map((item) => (
                      <div key={item.id} className="flex shrink-0 items-start gap-2.5">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full border border-stone-300" />
                        <div className="min-w-0 flex-1">
                          <div className="text-[13px] leading-snug text-ink">{item.text}</div>
                          <div className="mt-0.5 text-[11px] text-muted">{item.scheduledAt}</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
