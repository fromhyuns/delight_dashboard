import { BarChart3, Download, FileText, GitCompareArrows, RotateCcw, Wrench } from "lucide-react";
import type { AppState } from "../App";
import { ActionButton } from "../components/ui/ActionButton";
import { Badge } from "../components/ui/Badge";
import { Card } from "../components/ui/Card";
import { DataTable } from "../components/ui/DataTable";
import { MetricCard } from "../components/ui/MetricCard";
import { StatusChip } from "../components/ui/StatusChip";
import type { EnvironmentStatus } from "../types";

type PageProps = {
  app: AppState;
  environmentStatuses: EnvironmentStatus[];
};

type Metric = {
  label: string;
  value: string;
  detail: string;
};

type TableRow = {
  id: string;
  primary: string;
  secondary: string;
  metric: string;
  status: string;
  action: string;
};

type ViewContent = {
  eyebrow: string;
  title: string;
  description: string;
  primaryCta: string;
  secondaryCta: string;
  tertiaryCta: string;
  overviewTitle: string;
  tableTitle: string;
  sideTitle: string;
  metrics: Metric[];
  rows: TableRow[];
  sideRows: TableRow[];
};

const tabs = ["Overview", "Test Results", "Quality", "Trends", "Comparisons", "Reports"];

const trendBars = [
  { label: "Mon", value: 88 },
  { label: "Tue", value: 91 },
  { label: "Wed", value: 89 },
  { label: "Thu", value: 94 },
  { label: "Fri", value: 92 },
  { label: "Sat", value: 90 },
  { label: "Sun", value: 91 },
];

function contentForRole(role: AppState["role"]): ViewContent {
  if (role === "Org Admin") {
    return {
      eyebrow: "Governance Analytics",
      title: "Evaluate Payment Issue Resolver",
      description: "Organization-level quality, risk, and operational outcomes for the selected production agent.",
      primaryCta: "View full report",
      secondaryCta: "Export",
      tertiaryCta: "Review Governance",
      overviewTitle: "Organization Quality Overview",
      tableTitle: "Quality by Workspace",
      sideTitle: "Alerts Overview",
      metrics: [
        { label: "Average success rate", value: "93.4%", detail: "Naver Pay workspace benchmark" },
        { label: "Average resolution time", value: "1m 48s", detail: "Production median" },
        { label: "Quality by environment", value: "Prod 91.2%", detail: "Staging 95.6% · Dev 98.4%" },
        { label: "Governance alerts", value: "4", detail: "2 require review this week" },
      ],
      rows: [
        { id: "org-1", primary: "Naver Pay Operations", secondary: "8 agents", metric: "91.2% success", status: "Attention", action: "Review Governance" },
        { id: "org-2", primary: "Shopping Support", secondary: "6 agents", metric: "94.8% success", status: "Stable", action: "View full report" },
        { id: "org-3", primary: "Reservation CX", secondary: "5 agents", metric: "96.1% success", status: "Stable", action: "View full report" },
        { id: "org-4", primary: "Global Customer Care", secondary: "7 agents", metric: "90.7% success", status: "Attention", action: "Review Governance" },
      ],
      sideRows: [
        { id: "oa-1", primary: "Payment Issue Resolver", secondary: "Production risk", metric: "3.2% error rate", status: "At Risk", action: "Review Governance" },
        { id: "oa-2", primary: "Ticket Routing Agent", secondary: "Escalation drift", metric: "7 open alerts", status: "Attention", action: "View full report" },
        { id: "oa-3", primary: "Refund Assistant", secondary: "Benchmark leader", metric: "96.8% success", status: "Stable", action: "Export" },
      ],
    };
  }

  if (role === "Workspace Admin") {
    return {
      eyebrow: "Quality Analytics",
      title: "Evaluate Payment Issue Resolver",
      description: "Test outcomes, quality score, and failing cases for improving this agent before promotion.",
      primaryCta: "View Test Results",
      secondaryCta: "Open Build",
      tertiaryCta: "Re-run Test",
      overviewTitle: "Quality Overview",
      tableTitle: "Top Failing Test Cases",
      sideTitle: "Recent Test Runs",
      metrics: [
        { label: "Quality score", value: "88%", detail: "Latest production-weighted bundle" },
        { label: "Test pass rate", value: "91.6%", detail: "2 failed staging cases" },
        { label: "Regression risk", value: "Medium", detail: "Payment lookup affected" },
        { label: "Coverage", value: "2,560", detail: "Representative traces" },
      ],
      rows: [
        { id: "br-1", primary: "Missing order after payment", secondary: "Payment lookup", metric: "2 failures", status: "Failed", action: "View Test Results" },
        { id: "br-2", primary: "Duplicate payment handoff", secondary: "Escalation", metric: "1 warning", status: "Attention", action: "Re-run Test" },
        { id: "br-3", primary: "Refund eligibility summary", secondary: "Refund Process", metric: "Passed", status: "Stable", action: "Open Build" },
        { id: "br-4", primary: "Card verification retry", secondary: "Payment Method Update", metric: "Passed", status: "Stable", action: "Open Build" },
      ],
      sideRows: [
        { id: "bt-1", primary: "Staging readiness run", secondary: "12 min ago", metric: "91.6%", status: "Attention", action: "View Test Results" },
        { id: "bt-2", primary: "Development smoke test", secondary: "31 min ago", metric: "98.4%", status: "Stable", action: "Re-run Test" },
        { id: "bt-3", primary: "Payment policy suite", secondary: "2 hrs ago", metric: "96.0%", status: "Stable", action: "View Test Results" },
      ],
    };
  }

  return {
    eyebrow: "Operational Monitoring",
    title: "Evaluate Payment Issue Resolver",
    description: "Production performance, recent issues, and conversation outcomes for day-to-day monitoring.",
    primaryCta: "View Conversation",
    secondaryCta: "Open Build",
    tertiaryCta: "Review Alert",
    overviewTitle: "Performance Overview",
    tableTitle: "Top Issues",
    sideTitle: "Recent Conversations",
    metrics: [
      { label: "Conversations", value: "18,420", detail: "Production · last 7 days" },
      { label: "Success rate", value: "91.2%", detail: "Down 1.8 pts from baseline" },
      { label: "Resolution time", value: "1m 42s", detail: "Median completed case" },
      { label: "Escalation rate", value: "7.4%", detail: "Up 0.9 pts this week" },
    ],
    rows: [
      { id: "op-1", primary: "Missing order after payment", secondary: "Payment lookup", metric: "1,240 conversations", status: "At Risk", action: "Review Alert" },
      { id: "op-2", primary: "Payment status mismatch", secondary: "Status check", metric: "428 conversations", status: "Attention", action: "Open Build" },
      { id: "op-3", primary: "Refund handoff unclear", secondary: "Refund Process", metric: "201 conversations", status: "Stable", action: "View Conversation" },
      { id: "op-4", primary: "Card verification retry", secondary: "Payment Method Update", metric: "144 conversations", status: "Stable", action: "View Conversation" },
    ],
    sideRows: [
      { id: "oc-1", primary: "Case #NP-44812", secondary: "Missing order after payment", metric: "3 min ago", status: "At Risk", action: "View Conversation" },
      { id: "oc-2", primary: "Case #NP-44803", secondary: "Payment status mismatch", metric: "19 min ago", status: "Attention", action: "Review Alert" },
      { id: "oc-3", primary: "Case #NP-44791", secondary: "Refund handoff completed", metric: "42 min ago", status: "Stable", action: "View Conversation" },
    ],
  };
}

function SimpleTrendChart() {
  return (
    <div className="flex h-32 items-end gap-2 rounded-md border border-line bg-stone-50 px-3 py-3">
      {trendBars.map((bar) => (
        <div key={bar.label} className="flex flex-1 flex-col items-center gap-2">
          <div className="w-full rounded-t bg-accent/70" style={{ height: `${bar.value - 35}px` }} />
          <div className="text-[11px] text-muted">{bar.label}</div>
        </div>
      ))}
    </div>
  );
}

export function Evaluate({ app }: PageProps) {
  const content = contentForRole(app.role);

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-5">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-accent">Evaluate</div>
          <h1 className="mt-1 text-2xl font-semibold text-ink">Payment Issue Resolver</h1>
          <p className="mt-1 max-w-3xl text-sm text-muted">{content.description}</p>
          <div className="mt-2 flex items-center gap-2">
            <Badge tone="neutral">Production</Badge>
            <Badge tone={app.role === "Org Admin" ? "accent" : "neutral"}>{content.eyebrow}</Badge>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ActionButton variant="primary">
            <FileText size={16} />
            {content.primaryCta}
          </ActionButton>
          <ActionButton variant="secondary">
            {content.secondaryCta === "Export" ? <Download size={16} /> : <Wrench size={16} />}
            {content.secondaryCta}
          </ActionButton>
          <ActionButton variant="secondary">
            {content.tertiaryCta === "Re-run Test" ? <RotateCcw size={16} /> : <GitCompareArrows size={16} />}
            {content.tertiaryCta}
          </ActionButton>
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="flex items-center gap-1 border-b border-line px-3 pt-2">
          {tabs.map((tab) => (
            <button
              key={tab}
              className={`h-9 border-b-2 px-3 text-sm font-medium ${
                tab === "Overview" ? "border-accent text-accent" : "border-transparent text-muted hover:text-ink"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="space-y-4 p-4">
          <div className="grid grid-cols-4 gap-3">
            {content.metrics.map((metric) => (
              <MetricCard key={metric.label} label={metric.label} value={metric.value} detail={metric.detail} />
            ))}
          </div>

          <div className="grid grid-cols-[0.95fr_1.05fr] gap-4">
            <Card className="p-4">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-semibold text-ink">{content.overviewTitle}</h2>
                  <p className="text-xs text-muted">Production trend · last 7 days</p>
                </div>
                <StatusChip status={app.role === "Org Admin" ? "Attention" : "At Risk"} />
              </div>
              <SimpleTrendChart />
              <div className="mt-3 grid grid-cols-3 gap-2 text-sm">
                <div className="rounded-md border border-line p-2">
                  <div className="text-xs text-muted">Volume</div>
                  <div className="font-semibold text-ink">+8.1%</div>
                </div>
                <div className="rounded-md border border-line p-2">
                  <div className="text-xs text-muted">Quality drift</div>
                  <div className="font-semibold text-warning">Medium</div>
                </div>
                <div className="rounded-md border border-line p-2">
                  <div className="text-xs text-muted">Open alerts</div>
                  <div className="font-semibold text-ink">3</div>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-base font-semibold text-ink">{content.tableTitle}</h2>
                <ActionButton variant="secondary" className="h-8 px-2.5 text-xs">
                  {content.primaryCta}
                </ActionButton>
              </div>
              <DataTable<TableRow>
                rows={content.rows}
                getRowKey={(row) => row.id}
                columns={[
                  {
                    key: "primary",
                    header: app.role === "Org Admin" ? "Workspace / Agent" : "Issue / Test case",
                    render: (row) => (
                      <div>
                        <div className="font-medium">{row.primary}</div>
                        <div className="text-xs text-muted">{row.secondary}</div>
                      </div>
                    ),
                  },
                  { key: "metric", header: "Metric", render: (row) => row.metric },
                  { key: "status", header: "Status", render: (row) => <StatusChip status={row.status} /> },
                  {
                    key: "action",
                    header: "Action",
                    render: (row) => (
                      <ActionButton variant="quiet" className="h-7 px-2 text-xs">
                        {row.action}
                      </ActionButton>
                    ),
                  },
                ]}
              />
            </Card>
          </div>

          <div className="grid grid-cols-[1fr_360px] gap-4">
            <Card className="p-4">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-base font-semibold text-ink">{content.sideTitle}</h2>
                <span className="text-xs text-muted">Payment Issue Resolver</span>
              </div>
              <DataTable<TableRow>
                rows={content.sideRows}
                getRowKey={(row) => row.id}
                columns={[
                  {
                    key: "item",
                    header: app.role === "Org Admin" ? "Alert / Agent" : "Recent item",
                    render: (row) => (
                      <div>
                        <div className="font-medium">{row.primary}</div>
                        <div className="text-xs text-muted">{row.secondary}</div>
                      </div>
                    ),
                  },
                  { key: "metric", header: "Metric", render: (row) => row.metric },
                  { key: "status", header: "Status", render: (row) => <StatusChip status={row.status} /> },
                  {
                    key: "action",
                    header: "Action",
                    render: (row) => (
                      <ActionButton variant="secondary" className="h-7 px-2 text-xs">
                        {row.action}
                      </ActionButton>
                    ),
                  },
                ]}
              />
            </Card>

            <Card className="p-4">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-base font-semibold text-ink">Environment Quality</h2>
                <BarChart3 size={16} className="text-muted" />
              </div>
              <div className="space-y-3">
                {[
                  ["Development", "98.4%", "Stable"],
                  ["Staging", "95.6%", "Attention"],
                  ["Production", "91.2%", "At Risk"],
                ].map(([environment, score, status]) => (
                  <div key={environment} className="rounded-md border border-line p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-semibold text-ink">{environment}</div>
                        <div className="text-xs text-muted">Quality score {score}</div>
                      </div>
                      <StatusChip status={status} />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </Card>
    </div>
  );
}
