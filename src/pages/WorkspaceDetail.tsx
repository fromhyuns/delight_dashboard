import { MoreHorizontal, Plus, Search, Settings, ShieldCheck } from "lucide-react";
import { useMemo, useState } from "react";
import type { AppState } from "../App";
import { ActionButton } from "../components/ui/ActionButton";
import { Badge } from "../components/ui/Badge";
import { Card } from "../components/ui/Card";
import { DataTable } from "../components/ui/DataTable";
import { StatusChip } from "../components/ui/StatusChip";

type PageProps = {
  app: AppState;
};

type WorkspaceAgentStatus = "At Risk" | "Attention" | "Stable" | "In Progress" | "Draft";
type FilterStatus = "All Status" | WorkspaceAgentStatus;
type FilterEnvironment = "All Environments" | "Dev" | "Staging" | "Prod";
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
const statusFilters: FilterStatus[] = ["All Status", "At Risk", "Attention", "Stable", "In Progress", "Draft"];
const environmentFilters: FilterEnvironment[] = ["All Environments", "Dev", "Staging", "Prod"];
const sortOptions: SortMode[] = ["Risk first", "Recently updated", "Agent A-Z"];

const naverPayAgents: WorkspaceAgent[] = [
  {
    id: "payment-issue-resolver",
    name: "Payment Issue Resolver",
    status: "At Risk",
    environments: [
      { name: "Dev", state: "Updated", tone: "warning" },
      { name: "Staging", state: "Failed", tone: "danger" },
      { name: "Prod", state: "Risk", tone: "danger" },
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
      { name: "Dev", state: "Stable", tone: "success" },
      { name: "Staging", state: "Passed", tone: "success" },
      { name: "Prod", state: "Live", tone: "success" },
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
      { name: "Dev", state: "Updated", tone: "warning" },
      { name: "Staging", state: "Test required", tone: "warning" },
      { name: "Prod", state: "Live", tone: "success" },
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
      { name: "Dev", state: "Draft", tone: "neutral" },
      { name: "Staging", state: "Not run", tone: "neutral" },
      { name: "Prod", state: "Not deployed", tone: "neutral" },
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
      { name: "Dev", state: "Stable", tone: "success" },
      { name: "Staging", state: "Passed", tone: "success" },
      { name: "Prod", state: "Live", tone: "success" },
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
      { name: "Dev", state: "Stable", tone: "success" },
      { name: "Staging", state: "Passed", tone: "success" },
      { name: "Prod", state: "Live", tone: "success" },
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
      { name: "Dev", state: "Draft", tone: "neutral" },
      { name: "Staging", state: "Not run", tone: "neutral" },
      { name: "Prod", state: "Not deployed", tone: "neutral" },
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
      { name: "Dev", state: "Stable", tone: "success" },
      { name: "Staging", state: "Passed", tone: "success" },
      { name: "Prod", state: "Live", tone: "success" },
    ],
    lastUpdated: "Apr 25",
    updatedRank: 8,
    owner: "Daniel Choi",
    assigned: false,
  },
];

const riskOrder: Record<WorkspaceAgentStatus, number> = {
  "At Risk": 0,
  Attention: 1,
  "In Progress": 2,
  Draft: 3,
  Stable: 4,
};

function roleCopy(role: AppState["role"]) {
  if (role === "Workspace Admin") {
    return {
      settingsLabel: "Workspace Settings",
      primaryLabel: "New Agent",
      primaryDisabled: false,
      context: "Can add agents, manage workspace settings, and run staging tests.",
      tableAction: (agent: WorkspaceAgent) => (agent.status === "Stable" ? "Run Test" : "Open Agent"),
    };
  }

  if (role === "Org Admin") {
    return {
      settingsLabel: "Workspace Settings",
      primaryLabel: "Review Governance",
      primaryDisabled: false,
      context: "Viewing workspace health with governance and production-risk permissions.",
      tableAction: (agent: WorkspaceAgent) => (agent.status === "At Risk" ? "Review Risk" : "View Agent"),
    };
  }

  return {
    settingsLabel: "View Settings",
    primaryLabel: "New Agent",
    primaryDisabled: true,
    context: "Can open assigned agents and evaluate changes. New agent creation requires workspace admin access.",
    tableAction: (agent: WorkspaceAgent) => (agent.assigned ? "Open Agent" : "View Only"),
  };
}

function environmentTone(tone: WorkspaceAgent["environments"][number]["tone"]) {
  if (tone === "success") return "border-emerald-200 bg-emerald-50 text-success";
  if (tone === "warning") return "border-amber-200 bg-amber-50 text-warning";
  if (tone === "danger") return "border-red-200 bg-red-50 text-danger";
  return "border-stone-200 bg-stone-50 text-stone-700";
}

export function WorkspaceDetail({ app }: PageProps) {
  const [activeTab, setActiveTab] = useState<TabName>("Agents");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("All Status");
  const [environmentFilter, setEnvironmentFilter] = useState<FilterEnvironment>("All Environments");
  const [sortMode, setSortMode] = useState<SortMode>("Risk first");
  const permissions = roleCopy(app.role);

  const filteredAgents = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return naverPayAgents
      .filter((agent) => {
        const matchesQuery =
          normalizedQuery.length === 0 ||
          agent.name.toLowerCase().includes(normalizedQuery) ||
          agent.owner.toLowerCase().includes(normalizedQuery);
        const matchesStatus = statusFilter === "All Status" || agent.status === statusFilter;
        const matchesEnvironment =
          environmentFilter === "All Environments" ||
          agent.environments.some((environment) => environment.name === environmentFilter);

        return matchesQuery && matchesStatus && matchesEnvironment;
      })
      .sort((a, b) => {
        if (sortMode === "Recently updated") return a.updatedRank - b.updatedRank;
        if (sortMode === "Agent A-Z") return a.name.localeCompare(b.name);
        return riskOrder[a.status] - riskOrder[b.status] || a.updatedRank - b.updatedRank;
      });
  }, [environmentFilter, query, sortMode, statusFilter]);

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-5">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-accent">Workspace</div>
          <div className="mt-1 flex items-baseline gap-3">
            <h1 className="text-2xl font-semibold text-ink">Naver Pay Operations</h1>
            <span className="text-sm text-muted">8 agents</span>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <Badge tone="danger">3 At Risk</Badge>
            <Badge tone="warning">2 Attention</Badge>
            <Badge tone="success">3 Stable</Badge>
          </div>
          <p className="mt-2 text-sm text-muted">{permissions.context}</p>
        </div>

        <div className="flex items-center gap-2">
          <ActionButton variant="secondary">
            <Settings size={16} />
            {permissions.settingsLabel}
          </ActionButton>
          <ActionButton
            variant="primary"
            disabled={permissions.primaryDisabled}
            title={permissions.primaryDisabled ? "Workspace Admin permission required to create a new agent." : undefined}
          >
            {app.role === "Org Admin" ? <ShieldCheck size={16} /> : <Plus size={16} />}
            {permissions.primaryLabel}
          </ActionButton>
        </div>
      </div>

      <Card className="overflow-hidden">
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

        <div className="border-b border-line bg-stone-50/60 px-3 py-3">
          <div className="grid grid-cols-[1fr_170px_190px_170px] gap-3">
            <label className="flex h-9 items-center gap-2 rounded-md border border-line bg-white px-3 text-muted">
              <Search size={15} />
              <input
                aria-label="Search agents"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search agents..."
                className="min-w-0 flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-muted"
              />
            </label>

            <select
              aria-label="Status filter"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as FilterStatus)}
              className="h-9 rounded-md border border-line bg-white px-2 text-sm text-ink outline-none focus:border-accent"
            >
              {statusFilters.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>

            <select
              aria-label="Environment filter"
              value={environmentFilter}
              onChange={(event) => setEnvironmentFilter(event.target.value as FilterEnvironment)}
              className="h-9 rounded-md border border-line bg-white px-2 text-sm text-ink outline-none focus:border-accent"
            >
              {environmentFilters.map((environment) => (
                <option key={environment} value={environment}>
                  {environment}
                </option>
              ))}
            </select>

            <select
              aria-label="Sort agents"
              value={sortMode}
              onChange={(event) => setSortMode(event.target.value as SortMode)}
              className="h-9 rounded-md border border-line bg-white px-2 text-sm text-ink outline-none focus:border-accent"
            >
              {sortOptions.map((sort) => (
                <option key={sort} value={sort}>
                  Sort: {sort}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="p-3">
          <DataTable<WorkspaceAgent>
            rows={filteredAgents}
            getRowKey={(agent) => agent.id}
            columns={[
              {
                key: "agent",
                header: "Agent",
                render: (agent) => (
                  <div>
                    <div className="font-semibold text-ink">{agent.name}</div>
                    <div className="text-xs text-muted">Naver Pay Operations</div>
                  </div>
                ),
              },
              { key: "status", header: "Status", render: (agent) => <StatusChip status={agent.status} /> },
              {
                key: "env",
                header: "Environments",
                render: (agent) => (
                  <div className="flex flex-wrap gap-1.5">
                    {agent.environments.map((environment) => (
                      <span
                        key={environment.name}
                        className={`rounded-md border px-1.5 py-0.5 text-[11px] font-medium ${environmentTone(environment.tone)}`}
                      >
                        {environment.name} {environment.state}
                      </span>
                    ))}
                  </div>
                ),
              },
              { key: "updated", header: "Last Updated", render: (agent) => agent.lastUpdated },
              { key: "owner", header: "Owner", render: (agent) => agent.owner },
              {
                key: "action",
                header: "Action / overflow",
                render: (agent) => {
                  const operatorLocked = app.role === "Agent Builder / Operator" && !agent.assigned;

                  return (
                    <div className="flex items-center gap-2">
                      <ActionButton
                        variant={operatorLocked ? "quiet" : "secondary"}
                        className="h-7 px-2 text-xs"
                        disabled={operatorLocked}
                        title={operatorLocked ? "Only assigned agents can be opened by this role." : undefined}
                      >
                        {operatorLocked ? "View Only" : permissions.tableAction(agent)}
                      </ActionButton>
                      <button
                        aria-label={`More actions for ${agent.name}`}
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
              No agents match the current workspace filters.
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
