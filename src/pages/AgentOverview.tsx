import { CreditCard, MoreHorizontal, PlayCircle, ShieldCheck, TestTube2, Wrench } from "lucide-react";
import type { AppState } from "../App";
import { ActionButton } from "../components/ui/ActionButton";
import { Card } from "../components/ui/Card";
import { DataTable } from "../components/ui/DataTable";
import { MetricCard } from "../components/ui/MetricCard";
import { StatusChip } from "../components/ui/StatusChip";

type PageProps = {
  app: AppState;
};

type ActivityRow = {
  id: string;
  event: string;
  environment: string;
  owner: string;
  time: string;
  status: string;
};

const environmentCards = [
  {
    name: "Development",
    status: "Healthy",
    signal: "Updated",
    detail: "Success rate 98.4%",
    border: "border-l-success",
  },
  {
    name: "Staging",
    status: "Attention",
    signal: "Failed",
    detail: "2 failed cases",
    border: "border-l-warning",
  },
  {
    name: "Production",
    status: "At Risk",
    signal: "Error rate 3.2% ↑",
    detail: "Elevated payment lookup failures",
    border: "border-l-danger",
  },
];

const activityRows: ActivityRow[] = [
  {
    id: "act-1",
    event: "Staging test failed for missing order lookup",
    environment: "Staging",
    owner: "Sora Kim",
    time: "12 min ago",
    status: "Attention",
  },
  {
    id: "act-2",
    event: "Development instructions updated",
    environment: "Development",
    owner: "Sora Kim",
    time: "31 min ago",
    status: "Healthy",
  },
  {
    id: "act-3",
    event: "Production error-rate threshold exceeded",
    environment: "Production",
    owner: "Ops Monitor",
    time: "48 min ago",
    status: "At Risk",
  },
  {
    id: "act-4",
    event: "Refund handoff policy check passed",
    environment: "Staging",
    owner: "Daniel Choi",
    time: "2 hrs ago",
    status: "Stable",
  },
];

function roleActions(role: AppState["role"]) {
  if (role === "Workspace Admin") {
    return {
      issueLink: "Open Test",
      title: "Review Failed Tests",
      description: "Compare the two failed staging cases, rerun the readiness suite, then request approval when the fix is confirmed.",
      primary: "Review Failed Tests",
      secondary: "Request Approval",
      secondaryDisabled: false,
    };
  }

  if (role === "Org Admin") {
    return {
      issueLink: "Open Evaluate",
      title: "Review Production Risk",
      description: "Inspect the production risk signal, confirm governance boundaries, then approve mitigation or roll back if needed.",
      primary: "Review Production Risk",
      secondary: "Approve or Rollback",
      secondaryDisabled: false,
    };
  }

  return {
    issueLink: "Open Evaluate",
    title: "Review Test",
    description: "Start with the failed staging cases, then continue build changes before requesting production review.",
    primary: "Review Test",
    secondary: "Continue Build",
    secondaryDisabled: false,
  };
}

export function AgentOverview({ app }: PageProps) {
  const actions = roleActions(app.role);
  const isOperator = app.role === "Agent Builder / Operator";

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex items-start justify-between gap-5">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-line bg-stone-50 text-accent">
              <CreditCard size={21} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-semibold text-ink">Payment Issue Resolver</h1>
                <StatusChip status="Needs attention" />
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

          <div className="flex items-center gap-2">
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
      </Card>

      <div className="grid grid-cols-3 gap-3">
        {environmentCards.map((environment) => (
          <Card key={environment.name} className={`border-l-4 p-3 ${environment.border}`}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-xs font-medium uppercase tracking-wide text-muted">{environment.name}</div>
                <div className="mt-2 text-lg font-semibold text-ink">{environment.signal}</div>
                <div className="mt-1 text-xs text-muted">{environment.detail}</div>
              </div>
              <StatusChip status={environment.status} />
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-[1.1fr_0.9fr] gap-4">
        <Card className="p-4">
          <div className="flex items-start justify-between gap-5">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-accent">Top affected capability</div>
              <h2 className="mt-1 text-lg font-semibold text-ink">Missing order after payment</h2>
              <p className="mt-2 text-sm leading-6 text-muted">
                The agent is not consistently matching successful payment confirmations to newly created order IDs.
                The issue is isolated to two staging cases and one production risk signal.
              </p>
            </div>
            <ActionButton variant="secondary" className="shrink-0">
              <PlayCircle size={16} />
              {actions.issueLink}
            </ActionButton>
          </div>
        </Card>

        <Card className="p-4">
          <div className="text-xs font-semibold uppercase tracking-wide text-accent">Next recommended action</div>
          <h2 className="mt-1 text-lg font-semibold text-ink">{actions.title}</h2>
          <p className="mt-2 text-sm leading-6 text-muted">{actions.description}</p>
          <div className="mt-4 flex items-center gap-2">
            <ActionButton variant="primary">{actions.primary}</ActionButton>
            <ActionButton
              variant="secondary"
              disabled={isOperator && actions.secondary === "Request Approval"}
              title={isOperator ? "Production approval requires workspace admin access." : undefined}
            >
              {app.role === "Org Admin" && <ShieldCheck size={16} />}
              {actions.secondary}
            </ActionButton>
          </div>
          {isOperator && (
            <div className="mt-3 text-xs text-muted">Production changes are limited for this role.</div>
          )}
        </Card>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <MetricCard label="Conversations" value="18,420" detail="Production · last 7 days" />
        <MetricCard label="Success rate" value="94.8%" detail="Down 1.6 pts from baseline" />
        <MetricCard label="Resolution time" value="1m 42s" detail="Median completed case" />
        <MetricCard label="Escalation rate" value="7.4%" detail="Up 0.9 pts this week" />
      </div>

      <Card className="p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold text-ink">Recent Alerts & Activity</h2>
          <span className="text-xs text-muted">Payment Issue Resolver</span>
        </div>
        <DataTable<ActivityRow>
          rows={activityRows}
          getRowKey={(row) => row.id}
          columns={[
            { key: "event", header: "Event", render: (row) => <div className="font-medium">{row.event}</div> },
            { key: "environment", header: "Environment", render: (row) => row.environment },
            { key: "owner", header: "Owner", render: (row) => row.owner },
            { key: "time", header: "Time", render: (row) => row.time },
            { key: "status", header: "Status", render: (row) => <StatusChip status={row.status} /> },
          ]}
        />
      </Card>
    </div>
  );
}
