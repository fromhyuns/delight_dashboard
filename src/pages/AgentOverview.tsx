import {
  ChevronRight,
  Code2,
  CreditCard,
  Layers,
  LayoutGrid,
  MoreHorizontal,
  RefreshCw,
  Rocket,
  TestTube2,
  TriangleAlert,
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

type ActivityRow = {
  id: string;
  icon: ReactNode;
  event: string;
  envTag: string;
  owner: string;
  ownerInitials: string;
  ownerColor: string;
  time: string;
};

const activityRows: ActivityRow[] = [
  {
    id: "act-1",
    icon: <RefreshCw size={15} className="text-sky-500" />,
    event: "Prompt Template Updated",
    envTag: "STAGING",
    owner: "Sarah J.",
    ownerInitials: "SJ",
    ownerColor: "bg-teal-500",
    time: "12m ago",
  },
  {
    id: "act-2",
    icon: <TriangleAlert size={15} className="text-amber-500" />,
    event: "Production Release v2.4.1",
    envTag: "PROD",
    owner: "Mike R.",
    ownerInitials: "MR",
    ownerColor: "bg-orange-500",
    time: "2h ago",
  },
  {
    id: "act-3",
    icon: <LayoutGrid size={15} className="text-sky-500" />,
    event: "Dev Sandbox Reset",
    envTag: "DEV",
    owner: "Alex K.",
    ownerInitials: "AK",
    ownerColor: "bg-blue-500",
    time: "5h ago",
  },
];

function roleActions(role: AppState["role"]) {
  if (role === "Workspace Admin") {
    return { primary: "Review Failed Tests", secondary: "View Details" };
  }
  if (role === "Org Admin") {
    return { primary: "Review Production Risk", secondary: "View Details" };
  }
  return { primary: "Review Test", secondary: "Continue Build" };
}

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
  status,
  metric,
  variant,
  cardClass,
}: {
  icon: ReactNode;
  name: string;
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
            <div className="text-[10px] font-semibold uppercase tracking-wider text-muted">Environment</div>
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

export function AgentOverview({ app }: PageProps) {
  const actions = roleActions(app.role);
  const [pipelineKey, setPipelineKey] = useState(app.agent.id);

  useEffect(() => {
    setPipelineKey(app.agent.id);
  }, [app.agent.id]);

  return (
    <div className="space-y-4">
      {/* ── Primary: Agent Decision Surface ──────────────────────────── */}
      <Card className="overflow-hidden p-0">
        {/* Agent header */}
        <div className="flex items-start justify-between gap-5 p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-line bg-stone-50 text-accent">
              <CreditCard size={21} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-semibold text-ink">Payment Issue Resolver</h1>
                <span className="rounded-full border border-warning/40 bg-warning/10 px-2.5 py-0.5 text-xs font-medium text-warning">
                  Needs attention
                </span>
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted">
                <span>My agent</span>
                <span>Owner: Sora Kim</span>
                <span>Last edited: 31 min ago</span>
              </div>
              <p className="mt-2 max-w-3xl text-sm text-muted">
                Resolves payment failures, missing order cases, and refund handoff decisions across Development,
                Staging, and Production.
              </p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <ActionButton variant="secondary">
              <Wrench size={16} />
              Open Build
            </ActionButton>
            <ActionButton variant="primary">
              <TestTube2 size={16} />
              Run Test
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
              status="Stable"
              metric="Success Rate 98.4%"
              variant="dev"
              cardClass="env-card-1"
            />
            <span className="env-arrow-1 shrink-0">
              <ChevronRight size={14} />
            </span>
            <EnvCard
              icon={<Layers size={16} />}
              name="Staging"
              status="Attention"
              metric="2 failed cases"
              variant="staging"
              cardClass="env-card-2"
            />
            <span className="env-arrow-2 shrink-0">
              <ChevronRight size={14} />
            </span>
            <EnvCard
              icon={<Rocket size={16} />}
              name="Production"
              status="At Risk"
              metric="Error rate 3.2%"
              variant="prod"
              cardClass="env-card-3"
            />
          </div>
        </div>

        {/* Issue + recommended action */}
        <div className="flex items-start justify-between gap-8 border-t border-line px-5 py-4">
          <div className="min-w-0 flex-1">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-muted">Issue</div>
            <div className="mt-1 text-sm font-semibold text-ink">Missing order after payment</div>
            <p className="mt-1 text-xs leading-5 text-muted">
              Not consistently matching payment confirmations to newly created order IDs. Isolated to 2 staging cases and one production risk signal.
            </p>
          </div>
          <div className="shrink-0 text-right">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-muted">Recommended Action</div>
            <div className="mt-2 flex gap-2">
              <ActionButton variant="primary">{actions.primary}</ActionButton>
              <ActionButton variant="secondary">{actions.secondary}</ActionButton>
            </div>
          </div>
        </div>
      </Card>

      {/* ── Secondary: Metrics ───────────────────────────────────────── */}
      <div className="grid grid-cols-4 gap-3">
        <MetricCard label="Conversations" value="18,420" detail="Production · last 7 days" />
        <MetricCard label="Success rate" value="94.8%" detail="Down 1.6 pts from baseline" />
        <MetricCard label="Resolution time" value="1m 42s" detail="Median completed case" />
        <MetricCard label="Escalation rate" value="7.4%" detail="Up 0.9 pts this week" />
      </div>

      {/* ── Secondary: Activity ──────────────────────────────────────── */}
      <Card className="p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-ink">Recent Alerts & Activity</h2>
          <div className="flex gap-2">
            <ActionButton variant="secondary" className="h-7 px-3 text-xs">Filter</ActionButton>
            <ActionButton variant="secondary" className="h-7 px-3 text-xs">Export</ActionButton>
          </div>
        </div>

        <table className="w-full">
          <thead>
            <tr className="border-b border-line">
              {["Event", "Environment", "Owner", "Time", "Status"].map((col) => (
                <th
                  key={col}
                  className="pb-2 text-left text-[10px] font-semibold uppercase tracking-wider text-muted"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {activityRows.map((row) => (
              <tr key={row.id} className="hover:bg-stone-50/50">
                <td className="py-3 pr-4">
                  <div className="flex items-center gap-2">
                    <span className="shrink-0">{row.icon}</span>
                    <span className="text-sm font-medium text-ink">{row.event}</span>
                  </div>
                </td>
                <td className="py-3 pr-4">
                  <span className="rounded border border-line bg-stone-100 px-1.5 py-0.5 text-[10px] font-bold tracking-wide text-muted">
                    {row.envTag}
                  </span>
                </td>
                <td className="py-3 pr-4">
                  <div className="flex items-center gap-2">
                    <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white ${row.ownerColor}`}>
                      {row.ownerInitials}
                    </span>
                    <span className="text-sm text-ink">{row.owner}</span>
                  </div>
                </td>
                <td className="py-3 pr-4 text-sm text-muted">{row.time}</td>
                <td className="py-3">
                  <span className="text-sm font-medium text-success">Success</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-4 border-t border-line pt-3 text-center">
          <button className="text-sm font-medium text-accent hover:underline">View All Activity</button>
        </div>
      </Card>
    </div>
  );
}
