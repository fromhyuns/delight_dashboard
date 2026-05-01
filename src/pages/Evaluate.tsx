import { TrendingDown, TrendingUp } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { AppState } from "../App";
import { Card } from "../components/ui/Card";
import { StatusChip } from "../components/ui/StatusChip";
import { agentPageData } from "../data/mockData";
import type { EnvironmentStatus } from "../types";

type PageProps = {
  app: AppState;
  environmentStatuses: EnvironmentStatus[];
};

type HeaderMetric = {
  label: string;
  value: string;
  detail?: string;
  tone?: "warning" | "danger";
  trend?: "up" | "down";
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
  description: string;
  overviewTitle: string;
  tableTitle: string;
  headerMetrics: HeaderMetric[];
  rows: TableRow[];
};

const tabs = ["Overview", "Test Results", "Quality", "Trends"];

const trendBars = [
  { label: "Mon", value: 88 },
  { label: "Tue", value: 91 },
  { label: "Wed", value: 89 },
  { label: "Thu", value: 94 },
  { label: "Fri", value: 92 },
  { label: "Sat", value: 90 },
  { label: "Sun", value: 91 },
];

const trendDetails = [
  { delta: "-1.2pt vs Tue", escalation: "7.8%" },
  { delta: "+3.0pt vs Mon", escalation: "6.9%" },
  { delta: "-2.0pt vs Tue", escalation: "7.5%" },
  { delta: "+5.0pt vs Wed", escalation: "6.2%" },
  { delta: "-2.0pt vs Thu", escalation: "6.8%" },
  { delta: "-2.0pt vs Fri", escalation: "7.3%" },
  { delta: "+1.0pt vs Sat", escalation: "7.0%" },
];

const trendInsights = [
  { label: "Top driver", value: "Payment status mismatch", detail: "+1.1pt escalation impact", tone: "danger" as const },
  { label: "Watch item", value: "Missing order after payment", detail: "41% of open high-risk conversations", tone: "warning" as const },
];

function taskBorderColor(status: string): string {
  if (status === "Failed")    return "border-l-danger";
  if (status === "Escalated") return "border-l-warning";
  return "border-l-transparent";
}

function taskRowBg(status: string): string {
  if (status === "Failed")    return "bg-danger/5";
  if (status === "Escalated") return "bg-warning/5";
  return "";
}

function TaskStatusBadge({ status }: { status: string }) {
  if (status === "Failed")
    return <span className="rounded-full border border-danger/30 bg-danger/5 px-2 py-0.5 text-[10px] font-bold tracking-wide text-danger">FAILED</span>;
  if (status === "Escalated")
    return <span className="rounded-full border border-warning/30 bg-warning/5 px-2 py-0.5 text-[10px] font-bold tracking-wide text-warning">ESCALATED</span>;
  return null;
}

function metricToneColor(tone?: "warning" | "danger"): string {
  if (tone === "danger") return "text-danger";
  if (tone === "warning") return "text-warning";
  return "text-ink";
}

type AgentEvaluateData = {
  operatorMetrics: HeaderMetric[];
  operatorRows: TableRow[];
  adminMetrics: HeaderMetric[];
  adminRows: TableRow[];
};

const agentEvaluateData: Record<string, AgentEvaluateData> = {
  "refund-review": {
    operatorMetrics: [
      { label: "Conversations", value: "18,420", detail: "+8.1% vs last week", trend: "up" },
      { label: "Success rate", value: "91.2%", detail: "−1.8pt from baseline", tone: "warning", trend: "down" },
      { label: "Escalation rate", value: "7.4%", detail: "+0.9pt · above threshold", tone: "danger", trend: "up" },
      { label: "Resolution time", value: "1m 42s", detail: "Median completed case" },
    ],
    operatorRows: [
      { id: "op-1", primary: "Missing order after payment", secondary: "Payment lookup", metric: "1,240 conv", status: "At Risk", action: "Review Alert" },
      { id: "op-2", primary: "Payment status mismatch", secondary: "Status check", metric: "428 conv", status: "Attention", action: "Investigate" },
      { id: "op-3", primary: "Refund handoff unclear", secondary: "Refund Process", metric: "201 conv", status: "Stable", action: "View" },
      { id: "op-4", primary: "Card verification retry", secondary: "Payment Method Update", metric: "144 conv", status: "Stable", action: "View" },
    ],
    adminMetrics: [
      { label: "Coverage", value: "2,560", detail: "Representative traces" },
      { label: "Quality score", value: "88%", detail: "vs 92% target", tone: "warning", trend: "down" },
      { label: "Test pass rate", value: "91.6%", detail: "2 failed staging cases", tone: "warning", trend: "down" },
      { label: "Regression risk", value: "Medium", detail: "Payment lookup affected", tone: "warning" },
    ],
    adminRows: [
      { id: "br-1", primary: "Missing order after payment", secondary: "Payment lookup", metric: "2 failures", status: "Failed", action: "View Test Results" },
      { id: "br-2", primary: "Duplicate payment handoff", secondary: "Escalation", metric: "1 warning", status: "Attention", action: "Re-Execute" },
      { id: "br-3", primary: "Refund eligibility summary", secondary: "Refund Process", metric: "Passed", status: "Stable", action: "Setting" },
      { id: "br-4", primary: "Card verification retry", secondary: "Payment Method Update", metric: "Passed", status: "Stable", action: "Setting" },
    ],
  },
  "refund-assistant": {
    operatorMetrics: [
      { label: "Conversations", value: "9,840", detail: "+3.4% vs last week", trend: "up" },
      { label: "Success rate", value: "93.5%", detail: "On target", trend: "up" },
      { label: "Escalation rate", value: "5.8%", detail: "Within threshold", trend: "down" },
      { label: "Resolution time", value: "2m 10s", detail: "Median completed case" },
    ],
    operatorRows: [
      { id: "op-1", primary: "Delayed refund inquiry", secondary: "Refund Status", metric: "612 conv", status: "Attention", action: "Investigate" },
      { id: "op-2", primary: "Wrong refund amount reported", secondary: "Transaction Lookup", metric: "284 conv", status: "At Risk", action: "Review Alert" },
      { id: "op-3", primary: "Eligibility disputed by customer", secondary: "Manual Escalation", metric: "193 conv", status: "Attention", action: "Investigate" },
      { id: "op-4", primary: "Notification not received", secondary: "Customer Notification", metric: "87 conv", status: "Stable", action: "View" },
    ],
    adminMetrics: [
      { label: "Coverage", value: "1,840", detail: "Representative traces" },
      { label: "Quality score", value: "91%", detail: "vs 92% target", tone: "warning", trend: "down" },
      { label: "Test pass rate", value: "94.2%", detail: "1 failed staging case", tone: "warning", trend: "down" },
      { label: "Regression risk", value: "Low", detail: "No critical regressions" },
    ],
    adminRows: [
      { id: "br-1", primary: "Refund status unclear", secondary: "Refund Status Check", metric: "1 failure", status: "Failed", action: "View Test Results" },
      { id: "br-2", primary: "Eligibility edge case", secondary: "Transaction Lookup", metric: "1 warning", status: "Attention", action: "Re-Execute" },
      { id: "br-3", primary: "Escalation misfired", secondary: "Manual Escalation", metric: "Passed", status: "Stable", action: "Setting" },
      { id: "br-4", primary: "Notification template error", secondary: "Customer Notification", metric: "Passed", status: "Stable", action: "Setting" },
    ],
  },
  "transaction-failure": {
    operatorMetrics: [
      { label: "Conversations", value: "6,210", detail: "+5.2% vs last week", trend: "up" },
      { label: "Success rate", value: "89.7%", detail: "−2.4pt from baseline", tone: "danger", trend: "down" },
      { label: "Escalation rate", value: "9.2%", detail: "+1.4pt · above threshold", tone: "danger", trend: "up" },
      { label: "Resolution time", value: "1m 28s", detail: "Median completed case" },
    ],
    operatorRows: [
      { id: "op-1", primary: "Bank timeout unresolved", secondary: "Failure Classifier", metric: "920 conv", status: "At Risk", action: "Review Alert" },
      { id: "op-2", primary: "Misclassified failure type", secondary: "Routing Engine", metric: "341 conv", status: "At Risk", action: "Review Alert" },
      { id: "op-3", primary: "Routing delay exceeded SLA", secondary: "Routing Engine", metric: "218 conv", status: "Attention", action: "Investigate" },
      { id: "op-4", primary: "Status notification not sent", secondary: "Status Notifier", metric: "130 conv", status: "Stable", action: "View" },
    ],
    adminMetrics: [
      { label: "Coverage", value: "1,320", detail: "Representative traces" },
      { label: "Quality score", value: "85%", detail: "vs 90% target", tone: "danger", trend: "down" },
      { label: "Test pass rate", value: "88.4%", detail: "4 failed staging cases", tone: "danger", trend: "down" },
      { label: "Regression risk", value: "High", detail: "Classifier accuracy degraded", tone: "danger" },
    ],
    adminRows: [
      { id: "br-1", primary: "Bank timeout misclassified", secondary: "Failure Classifier", metric: "3 failures", status: "Failed", action: "View Test Results" },
      { id: "br-2", primary: "Routing confidence low", secondary: "Routing Engine", metric: "2 failures", status: "Failed", action: "View Test Results" },
      { id: "br-3", primary: "Notification not triggered", secondary: "Status Notifier", metric: "1 warning", status: "Attention", action: "Re-Execute" },
      { id: "br-4", primary: "Escalation handler missed", secondary: "Escalation Handler", metric: "Passed", status: "Stable", action: "Setting" },
    ],
  },
  "catalog-monitor": {
    operatorMetrics: [
      { label: "Listings monitored", value: "48,200", detail: "+1.2% this week", trend: "up" },
      { label: "Alerts flagged", value: "12", detail: "4 require review", tone: "warning", trend: "up" },
      { label: "False positive rate", value: "18.4%", detail: "+3.1pt · above target", tone: "danger", trend: "up" },
      { label: "Review SLA", value: "2h 15m", detail: "Avg time to admin review" },
    ],
    operatorRows: [
      { id: "op-1", primary: "Price anomaly — SKU-4892", secondary: "Price Monitor", metric: "1 alert", status: "At Risk", action: "Review Alert" },
      { id: "op-2", primary: "Out-of-stock mislabeled available", secondary: "Listing Validator", metric: "3 alerts", status: "Attention", action: "Investigate" },
      { id: "op-3", primary: "Policy violation pending review", secondary: "Content Checker", metric: "2 alerts", status: "Attention", action: "Investigate" },
      { id: "op-4", primary: "Duplicate listing detected", secondary: "Catalog Scanner", metric: "6 alerts", status: "Stable", action: "View" },
    ],
    adminMetrics: [
      { label: "Coverage", value: "980", detail: "Sampled listing traces" },
      { label: "Quality score", value: "90%", detail: "vs 92% target", tone: "warning", trend: "down" },
      { label: "Test pass rate", value: "93.7%", detail: "1 failed staging case", tone: "warning", trend: "down" },
      { label: "Regression risk", value: "Low", detail: "Price monitor stable" },
    ],
    adminRows: [
      { id: "br-1", primary: "Price sync lag", secondary: "Price Monitor", metric: "1 failure", status: "Failed", action: "View Test Results" },
      { id: "br-2", primary: "Stock status mislabeled", secondary: "Listing Validator", metric: "1 warning", status: "Attention", action: "Re-Execute" },
      { id: "br-3", primary: "Duplicate listing filter", secondary: "Catalog Scanner", metric: "Passed", status: "Stable", action: "Setting" },
      { id: "br-4", primary: "Content policy check", secondary: "Content Checker", metric: "Passed", status: "Stable", action: "Setting" },
    ],
  },
  "query-intent": {
    operatorMetrics: [
      { label: "Conversations", value: "3,890", detail: "+2.1% vs last week", trend: "up" },
      { label: "Success rate", value: "94.1%", detail: "On target", trend: "up" },
      { label: "Escalation rate", value: "4.3%", detail: "Within threshold", trend: "down" },
      { label: "Resolution time", value: "58s", detail: "Median completed case" },
    ],
    operatorRows: [
      { id: "op-1", primary: "Ambiguous cancel vs change", secondary: "Intent Classifier", metric: "312 conv", status: "Attention", action: "Investigate" },
      { id: "op-2", primary: "Date change misrouted", secondary: "Change Handler", metric: "198 conv", status: "Attention", action: "Investigate" },
      { id: "op-3", primary: "Guest count not captured", secondary: "Intent Classifier", metric: "94 conv", status: "Stable", action: "View" },
      { id: "op-4", primary: "Booking reference not confirmed", secondary: "Booking Lookup", metric: "61 conv", status: "Stable", action: "View" },
    ],
    adminMetrics: [
      { label: "Coverage", value: "720", detail: "Representative traces" },
      { label: "Quality score", value: "94%", detail: "vs 93% target", trend: "up" },
      { label: "Test pass rate", value: "96.1%", detail: "0 failed staging cases", trend: "up" },
      { label: "Regression risk", value: "Low", detail: "No regressions detected" },
    ],
    adminRows: [
      { id: "br-1", primary: "Ambiguous request unclassified", secondary: "Intent Classifier", metric: "1 warning", status: "Attention", action: "Re-Execute" },
      { id: "br-2", primary: "Booking not loaded", secondary: "Booking Lookup", metric: "Passed", status: "Stable", action: "Setting" },
      { id: "br-3", primary: "Escalation not triggered", secondary: "Escalation", metric: "Passed", status: "Stable", action: "Setting" },
      { id: "br-4", primary: "Guest count edge case", secondary: "Intent Classifier", metric: "Passed", status: "Stable", action: "Setting" },
    ],
  },
  "ticket-routing": {
    operatorMetrics: [
      { label: "Conversations", value: "14,220", detail: "+6.4% vs last week", trend: "up" },
      { label: "Success rate", value: "87.3%", detail: "−3.1pt from baseline", tone: "danger", trend: "down" },
      { label: "Escalation rate", value: "11.6%", detail: "+2.2pt · above threshold", tone: "danger", trend: "up" },
      { label: "Resolution time", value: "1m 18s", detail: "Median completed case" },
    ],
    operatorRows: [
      { id: "op-1", primary: "Policy conflict unresolved", secondary: "Policy Matcher", metric: "1,840 conv", status: "At Risk", action: "Review Alert" },
      { id: "op-2", primary: "VIP routing failed", secondary: "Queue Router", metric: "620 conv", status: "At Risk", action: "Review Alert" },
      { id: "op-3", primary: "SLA breach detected", secondary: "Priority Scorer", metric: "403 conv", status: "Attention", action: "Investigate" },
      { id: "op-4", primary: "Tier misclassification", secondary: "Ticket Parser", metric: "218 conv", status: "Attention", action: "Investigate" },
    ],
    adminMetrics: [
      { label: "Coverage", value: "2,100", detail: "Representative traces" },
      { label: "Quality score", value: "83%", detail: "vs 90% target", tone: "danger", trend: "down" },
      { label: "Test pass rate", value: "86.9%", detail: "5 failed staging cases", tone: "danger", trend: "down" },
      { label: "Regression risk", value: "High", detail: "Policy matcher degraded", tone: "danger" },
    ],
    adminRows: [
      { id: "br-1", primary: "Policy conflict unresolved", secondary: "Policy Matcher", metric: "3 failures", status: "Failed", action: "View Test Results" },
      { id: "br-2", primary: "Priority score wrong", secondary: "Priority Scorer", metric: "2 failures", status: "Failed", action: "View Test Results" },
      { id: "br-3", primary: "VIP routing failed", secondary: "Queue Router", metric: "1 warning", status: "Attention", action: "Re-Execute" },
      { id: "br-4", primary: "SLA mismatch on Tier-2", secondary: "Ticket Parser", metric: "Passed", status: "Stable", action: "Setting" },
    ],
  },
};

function contentForAgent(role: AppState["role"], agentId: string | undefined): ViewContent {
  if (role === "Org Admin") {
    return {
      description: "Organization-level quality, risk, and operational outcomes for the selected production agent.",
      overviewTitle: "Organization Quality Overview",
      tableTitle: "Quality by Workspace",
      headerMetrics: [
        { label: "Workspaces monitored", value: "12", detail: "3 under review" },
        { label: "Avg success rate", value: "93.4%", detail: "vs 95% target", tone: "warning", trend: "down" },
        { label: "Governance alerts", value: "4", detail: "2 require review", tone: "danger", trend: "up" },
        { label: "Avg resolution time", value: "1m 48s", detail: "Production median" },
      ],
      rows: [
        { id: "org-1", primary: "Naver Pay Operations", secondary: "8 agents", metric: "91.2% success", status: "Attention", action: "Review Governance" },
        { id: "org-2", primary: "Shopping Support", secondary: "6 agents", metric: "94.8% success", status: "Stable", action: "View report" },
        { id: "org-3", primary: "Reservation CX", secondary: "5 agents", metric: "96.1% success", status: "Stable", action: "View report" },
        { id: "org-4", primary: "Global Customer Care", secondary: "7 agents", metric: "90.7% success", status: "Attention", action: "Review Governance" },
      ],
    };
  }

  const data = agentEvaluateData[agentId ?? ""] ?? agentEvaluateData["refund-review"];

  if (role === "Workspace Admin") {
    return {
      description: "Test outcomes, quality score, and failing cases for improving this agent before promotion.",
      overviewTitle: "Quality Overview",
      tableTitle: "Top Failing Test Cases",
      headerMetrics: data.adminMetrics,
      rows: data.adminRows,
    };
  }

  return {
    description: "Production performance, recent issues, and conversation outcomes for day-to-day monitoring.",
    overviewTitle: "Performance Overview",
    tableTitle: "Top Issues",
    headerMetrics: data.operatorMetrics,
    rows: data.operatorRows,
  };
}

// Chart viewBox: 420 × 120 → aspect ratio 3.5 : 1
const CHART_VIEWBOX_W = 420;
const CHART_VIEWBOX_H = 120;

function SimpleTrendChart() {
  const svgRef = useRef<SVGSVGElement>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [animateLine, setAnimateLine] = useState(false);
  const [activePoint, setActivePoint] = useState<number | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);

  function scheduleHide() {
    hideTimer.current = setTimeout(() => {
      setActivePoint(null);
      setTooltipPos(null);
    }, 80);
  }

  function cancelHide() {
    if (hideTimer.current) {
      clearTimeout(hideTimer.current);
      hideTimer.current = null;
    }
  }

  const maxValue = Math.max(...trendBars.map((b) => b.value));
  const minValue = Math.min(...trendBars.map((b) => b.value));
  const chartMin = minValue - 3;
  const chartMax = maxValue + 3;
  const threshold = 92;

  const points = trendBars.map((bar, idx) => {
    const x = ((idx + 0.5) / trendBars.length) * CHART_VIEWBOX_W;
    const y = ((chartMax - bar.value) / (chartMax - chartMin)) * CHART_VIEWBOX_H;
    return { ...bar, x, y, detail: trendDetails[idx] };
  });
  const polylinePoints = points.map((p) => `${p.x},${p.y}`).join(" ");
  const thresholdY = ((chartMax - threshold) / (chartMax - chartMin)) * CHART_VIEWBOX_H;


  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) { setAnimateLine(true); return; }
    const rafId = window.requestAnimationFrame(() => setAnimateLine(true));
    return () => window.cancelAnimationFrame(rafId);
  }, []);


  const activeIdx = activePoint;
  const activePos = tooltipPos;
  const tooltip =
    activeIdx !== null && activePos !== null
      ? createPortal(
          <div
            className="fixed z-[9999] w-44 -translate-x-1/2 -translate-y-full rounded-md border border-white/80 bg-white/95 p-2 text-xs shadow-md backdrop-blur-md"
            style={{ left: activePos.x, top: activePos.y - 8 }}
            onMouseEnter={cancelHide}
            onMouseLeave={scheduleHide}
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold text-stone-900">{trendBars[activeIdx].label}</span>
              <span className="font-semibold text-accent">{trendBars[activeIdx].value}%</span>
            </div>
            <div className="mt-1 space-y-0.5 text-stone-700">
              <div>{trendDetails[activeIdx].delta}</div>
              <div>Escalation {trendDetails[activeIdx].escalation}</div>
            </div>
            <div className="absolute left-1/2 top-full h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rotate-45 border-b border-r border-white/80 bg-white/80 backdrop-blur-md" aria-hidden />
          </div>,
          document.body
        )
      : null;

  return (
    <>
      <div
        className="relative overflow-visible rounded-md border border-line bg-stone-50 px-3 py-3"
        onMouseLeave={scheduleHide}
      >
        <div className="relative">
          <svg
            ref={svgRef}
            viewBox={`0 0 ${CHART_VIEWBOX_W} ${CHART_VIEWBOX_H}`}
            preserveAspectRatio="none"
            className="h-full w-full"
            style={{ display: "block" }}
          >
            <line x1={0} y1={thresholdY} x2={CHART_VIEWBOX_W} y2={thresholdY} stroke="#d6d3d1" strokeDasharray="4 4" strokeWidth="1" />
            <polyline
              points={polylinePoints}
              fill="none"
              stroke="#8b5cf6"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              pathLength={1}
              style={{
                opacity: animateLine ? 1 : 0.3,
                strokeDasharray: 1,
                strokeDashoffset: animateLine ? 0 : 1,
                transition: "stroke-dashoffset 900ms ease-out, opacity 400ms ease-out",
              }}
            />
            {points.map((point, i) => (
              <g key={point.label}>
                <circle
                  cx={point.x} cy={point.y}
                  r={activeIdx === i ? 4.5 : 3.5}
                  fill={activeIdx === i ? "#6d28d9" : "#8b5cf6"}
                  className="cursor-pointer transition-all"
                  style={{ opacity: animateLine ? 1 : 0, transitionDelay: `${120 + i * 40}ms` }}
                  onMouseEnter={() => {
                    setActivePoint(i);
                    if (svgRef.current) {
                      const rect = svgRef.current.getBoundingClientRect();
                      setTooltipPos({
                        x: rect.left + (point.x / CHART_VIEWBOX_W) * rect.width,
                        y: rect.top  + (point.y / CHART_VIEWBOX_H) * rect.height,
                      });
                    }
                  }}
                />
              </g>
            ))}
          </svg>

          <div className="mt-1 grid grid-cols-7 text-center">
            {trendBars.map((bar) => (
              <span key={bar.label} className="text-[11px] text-muted">
                {bar.label}
              </span>
            ))}
          </div>
        </div>
      </div>
      {tooltip}
    </>
  );
}

export function Evaluate({ app }: PageProps) {
  const content = contentForAgent(app.role, app.agent?.id);
  const pageData = agentPageData[app.agent?.id ?? ""] ?? agentPageData["refund-review"];
  const issueRows = pageData.tasks.filter((t) => t.status === "Failed" || t.status === "Escalated");

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      {/* Page header */}
      <div className="flex shrink-0 items-start justify-between gap-5">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-accent">Evaluate</div>
          <h1 className="mt-1 text-2xl font-semibold text-ink">{app.agent?.name ?? "—"}</h1>
          <p className="mt-1 max-w-3xl text-sm text-muted">{content.description}</p>
        </div>
      </div>

      {/* Main card */}
      <Card className="flex min-h-0 flex-1 flex-col overflow-hidden">
        {/* Tabs */}
        <div className="flex shrink-0 items-center gap-1 border-b border-line px-3 pt-2">
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

        {/* Overview content */}
        <div className="grid min-h-0 flex-1 grid-cols-2 overflow-hidden">

          {/* ── Left: KPIs + Top Issues ───────────────────────────────── */}
          <div className="flex flex-col gap-4 overflow-hidden border-r border-line px-4 py-6">

            {/* 2×2 KPI grid — uniform bg, taller cells, trend icons */}
            <div className="shrink-0 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-line bg-line">
              {content.headerMetrics.map((m) => (
                <div key={m.label} className="bg-panel px-4 py-4">
                  <div className="flex items-center justify-between gap-1">
                    <div className="text-[10px] font-semibold uppercase tracking-wide text-muted">{m.label}</div>
                    {m.trend === "up" && (
                      <TrendingUp size={12} className={m.tone === "danger" ? "text-danger" : m.tone === "warning" ? "text-warning" : "text-success"} />
                    )}
                    {m.trend === "down" && (
                      <TrendingDown size={12} className={m.tone === "danger" ? "text-danger" : m.tone === "warning" ? "text-warning" : "text-muted"} />
                    )}
                  </div>
                  <div className={`mt-1.5 text-2xl font-bold ${metricToneColor(m.tone)}`}>{m.value}</div>
                  {m.detail && <div className="mt-0.5 text-[11px] text-muted">{m.detail}</div>}
                </div>
              ))}
            </div>

            {/* Top Issues — fills remaining height */}
            <div className="flex min-h-0 flex-1 flex-col">
              <div className="mb-2 shrink-0 text-[13px] font-bold uppercase tracking-wide text-ink">{content.tableTitle}</div>
              <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-line">
                {/* Header row */}
                <div className="flex shrink-0 border-b border-line bg-stone-50">
                  <div className="w-[55%] px-3 py-2 text-[10px] font-semibold uppercase tracking-wide text-muted">Issue</div>
                  <div className="w-[25%] px-3 py-2 text-[10px] font-semibold uppercase tracking-wide text-muted">Status</div>
                  <div className="w-[20%] px-3 py-2" />
                </div>
                {/* Body rows */}
                <div className="compact-scrollbar flex-1 divide-y divide-line overflow-y-auto bg-panel">
                  {issueRows.map((row) => (
                    <div
                      key={row.id}
                      className={`flex items-center border-l-2 transition hover:brightness-[0.97] ${taskBorderColor(row.status)} ${taskRowBg(row.status)}`}
                    >
                      <div className="w-[55%] min-w-0 px-3 py-2.5">
                        <div className="truncate text-xs font-medium text-ink">{row.task}</div>
                        <div className="mt-0.5 text-[10px] text-muted">{row.envTag} · {row.time}</div>
                      </div>
                      <div className="w-[25%] shrink-0 px-3 py-2.5">
                        <TaskStatusBadge status={row.status} />
                      </div>
                      <div className="w-[20%] shrink-0 px-3 py-2.5">
                        <button className="rounded border border-line bg-white px-2 py-0.5 text-[11px] font-medium text-muted transition hover:bg-stone-50 hover:text-ink">
                          View
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ── Right: chart + signals ────────────────────────────────── */}
          <div className="flex flex-col gap-3 overflow-hidden p-4">

            {/* Chart header */}
            <div className="flex shrink-0 items-start justify-between">
              <div>
                <h2 className="text-[13px] font-bold uppercase tracking-wide text-ink">{content.overviewTitle}</h2>
                <p className="text-xs text-muted">Production trend · last 7 days</p>
              </div>
              <StatusChip status={app.role === "Org Admin" ? "Attention" : "At Risk"} />
            </div>

            {/*
              Chart wrapper: aspect-ratio 420:120 (= 7:2) keeps the SVG viewBox
              proportions intact so lines and dots never appear stretched.
            */}
            <div className="w-full" style={{ aspectRatio: "420 / 120" }}>
              <SimpleTrendChart />
            </div>

            {/* Volume + Open alerts */}
            <div className="shrink-0 grid grid-cols-2 gap-2">
              <div className="rounded-md border border-line p-2.5">
                <div className="text-[10px] font-semibold uppercase tracking-wide text-muted">Volume</div>
                <div className="mt-0.5 text-sm font-semibold text-ink">+8.1%</div>
              </div>
              <div className="rounded-md border border-line p-2.5">
                <div className="text-[10px] font-semibold uppercase tracking-wide text-muted">Open alerts</div>
                <div className="mt-0.5 text-sm font-semibold text-ink">3</div>
              </div>
            </div>

            {/* Key Signals — fixed height, internal scroll */}
            <div className="shrink-0">
              <div className="mb-2 text-[13px] font-bold uppercase tracking-wide text-ink">Key Signals</div>
              <div className="compact-scrollbar flex h-44 flex-col gap-2 overflow-y-auto">
                {trendInsights.map((item) => (
                  <div
                    key={item.label}
                    className={`flex gap-2.5 rounded-md border p-2.5 ${
                      item.tone === "danger"
                        ? "border-danger/20 bg-danger/5"
                        : "border-warning/20 bg-warning/5"
                    }`}
                  >
                    <div className={`mt-1 h-1.5 w-1.5 shrink-0 rounded-full ${item.tone === "danger" ? "bg-danger" : "bg-warning"}`} />
                    <div className="min-w-0">
                      <div className={`text-[10px] font-semibold uppercase tracking-wide ${item.tone === "danger" ? "text-danger" : "text-warning"}`}>
                        {item.label}
                      </div>
                      <div className="mt-0.5 text-sm font-medium text-ink">{item.value}</div>
                      <div className="mt-0.5 text-xs text-muted">{item.detail}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </Card>
    </div>
  );
}
