import { MoreHorizontal, Plus, Search, Settings, ShieldCheck } from "lucide-react";
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
type TabName = "Overview" | "Agents" | "Performance" | "Alerts" | "Settings";

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

const tabs: TabName[] = ["Overview", "Agents", "Performance", "Alerts", "Settings"];
const sortOptions: SortMode[] = ["Risk first", "Recently updated", "Agent A-Z"];

const naverPayAgents: WorkspaceAgent[] = [
  {
    id: "payment-issue-resolver",
    name: "Payment Issue Resolver",
    status: "At Risk",
    environments: [
      { name: "Dev",     state: "Updated", tone: "warning" },
      { name: "Staging", state: "Failed",  tone: "danger"  },
      { name: "Prod",    state: "Risk",    tone: "danger"  },
    ],
    lastUpdated: "12 min ago",
    updatedRank: 1,
    owner: "Sora Kim",
    assigned: true,
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
    lastUpdated: "28 min ago",
    updatedRank: 2,
    owner: "Daniel Choi",
    assigned: true,
  },
  {
    id: "transaction-failure-bot",
    name: "Transaction Failure Bot",
    status: "Attention",
    environments: [
      { name: "Dev",     state: "Updated",       tone: "warning" },
      { name: "Staging", state: "Test required",  tone: "warning" },
      { name: "Prod",    state: "Live",           tone: "success" },
    ],
    lastUpdated: "41 min ago",
    updatedRank: 3,
    owner: "Mina Park",
    assigned: true,
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
    lastUpdated: "1 hr ago",
    updatedRank: 4,
    owner: "Sora Kim",
    assigned: true,
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
    lastUpdated: "2 hrs ago",
    updatedRank: 5,
    owner: "Jae Lee",
    assigned: false,
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
    lastUpdated: "Yesterday",
    updatedRank: 6,
    owner: "Hana Jung",
    assigned: false,
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
    lastUpdated: "Yesterday",
    updatedRank: 7,
    owner: "Sora Kim",
    assigned: true,
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
    lastUpdated: "Apr 25",
    updatedRank: 8,
    owner: "Daniel Choi",
    assigned: false,
  },
];

const riskOrder: Record<WorkspaceAgentStatus, number> = {
  "At Risk":    0,
  Attention:    1,
  "In Progress":2,
  Draft:        3,
  Stable:       4,
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

function envBadgeClass(tone: WorkspaceAgent["environments"][number]["tone"]) {
  if (tone === "success") return "border-emerald-200 bg-emerald-50 text-success";
  if (tone === "warning") return "border-amber-200 bg-amber-50 text-warning";
  if (tone === "danger")  return "border-red-200 bg-red-50 text-danger";
  return "border-stone-200 bg-stone-50 text-stone-500";
}

function roleCopy(role: AppState["role"]) {
  if (role === "Workspace Admin") {
    return {
      settingsLabel: "Workspace Settings",
      primaryLabel: "New Agent",
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

/* ── Summary card ─────────────────────────────────────────── */

type SummaryTone = "danger" | "warning" | "success" | "neutral";

const summaryToneMap: Record<SummaryTone, { number: string; activeBorder: string; activeBg: string }> = {
  danger:  { number: "text-danger",  activeBorder: "border-danger/30",  activeBg: "bg-danger/5"  },
  warning: { number: "text-warning", activeBorder: "border-warning/30", activeBg: "bg-warning/5" },
  success: { number: "text-success", activeBorder: "border-success/30", activeBg: "bg-success/5" },
  neutral: { number: "text-ink",     activeBorder: "border-accent/30",  activeBg: "bg-accent/5"  },
};

function SummaryCard({
  label, count, tone, active, onClick,
}: {
  label: string; count: number; tone: SummaryTone; active: boolean; onClick: () => void;
}) {
  const s = summaryToneMap[tone];
  return (
    <button
      onClick={onClick}
      className={`rounded-lg border p-4 text-left transition hover:shadow-sm ${
        active
          ? `${s.activeBorder} ${s.activeBg}`
          : "border-line bg-white hover:bg-stone-50"
      }`}
    >
      <div className="text-[11px] font-semibold uppercase tracking-wider text-muted">{label}</div>
      <div className={`mt-2 text-3xl font-bold ${s.number}`}>{count}</div>
    </button>
  );
}

/* ── Environment summary cell ─────────────────────────────── */

function EnvSummaryCell({ environments }: { environments: WorkspaceAgent["environments"] }) {
  const sorted = sortedEnvs({ environments } as WorkspaceAgent);
  const primary = sorted[0];

  if (primary.tone === "success") {
    return <span className="text-xs text-muted">All Stable</span>;
  }

  const otherProblematic = sorted.slice(1).filter((e) => e.tone !== "success");

  return (
    <div className="flex items-center gap-1.5">
      <span className={`rounded border px-1.5 py-0.5 text-[11px] font-medium ${envBadgeClass(primary.tone)}`}>
        {primary.name} {primary.state}
      </span>
      {otherProblematic.length > 0 && (
        <span className="text-[11px] text-muted">+{otherProblematic.length}</span>
      )}
    </div>
  );
}

/* ── Page ─────────────────────────────────────────────────── */

export function WorkspaceDetail({ app }: PageProps) {
  const [activeTab, setActiveTab]               = useState<TabName>("Agents");
  const [query, setQuery]                       = useState("");
  const [statusFilter, setStatusFilter]         = useState<FilterStatus>("All");
  const [environmentFilter, setEnvironmentFilter] = useState<FilterEnvironment>("All");
  const [sortMode, setSortMode]                 = useState<SortMode>("Risk first");

  const permissions = roleCopy(app.role);

  const counts = useMemo(() => ({
    atRisk:    naverPayAgents.filter((a) => a.status === "At Risk").length,
    attention: naverPayAgents.filter((a) => a.status === "Attention").length,
    stable:    naverPayAgents.filter((a) => a.status === "Stable").length,
    total:     naverPayAgents.length,
  }), []);

  const needsAttentionAgents = useMemo(
    () => naverPayAgents.filter((a) => a.status === "At Risk" || a.status === "Attention"),
    [],
  );

  const filteredAgents = useMemo(() => {
    const q = query.trim().toLowerCase();
    return naverPayAgents
      .filter((agent) => {
        if (q && !agent.name.toLowerCase().includes(q) && !agent.owner.toLowerCase().includes(q)) return false;
        if (statusFilter !== "All" && agent.status !== statusFilter) return false;
        if (environmentFilter !== "All" && !agent.environments.some((e) => e.name === environmentFilter)) return false;
        return true;
      })
      .sort((a, b) => {
        if (sortMode === "Recently updated") return a.updatedRank - b.updatedRank;
        if (sortMode === "Agent A-Z") return a.name.localeCompare(b.name);
        return riskOrder[a.status] - riskOrder[b.status] || a.updatedRank - b.updatedRank;
      });
  }, [environmentFilter, query, sortMode, statusFilter]);

  function toggleStatusFilter(s: WorkspaceAgentStatus) {
    setStatusFilter((prev) => (prev === s ? "All" : s));
  }

  return (
    <div className="space-y-6">

      {/* ── Page header ─────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-5">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-accent">Workspace</div>
          <h1 className="mt-1 text-3xl font-bold text-ink">Naver Pay Operations</h1>
          <p className="mt-2 text-sm text-muted">{permissions.context}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <ActionButton variant="secondary">
            <Settings size={16} />
            {permissions.settingsLabel}
          </ActionButton>
          <ActionButton
            variant="primary"
            disabled={permissions.primaryDisabled}
            title={permissions.primaryDisabled ? "Workspace Admin permission required." : undefined}
          >
            {app.role === "Org Admin" ? <ShieldCheck size={16} /> : <Plus size={16} />}
            {permissions.primaryLabel}
          </ActionButton>
        </div>
      </div>

      {/* ── Summary cards — filter triggers ─────────────────── */}
      <div className="grid grid-cols-4 gap-3">
        <SummaryCard
          label="At Risk"
          count={counts.atRisk}
          tone="danger"
          active={statusFilter === "At Risk"}
          onClick={() => toggleStatusFilter("At Risk")}
        />
        <SummaryCard
          label="Needs Attention"
          count={counts.attention}
          tone="warning"
          active={statusFilter === "Attention"}
          onClick={() => toggleStatusFilter("Attention")}
        />
        <SummaryCard
          label="Stable"
          count={counts.stable}
          tone="success"
          active={statusFilter === "Stable"}
          onClick={() => toggleStatusFilter("Stable")}
        />
        <SummaryCard
          label="Total Agents"
          count={counts.total}
          tone="neutral"
          active={statusFilter === "All"}
          onClick={() => setStatusFilter("All")}
        />
      </div>

      {/* ── Needs Attention ──────────────────────────────────── */}
      {needsAttentionAgents.length > 0 && statusFilter === "All" && (
        <div>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink">
            Needs Attention
          </h2>
          <Card className="overflow-hidden p-0">
            <div className="divide-y divide-line">
              {needsAttentionAgents.map((agent) => {
                const issue = criticalIssueText(agent);
                const locked = app.role === "Agent Builder / Operator" && !agent.assigned;
                return (
                  <div key={agent.id} className="flex items-center justify-between gap-4 px-4 py-3">
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                      <StatusChip status={agent.status} />
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium text-ink">{agent.name}</div>
                        {issue && (
                          <div className="mt-0.5 text-xs text-muted">{issue}</div>
                        )}
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
              })}
            </div>
          </Card>
        </div>
      )}

      {/* ── All Agents ──────────────────────────────────────── */}
      <div>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink">
          All Agents
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

        <Card className="overflow-hidden">
          {/* Tabs */}
          <div className="flex items-center gap-1 border-b border-line px-3 pt-2">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`h-9 border-b-2 px-3 text-sm font-medium ${
                  activeTab === tab
                    ? "border-accent text-accent"
                    : "border-transparent text-muted hover:text-ink"
                }`}
              >
                {tab}
              </button>
            ))}
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

          {/* Table */}
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
                      <div className="text-xs text-muted">Naver Pay Operations</div>
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
            {filteredAgents.length === 0 && (
              <div className="rounded-md border border-dashed border-line py-8 text-center text-sm text-muted">
                No agents match the current filters.
              </div>
            )}
          </div>
        </Card>
      </div>

    </div>
  );
}
