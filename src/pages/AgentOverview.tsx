import {
  Bot,
  ChevronRight,
  Code2,
  Filter,
  LayoutGrid,
  Layers,
  List,
  MoreHorizontal,
  Plus,
  Rocket,
  Wrench,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import type { AppState } from "../App";
import { ActionButton } from "../components/ui/ActionButton";
import { Card } from "../components/ui/Card";
import { MetricCard } from "../components/ui/MetricCard";

type PageProps = {
  app: AppState;
};

type EnvStatus = "Stable" | "Attention" | "At Risk";

type Issue = { id: string; title: string; description: string };

type TaskStatus = "Resolved" | "Escalated" | "Failed";

type TaskRow = {
  id: string;
  task: string;
  status: TaskStatus;
  envTag: string;
  time: string;
};

type MetricData = {
  value: string;
  trend: { delta: string; positive: boolean };
  detail?: string;
};

type AgentPageData = {
  pipeline: {
    dev:     { label: string; status: EnvStatus; metric: string };
    staging: { label: string; status: EnvStatus; metric: string };
    prod:    { label: string; status: EnvStatus; metric: string };
  };
  issues: Issue[];
  conversations: MetricData;
  successRate:   MetricData;
  resolutionTime: MetricData;
  escalationRate: MetricData;
  tasks: TaskRow[];
};

const agentPageData: Record<string, AgentPageData> = {
  "refund-review": {
    pipeline: {
      dev:     { label: "v2.5.0-dev",        status: "Stable",    metric: "Success Rate 98.4%" },
      staging: { label: "v2.5.0 · candidate", status: "Attention", metric: "2 failed cases"     },
      prod:    { label: "v2.4.1 · live",      status: "At Risk",   metric: "Error rate 3.2%"    },
    },
    issues: [
      { id: "i-1", title: "Missing order after payment",    description: "Not consistently matching payment confirmations to newly created order IDs. Isolated to 2 staging cases and one production risk signal." },
      { id: "i-2", title: "Refund routing edge case",       description: "Agent fails to route partial refunds exceeding 30-day threshold to the manual review queue. Affects 3 production conversations this week." },
      { id: "i-3", title: "Duplicate confirmation response", description: "Payment confirmation message sent twice when webhook retries occur within 5 seconds. Low frequency but causes customer confusion." },
    ],
    conversations:  { value: "18,420", trend: { delta: "+8.1% vs last week",        positive: true  }, detail: "Production · last 7 days" },
    successRate:    { value: "94.8%",  trend: { delta: "−1.6 pts · short of goal",  positive: false } },
    resolutionTime: { value: "1m 42s", trend: { delta: "+4s · still on track",      positive: false } },
    escalationRate: { value: "7.4%",   trend: { delta: "+0.9 pts · above threshold", positive: false } },
    tasks: [
      { id: "t-1", task: "Missing order after payment",  status: "Resolved",  envTag: "PROD",    time: "12m ago" },
      { id: "t-2", task: "Duplicate payment reported",   status: "Escalated", envTag: "PROD",    time: "34m ago" },
      { id: "t-3", task: "Refund eligibility check",     status: "Resolved",  envTag: "PROD",    time: "1h ago"  },
      { id: "t-4", task: "Card verification retry",      status: "Failed",    envTag: "STAGING", time: "2h ago"  },
      { id: "t-5", task: "Partial refund over 30 days",  status: "Escalated", envTag: "PROD",    time: "3h ago"  },
    ],
  },

  "refund-assistant": {
    pipeline: {
      dev:     { label: "v1.8.2-dev",        status: "Stable", metric: "Success Rate 99.2%" },
      staging: { label: "v1.8.2 · candidate", status: "Stable", metric: "All tests passed"  },
      prod:    { label: "v1.8.1 · live",      status: "Stable", metric: "Success Rate 99.1%" },
    },
    issues: [
      { id: "i-1", title: "Partial refund amount display", description: "Edge case where partial refund amounts over ₩500,000 display incorrectly in the confirmation message. Occurs in less than 0.1% of cases." },
    ],
    conversations:  { value: "5,210",  trend: { delta: "+3.4% vs last week",      positive: true  }, detail: "Production · last 7 days" },
    successRate:    { value: "99.1%",  trend: { delta: "+0.2 pts · above goal",   positive: true  } },
    resolutionTime: { value: "0m 58s", trend: { delta: "−6s · improving",         positive: true  } },
    escalationRate: { value: "2.1%",   trend: { delta: "−0.3 pts · within range", positive: true  } },
    tasks: [
      { id: "t-1", task: "Refund status inquiry",          status: "Resolved",  envTag: "PROD", time: "8m ago"  },
      { id: "t-2", task: "Partial refund confirmation",    status: "Resolved",  envTag: "PROD", time: "22m ago" },
      { id: "t-3", task: "Refund delay report",            status: "Escalated", envTag: "PROD", time: "51m ago" },
      { id: "t-4", task: "Duplicate refund request",       status: "Resolved",  envTag: "PROD", time: "1h ago"  },
      { id: "t-5", task: "Refund eligibility question",    status: "Resolved",  envTag: "PROD", time: "2h ago"  },
    ],
  },

  "transaction-failure": {
    pipeline: {
      dev:     { label: "v3.1.0-dev",       status: "Attention", metric: "2 edge cases flagged"  },
      staging: { label: "v3.0.4 · staging", status: "Attention", metric: "Test run required"     },
      prod:    { label: "v3.0.3 · live",    status: "Stable",    metric: "Success Rate 91.2%"    },
    },
    issues: [
      { id: "i-1", title: "Ambiguous failure classification", description: "Agent misclassifies ~4% of transaction failures as 'unknown' when the root cause is a bank-side timeout. Routing accuracy impacted." },
      { id: "i-2", title: "Routing delay over 30s",           description: "Cases requiring manual routing take over 30 seconds to queue in high-traffic periods. SLA breach risk during peak hours." },
    ],
    conversations:  { value: "3,840",  trend: { delta: "+1.8% vs last week",        positive: true  }, detail: "Production · last 7 days" },
    successRate:    { value: "91.2%",  trend: { delta: "−2.1 pts · below target",   positive: false } },
    resolutionTime: { value: "2m 15s", trend: { delta: "+18s · above threshold",    positive: false } },
    escalationRate: { value: "9.8%",   trend: { delta: "+1.4 pts · above threshold", positive: false } },
    tasks: [
      { id: "t-1", task: "PG timeout classification",      status: "Resolved",  envTag: "PROD",    time: "19m ago" },
      { id: "t-2", task: "Card decline — bank error",      status: "Failed",    envTag: "PROD",    time: "42m ago" },
      { id: "t-3", task: "Ambiguous network failure",      status: "Escalated", envTag: "PROD",    time: "1h ago"  },
      { id: "t-4", task: "Routing delay — peak traffic",   status: "Escalated", envTag: "STAGING", time: "2h ago"  },
      { id: "t-5", task: "Duplicate charge detection",     status: "Resolved",  envTag: "PROD",    time: "3h ago"  },
    ],
  },

  "catalog-monitor": {
    pipeline: {
      dev:     { label: "v0.9.1-dev",      status: "Attention", metric: "Draft changes pending" },
      staging: { label: "v0.9.0 · staging", status: "At Risk",   metric: "3 failed cases"       },
      prod:    { label: "v0.8.7 · live",    status: "At Risk",   metric: "Error rate 4.1%"       },
    },
    issues: [
      { id: "i-1", title: "Catalog sync lag",            description: "Listing anomalies detected in the data pipeline arrive with up to 8-minute delay. Risk of surfacing stale pricing to customers." },
      { id: "i-2", title: "Price anomaly threshold miss", description: "Agent fails to flag price drops below 40% when the base price was updated within the same session. 7 cases missed this week." },
      { id: "i-3", title: "Duplicate listing alert",     description: "Same listing flagged multiple times when a seller makes rapid sequential edits. Causing noise in the review queue." },
    ],
    conversations:  { value: "8,120",  trend: { delta: "+5.2% vs last week",         positive: true  }, detail: "Production · last 7 days" },
    successRate:    { value: "88.3%",  trend: { delta: "−3.2 pts · well below goal",  positive: false } },
    resolutionTime: { value: "3m 02s", trend: { delta: "+31s · degrading",            positive: false } },
    escalationRate: { value: "12.4%",  trend: { delta: "+2.8 pts · above threshold",  positive: false } },
    tasks: [
      { id: "t-1", task: "Price anomaly — flash sale",   status: "Failed",    envTag: "PROD",    time: "15m ago" },
      { id: "t-2", task: "Duplicate listing detected",   status: "Escalated", envTag: "PROD",    time: "38m ago" },
      { id: "t-3", task: "Catalog sync validation",      status: "Resolved",  envTag: "PROD",    time: "1h ago"  },
      { id: "t-4", task: "Out-of-stock flag check",      status: "Failed",    envTag: "STAGING", time: "2h ago"  },
      { id: "t-5", task: "Stale pricing alert",          status: "Escalated", envTag: "PROD",    time: "3h ago"  },
    ],
  },

  "query-intent": {
    pipeline: {
      dev:     { label: "v0.3.0-dev", status: "Stable", metric: "In development"  },
      staging: { label: "—",          status: "Stable", metric: "Not yet run"      },
      prod:    { label: "—",          status: "Stable", metric: "Not deployed"     },
    },
    issues: [
      { id: "i-1", title: "Intent classification accuracy", description: "Current model accuracy in dev is 81.4%, below the 90% threshold required before staging. Booking change vs. cancellation intent is frequently confused." },
    ],
    conversations:  { value: "—",     trend: { delta: "No production data yet",  positive: true  }, detail: "Not deployed" },
    successRate:    { value: "81.4%", trend: { delta: "Dev testing only",        positive: false } },
    resolutionTime: { value: "—",     trend: { delta: "No production data yet",  positive: true  } },
    escalationRate: { value: "—",     trend: { delta: "No production data yet",  positive: true  } },
    tasks: [
      { id: "t-1", task: "Booking change intent test",     status: "Resolved",  envTag: "DEV", time: "2h ago"  },
      { id: "t-2", task: "Cancellation vs. change",        status: "Failed",    envTag: "DEV", time: "3h ago"  },
      { id: "t-3", task: "Date modification request",      status: "Resolved",  envTag: "DEV", time: "4h ago"  },
      { id: "t-4", task: "Guest count update",             status: "Resolved",  envTag: "DEV", time: "5h ago"  },
      { id: "t-5", task: "Ambiguous request classification", status: "Failed",  envTag: "DEV", time: "6h ago"  },
    ],
  },

  "ticket-routing": {
    pipeline: {
      dev:     { label: "v5.2.1-dev",        status: "Attention", metric: "Update in review"  },
      staging: { label: "v5.2.0 · candidate", status: "Stable",    metric: "All tests passed" },
      prod:    { label: "v5.1.8 · paused",    status: "At Risk",   metric: "Agent paused"     },
    },
    issues: [
      { id: "i-1", title: "Access review required",      description: "Security team flagged 2 permission scopes that require re-approval before the agent can resume. Review SLA is 48 hours." },
      { id: "i-2", title: "Routing policy conflict",     description: "Agent's routing rules conflict with updated tier-2 SLA policy rolled out on Apr 28. Manual override needed until agent is updated." },
      { id: "i-3", title: "Escalation queue backlog",    description: "Pausing the agent caused 34 tickets to remain unrouted. Manual triage is ongoing; estimated 4-hour resolution." },
    ],
    conversations:  { value: "2,180",  trend: { delta: "−18.4% · agent paused",     positive: false }, detail: "Last active period" },
    successRate:    { value: "89.4%",  trend: { delta: "−1.1 pts before pause",      positive: false } },
    resolutionTime: { value: "3m 28s", trend: { delta: "+44s · queue backlog impact", positive: false } },
    escalationRate: { value: "15.2%",  trend: { delta: "+5.8 pts · backlog effect",  positive: false } },
    tasks: [
      { id: "t-1", task: "Tier-1 routing — billing",     status: "Escalated", envTag: "PROD", time: "1h ago"  },
      { id: "t-2", task: "VIP ticket misroute",          status: "Failed",    envTag: "PROD", time: "2h ago"  },
      { id: "t-3", task: "SLA breach — unrouted ticket", status: "Escalated", envTag: "PROD", time: "3h ago"  },
      { id: "t-4", task: "Standard routing — refund",    status: "Resolved",  envTag: "PROD", time: "4h ago"  },
      { id: "t-5", task: "Policy conflict — escalation", status: "Failed",    envTag: "PROD", time: "5h ago"  },
    ],
  },
};

const taskStatusStyle: Record<TaskStatus, { label: string; className: string }> = {
  Resolved:  { label: "Resolved",  className: "text-success" },
  Escalated: { label: "Escalated", className: "text-warning" },
  Failed:    { label: "Failed",    className: "text-danger"  },
};


function EnvStatusBadge({ status }: { status: EnvStatus }) {
  const map: Record<EnvStatus, { dot: string; text: string; border: string; bg: string; label: string }> = {
    Stable:      { dot: "bg-success",  text: "text-success",  border: "border-success/30",  bg: "bg-success/5",  label: "STABLE"    },
    Attention:   { dot: "bg-warning",  text: "text-warning",  border: "border-warning/30",  bg: "bg-warning/5",  label: "ATTENTION" },
    "At Risk":   { dot: "bg-danger",   text: "text-danger",   border: "border-danger/30",   bg: "bg-danger/5",   label: "AT RISK"   },
  };
  const s = map[status];
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold tracking-wide ${s.text} ${s.border} ${s.bg}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}

type EnvVariant = "dev" | "staging" | "prod";

const envVariantStyles: Record<EnvVariant, { cardBg: string; border: string; iconBg: string; iconText: string; headerBg: string }> = {
  dev:     { cardBg: "bg-white", border: "border-line", iconBg: "bg-stone-50",  iconText: "text-stone-400", headerBg: "bg-stone-50"  },
  staging: { cardBg: "bg-white", border: "border-line", iconBg: "bg-stone-100", iconText: "text-stone-500", headerBg: "bg-stone-50"  },
  prod:    { cardBg: "bg-white", border: "border-line", iconBg: "bg-stone-100", iconText: "text-stone-600", headerBg: "bg-stone-50"  },
};

function EnvCard({
  icon,
  name,
  label,
  status,
  metric,
  variant,
  cardClass,
}: {
  icon: ReactNode;
  name: string;
  label: string;
  status: EnvStatus;
  metric: string;
  variant: EnvVariant;
  cardClass: string;
}) {
  const v = envVariantStyles[variant];
  return (
    <div className={`${cardClass} relative isolate min-w-0 flex-1`}>
      <div className="env-ring absolute -inset-[1.5px] rounded-[9.5px] -z-10" />
      <div className={`env-card-body relative overflow-hidden rounded-lg border ${v.cardBg} ${v.border}`}>
        <div className="flex items-start gap-3.5 p-4">
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-md border ${v.border} ${v.iconBg} ${v.iconText}`}>
            {icon}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-muted">{label}</div>
            <div className="mt-0.5 text-sm font-semibold text-ink">{name}</div>
          </div>
          <EnvStatusBadge status={status} />
        </div>
        <div className={`flex items-center justify-between border-t ${v.border} ${v.headerBg} px-4 py-3`}>
          <span className="text-xs text-muted">{metric}</span>
          <button className="rounded border border-line bg-white px-2.5 py-1 text-xs font-medium text-ink hover:bg-stone-50">
            View detail
          </button>
        </div>
        {/* Shine clipped to this card only — linear speed matches neighbouring cards */}
        <div className="env-shine-wrap absolute inset-0">
          <div className="env-shine-stripe absolute inset-0" />
        </div>
      </div>
    </div>
  );
}

function TaskCard({ row }: { row: TaskRow }) {
  const s = taskStatusStyle[row.status];
  const cardStyle: Record<TaskStatus, string> = {
    Resolved:  "border-success/25 bg-success/[0.03]",
    Escalated: "border-warning/30 bg-warning/[0.03]",
    Failed:    "border-danger/25  bg-danger/[0.03]",
  };
  const dotStyle: Record<TaskStatus, string> = {
    Resolved:  "bg-success",
    Escalated: "bg-amber-400",
    Failed:    "bg-danger",
  };
  return (
    <div className={`flex flex-col rounded-lg border p-4 ${cardStyle[row.status]}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${dotStyle[row.status]}`} />
      <p className="mt-3 flex-1 text-sm font-medium leading-snug text-ink">{row.task}</p>
      <div className="mt-4 flex items-center justify-between gap-2">
        <span className="rounded border border-line bg-white/70 px-1.5 py-0.5 text-[9px] font-bold tracking-wide text-muted">
          {row.envTag}
        </span>
        <span className={`text-xs font-semibold ${s.className}`}>{s.label}</span>
      </div>
      <div className="mt-1 text-[10px] text-muted">{row.time}</div>
    </div>
  );
}

export function AgentOverview({ app }: PageProps) {
  const [pipelineKey, setPipelineKey] = useState(app.agent.id);
  const [issueIndex, setIssueIndex] = useState(0);
  const [taskViewMode, setTaskViewMode] = useState<"grid" | "list">("grid");

  const agentData = agentPageData[app.agent.id] ?? agentPageData["refund-review"];

  useEffect(() => {
    setPipelineKey(app.agent.id);
    setIssueIndex(0);
  }, [app.agent.id]);

  return (
    <div className="space-y-4">
      {/* ── Primary: Agent Decision Surface ──────────────────────────── */}
      <Card className="overflow-hidden p-0">
        {/* Agent header */}
        <div className="flex items-start justify-between gap-5 p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-stone-600 text-white">
              <Bot size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl font-semibold text-ink">{app.agent.name}</h1>
                <span className="rounded-md border border-line bg-stone-100 px-2 py-0.5 text-xs font-medium text-stone-600">
                  #{app.workspace.name.toUpperCase()}
                </span>
              </div>
              <p className="mt-2 max-w-3xl text-sm text-muted">{app.agent.purpose}</p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <ActionButton variant="secondary">
              <Wrench size={15} />
              Edit Agent
            </ActionButton>
            <ActionButton variant="primary">
              <Plus size={15} />
              New Build
            </ActionButton>
            <button
              aria-label="More agent actions"
              className="flex h-9 w-9 items-center justify-center rounded-md border border-line bg-white text-muted hover:bg-stone-50 hover:text-ink"
            >
              <MoreHorizontal size={17} />
            </button>
          </div>
        </div>

        {/* Environment pipeline */}
        <div key={pipelineKey} className="px-5 pb-5">
          <div className="flex items-center gap-2">
            <EnvCard
              icon={<Code2 size={16} />}
              name="Development"
              label={agentData.pipeline.dev.label}
              status={agentData.pipeline.dev.status}
              metric={agentData.pipeline.dev.metric}
              variant="dev"
              cardClass="env-card-1"
            />
            <span className="env-arrow-1 shrink-0">
              <ChevronRight size={14} />
            </span>
            <EnvCard
              icon={<Layers size={16} />}
              name="Staging"
              label={agentData.pipeline.staging.label}
              status={agentData.pipeline.staging.status}
              metric={agentData.pipeline.staging.metric}
              variant="staging"
              cardClass="env-card-2"
            />
            <span className="env-arrow-2 shrink-0">
              <ChevronRight size={14} />
            </span>
            <EnvCard
              icon={<Rocket size={16} />}
              name="Production"
              label={agentData.pipeline.prod.label}
              status={agentData.pipeline.prod.status}
              metric={agentData.pipeline.prod.metric}
              variant="prod"
              cardClass="env-card-3"
            />
          </div>
        </div>

        {/* Issue paginated */}
        <div className="flex items-center gap-6 border-t border-line px-5 py-4">
          <div className="min-w-0 flex-1">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-muted">Issue</div>
            <div className="mt-1 text-sm font-semibold text-ink">{agentData.issues[issueIndex].title}</div>
            <p className="mt-1 text-xs leading-5 text-muted">{agentData.issues[issueIndex].description}</p>
            <div className="mt-2 flex gap-1.5">
              {agentData.issues.map((_: Issue, i: number) => (
                <button
                  key={i}
                  onClick={() => setIssueIndex(i)}
                  className={`rounded-full transition-all duration-200 ${
                    i === issueIndex
                      ? "h-1.5 w-3.5 bg-stone-300"
                      : "h-1.5 w-1.5 bg-stone-200 hover:bg-stone-300"
                  }`}
                />
              ))}
            </div>
          </div>
          <ActionButton variant="secondary" className="shrink-0">View detail</ActionButton>
        </div>
      </Card>

      {/* ── Secondary: Metrics ───────────────────────────────────────── */}
      <div className="grid grid-cols-4 gap-3">
        <MetricCard label="Conversations"   value={agentData.conversations.value}   trend={agentData.conversations.trend}   detail={agentData.conversations.detail} />
        <MetricCard label="Success rate"    value={agentData.successRate.value}     trend={agentData.successRate.trend} />
        <MetricCard label="Resolution time" value={agentData.resolutionTime.value}  trend={agentData.resolutionTime.trend} />
        <MetricCard label="Escalation rate" value={agentData.escalationRate.value}  trend={agentData.escalationRate.trend} />
      </div>

      {/* ── Secondary: Recent Tasks ──────────────────────────────────── */}
      <Card className="p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-[13px] font-bold uppercase tracking-wide text-ink">Recent Tasks</h2>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-muted">{agentData.tasks.length} tasks</span>
            <button className="flex h-8 w-8 items-center justify-center rounded-md border border-line bg-white text-muted hover:bg-stone-50 hover:text-ink">
              <Filter size={13} />
            </button>
            <div className="flex items-center rounded-md border border-line bg-stone-50 p-0.5">
              <button
                onClick={() => setTaskViewMode("grid")}
                title="Thumbnail view"
                className={`flex h-7 w-7 items-center justify-center rounded transition ${
                  taskViewMode === "grid" ? "bg-white shadow-sm text-ink" : "text-muted hover:text-ink"
                }`}
              >
                <LayoutGrid size={13} />
              </button>
              <button
                onClick={() => setTaskViewMode("list")}
                title="List view"
                className={`flex h-7 w-7 items-center justify-center rounded transition ${
                  taskViewMode === "list" ? "bg-white shadow-sm text-ink" : "text-muted hover:text-ink"
                }`}
              >
                <List size={13} />
              </button>
            </div>
          </div>
        </div>

        {taskViewMode === "grid" ? (
          <div className="grid grid-cols-5 gap-3">
            {agentData.tasks.map((row: TaskRow) => (
              <TaskCard key={row.id} row={row} />
            ))}
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-line">
                {["Task", "Environment", "Status", "Time"].map((col) => (
                  <th key={col} className="pb-2 text-left text-[10px] font-semibold uppercase tracking-wider text-muted">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {agentData.tasks.map((row: TaskRow) => {
                const s = taskStatusStyle[row.status];
                return (
                  <tr key={row.id} className="hover:bg-stone-50/50">
                    <td className="py-3 pr-4"><span className="text-sm font-medium text-ink">{row.task}</span></td>
                    <td className="py-3 pr-4">
                      <span className="rounded border border-line bg-stone-100 px-1.5 py-0.5 text-[10px] font-bold tracking-wide text-muted">
                        {row.envTag}
                      </span>
                    </td>
                    <td className="py-3 pr-4"><span className={`text-sm font-medium ${s.className}`}>{s.label}</span></td>
                    <td className="py-3 text-sm text-muted">{row.time}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        <div className="mt-4 border-t border-line pt-3 text-center">
          <button className="text-sm font-medium text-accent hover:underline">View All Tasks</button>
        </div>
      </Card>
    </div>
  );
}
