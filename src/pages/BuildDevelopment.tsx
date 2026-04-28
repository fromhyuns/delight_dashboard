import {
  BarChart2, BookOpen, CheckCircle, ChevronDown, Clock,
  GitBranch, Lock, PlayCircle, RefreshCw, Save,
  Shield, TriangleAlert, User, Wrench,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { AppState } from "../App";
import { ActionButton } from "../components/ui/ActionButton";
import { Badge } from "../components/ui/Badge";
import { Card } from "../components/ui/Card";
import { DataTable } from "../components/ui/DataTable";
import { StatusChip } from "../components/ui/StatusChip";

type PageProps = { app: AppState };

type Capability = { id: string; name: string; status: string; locked?: boolean };
type ImpactRow  = { id: string; testCase: string; area: string; result: "Passed" | "Failed" | "Unchanged" };
type DiffItem   = { type: "added" | "modified" | "removed"; section: string; detail: string };
type DeployRecord = { version: string; status: "current" | "stable" | "rolled-back"; by: string; time: string; note: string };

const buildTabs = ["Development", "Knowledge", "Tools", "Workflow", "Configuration"];

const defaultInstructions = `You are Payment Issue Resolver for Naver Pay Operations.

Primary goal:
- Help support operators identify why a customer sees a completed payment without a matching order.
- Check payment status, order creation state, refund eligibility, and escalation criteria.
- Keep responses concise, policy-grounded, and ready for an operator to review.

Safety and handoff:
- Do not claim a refund has been issued unless the payment record confirms it.
- Escalate when order status and payment status disagree for more than 10 minutes.
- Ask for missing transaction ID or order ID before drawing a conclusion.`;

const defaultSampleMessage =
  "I paid successfully, but my order is not showing in Naver Pay. Can you check what happened?";

const testScenarios = [
  "Paid but order missing",
  "Duplicate payment reported",
  "Refund status unclear",
  "Card verification failed",
];

const capabilities: Capability[] = [
  { id: "cap-1", name: "Payment Issue Detection", status: "Enabled" },
  { id: "cap-2", name: "Payment Status Check",    status: "Enabled", locked: true },
  { id: "cap-3", name: "Refund Process",          status: "Review" },
  { id: "cap-4", name: "Payment Method Update",   status: "Enabled" },
  { id: "cap-5", name: "Escalation",              status: "Enabled" },
];

const impactRows: ImpactRow[] = [
  { id: "imp-1", testCase: "Missing order after payment",  area: "Payment lookup",        result: "Failed"    },
  { id: "imp-2", testCase: "Duplicate payment handoff",    area: "Escalation",            result: "Passed"    },
  { id: "imp-3", testCase: "Refund eligibility summary",   area: "Refund Process",        result: "Unchanged" },
  { id: "imp-4", testCase: "Card verification retry",      area: "Payment Method Update", result: "Passed"    },
];

const stagingDiffs: DiffItem[] = [
  { type: "modified", section: "Escalation logic",       detail: "Timeout changed: 10 min → 15 min" },
  { type: "added",    section: "Missing order handling",  detail: "Auto-escalate after 3 retries (new rule)" },
  { type: "removed",  section: "Card verification",       detail: "Legacy fallback path removed" },
];

const deploymentHistory: DeployRecord[] = [
  { version: "v2.4.1", status: "current",      by: "Sarah J.", time: "2h ago",  note: "Escalation timeout update" },
  { version: "v2.4.0", status: "rolled-back",  by: "Mike R.", time: "1d ago",  note: "Reverted — response degradation detected" },
  { version: "v2.3.2", status: "stable",       by: "Sarah J.", time: "3d ago",  note: "Refund process refinement" },
];

const diffStyle: Record<DiffItem["type"], { dot: string; label: string; labelColor: string; rowBg: string }> = {
  modified: { dot: "bg-warning",  label: "MODIFIED", labelColor: "text-warning",  rowBg: "bg-warning/5"  },
  added:    { dot: "bg-success",  label: "ADDED",    labelColor: "text-success",  rowBg: "bg-success/5"  },
  removed:  { dot: "bg-danger",   label: "REMOVED",  labelColor: "text-danger",   rowBg: "bg-danger/5"   },
};

const deployStatusStyle: Record<DeployRecord["status"], { dot: string; label: string; labelColor: string }> = {
  "current":     { dot: "bg-success", label: "CURRENT",     labelColor: "text-success" },
  "stable":      { dot: "bg-stone-300", label: "STABLE",    labelColor: "text-muted"  },
  "rolled-back": { dot: "bg-danger",  label: "ROLLED BACK", labelColor: "text-danger"  },
};

function roleState(role: AppState["role"]) {
  if (role === "Workspace Admin") return { promoteDisabled: false, capabilityAction: "Manage Tools" };
  if (role === "Org Admin")       return { promoteDisabled: false, capabilityAction: "View Tools" };
  return { promoteDisabled: true, capabilityAction: "View Locked Tools" };
}

function resultTone(result: ImpactRow["result"]) {
  if (result === "Passed") return "success" as const;
  if (result === "Failed") return "danger"  as const;
  return "neutral" as const;
}

const failedCount = impactRows.filter((r) => r.result === "Failed").length;

export function BuildDevelopment({ app }: PageProps) {
  const [activeTab, setActiveTab]           = useState("Development");
  const [instructions, setInstructions]     = useState(defaultInstructions);
  const [sampleMessage, setSampleMessage]   = useState(defaultSampleMessage);
  const [activeScenario, setActiveScenario] = useState(0);
  const [showQuality, setShowQuality]       = useState(false);
  const [isUnlocked, setIsUnlocked]         = useState(false);
  const [cardGlowKey, setCardGlowKey]       = useState(0);
  // Production-only collapsibles
  const [showHistory, setShowHistory]       = useState(false);
  const [showGovernance, setShowGovernance] = useState(false);

  const prevEnvRef = useRef(app.environment);

  const isProd    = app.environment === "Production";
  const isStaging = app.environment === "Staging";

  useEffect(() => {
    if (!isProd) setIsUnlocked(false);
    if (app.environment === "Production" && prevEnvRef.current !== "Production") {
      setCardGlowKey((k) => k + 1);
    }
    prevEnvRef.current = app.environment;
  }, [app.environment, isProd]);

  const role           = roleState(app.role);
  const characterCount = useMemo(() => instructions.length.toLocaleString(), [instructions]);

  const envSubtitle = isStaging
    ? "Review and validate changes before promoting to Production."
    : "Shape how this agent thinks and responds. Changes are isolated to Development.";

  /* ─── Shared sub-components ──────────────────────────────── */

  const tabBar = (
    <div className="flex items-center gap-1 border-b border-line px-3 pt-2">
      {buildTabs.map((tab) => (
        <button
          key={tab}
          onClick={() => setActiveTab(tab)}
          className={`h-9 border-b-2 px-3 text-sm font-medium transition ${
            activeTab === tab
              ? "border-accent text-accent"
              : "border-transparent text-muted hover:text-ink"
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  );

  const capabilityList = (readOnly: boolean) => (
    <div className="divide-y divide-line overflow-hidden rounded-md border border-line">
      {capabilities.map((cap) => {
        const locked = cap.locked && app.role === "Agent Builder / Operator";
        return (
          <div
            key={cap.id}
            className={`flex items-center gap-3 px-3 py-2.5 ${locked ? "bg-stone-50" : "bg-white"}`}
          >
            <span className={`h-2 w-2 shrink-0 rounded-full ${
              locked                     ? "bg-stone-300"
              : cap.status === "Enabled" ? "bg-success"
              : cap.status === "Review"  ? "bg-warning"
              : "bg-stone-300"
            }`} />
            <span className={`flex-1 text-sm ${locked ? "text-muted" : "text-ink"}`}>
              {cap.name}
            </span>
            {locked
              ? <Lock size={12} className="shrink-0 text-stone-400" />
              : readOnly
              ? <span className="text-[10px] font-semibold uppercase tracking-wide text-muted">{cap.status}</span>
              : <StatusChip status={cap.status} />
            }
          </div>
        );
      })}
    </div>
  );

  const testPanel = (label: string, btnLabel: string) => (
    <div className="p-5">
      <div className="mb-4">
        <h2 className="text-base font-semibold text-ink">{label}</h2>
        <p className="mt-0.5 text-xs text-muted">
          {isProd
            ? "Inspect live behavior against the deployed configuration."
            : `Try your changes in the ${app.environment} sandbox.`}
        </p>
      </div>
      <div className="space-y-4">
        <div>
          <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted">
            {isProd ? "Live Checks" : "Scenarios"}
          </div>
          <div className="space-y-1.5">
            {testScenarios.map((s, i) => (
              <button
                key={s}
                onClick={() => setActiveScenario(i)}
                className={`flex w-full items-center rounded-md border px-3 py-2 text-left text-sm transition ${
                  activeScenario === i
                    ? "border-accent/30 bg-accentSoft text-accent"
                    : "border-line bg-white text-ink hover:bg-stone-50"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted">
            {isProd ? "Validation Query" : "User message"}
          </div>
          <textarea
            value={sampleMessage}
            onChange={(e) => setSampleMessage(e.target.value)}
            rows={3}
            className="w-full resize-none rounded-md border border-line bg-white p-3 text-sm leading-6 text-ink outline-none focus:border-accent"
          />
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-muted">
              {isProd ? "Production Response" : "Agent response"}
            </div>
            <button className="flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] text-muted transition hover:bg-stone-100 hover:text-ink">
              <RefreshCw size={10} />
              Re-run
            </button>
          </div>
          <div className="rounded-md border border-accent/20 bg-accentSoft p-3">
            <p className="text-sm leading-6 text-muted">
              I can help check the payment and order creation state. Please provide the
              transaction ID or order ID, then I will verify whether escalation is needed.
            </p>
          </div>
        </div>

        <ActionButton variant="primary" className="w-full">
          <PlayCircle size={15} />
          {btnLabel}
        </ActionButton>
      </div>
    </div>
  );

  /* ─── Production collapsible section ─────────────────────── */
  const collapsible = (
    icon: React.ReactNode,
    title: string,
    badge: React.ReactNode,
    open: boolean,
    toggle: () => void,
    content: React.ReactNode,
  ) => (
    <div className="rounded-lg border border-line bg-white">
      <button
        onClick={toggle}
        className="flex w-full items-center justify-between px-4 py-3 text-left"
      >
        <div className="flex items-center gap-2 text-sm font-medium text-ink">
          {icon}
          {title}
        </div>
        <div className="flex items-center gap-2">
          {badge}
          <ChevronDown size={14} className={`text-muted transition-transform ${open ? "rotate-180" : ""}`} />
        </div>
      </button>
      {open && <div className="border-t border-line">{content}</div>}
    </div>
  );

  /* ─── Render ─────────────────────────────────────────────── */
  return (
    <div className="space-y-4">

      {/* ── Production guard banner ──────────────────────────── */}
      {isProd && (
        <div className="-mx-6 -mt-5 flex items-center justify-between border-b border-red-200 bg-red-100 px-6 py-2.5 text-sm">
          <div className="flex items-center gap-2 text-red-700">
            <TriangleAlert size={13} className="shrink-0" />
            <span className="font-semibold">Production environment</span>
            <span className="text-red-300">—</span>
            <span className="font-normal text-red-600">Changes apply immediately to 1,247 live users</span>
          </div>
          <div className="flex items-center gap-3">
            {isUnlocked ? (
              <button
                onClick={() => setIsUnlocked(false)}
                className="flex items-center gap-1.5 rounded border border-red-300 bg-red-200 px-2.5 py-1 text-xs font-medium text-red-800 transition hover:bg-red-300"
              >
                <Lock size={11} />
                Lock editing
              </button>
            ) : (
              <button
                onClick={() => setIsUnlocked(true)}
                className="rounded border border-red-300 bg-white/60 px-2.5 py-1 text-xs font-medium text-red-800 transition hover:bg-white"
              >
                Unlock editing
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── Page header ─────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-5">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-accent">Build</div>
          <h1 className="mt-1 text-2xl font-semibold text-ink">{app.agent.name}</h1>

          {isProd ? (
            /* Production: live status line */
            <div className="mt-1.5 flex items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-success/25 bg-success/10 px-2.5 py-0.5 text-xs font-medium text-success">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-success" />
                Live · 1,247 active users
              </span>
              <span className="text-xs text-muted">v2.4.1 · Deployed 2h ago by Sarah J.</span>
            </div>
          ) : (
            <p className="mt-1.5 text-sm text-muted">{envSubtitle}</p>
          )}
        </div>

        {/* CTA buttons — different per environment */}
        <div className="flex shrink-0 items-center gap-2">
          {isProd ? (
            <>
              <ActionButton variant="secondary">
                <BarChart2 size={15} />
                View Performance
              </ActionButton>
              {isUnlocked ? (
                <button className="flex items-center gap-1.5 rounded-md bg-red-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-red-700">
                  <Save size={15} />
                  Save to Production
                </button>
              ) : (
                <ActionButton variant="primary">
                  <CheckCircle size={15} />
                  Request Approval
                </ActionButton>
              )}
            </>
          ) : (
            <>
              <span className="text-xs text-muted">Saved 2 min ago</span>
              <ActionButton variant="secondary">
                <Save size={15} />
                Save
              </ActionButton>
              <ActionButton variant="primary">
                <PlayCircle size={15} />
                Run Test
              </ActionButton>
              <div className="h-5 w-px bg-line" />
              <ActionButton
                variant="secondary"
                disabled={role.promoteDisabled}
                title={role.promoteDisabled ? "Workspace Admin permission required." : undefined}
              >
                {isStaging ? "Promote to Production" : "Promote to Staging"}
              </ActionButton>
            </>
          )}
        </div>
      </div>

      {/* ── Production Status + Compare with Staging ────────── */}
      {isProd && (
        <div className="grid grid-cols-[2fr_3fr] gap-3">

          {/* Production Status */}
          <div className="rounded-lg border border-line bg-white p-4">
            <div className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-muted">
              Production Status
            </div>
            <div className="space-y-2.5">
              {[
                { label: "Deployed version", value: "v2.4.1",                  cls: "font-mono font-semibold text-ink" },
                { label: "Deployed by",      value: "Sarah J.",                cls: "font-medium text-ink" },
                { label: "Deployed at",      value: "Apr 26, 2026 · 09:14",   cls: "text-ink" },
                { label: "Error rate",       value: "3.2% ↑",                 cls: "font-semibold text-danger" },
              ].map(({ label, value, cls }) => (
                <div key={label} className="flex items-center justify-between text-sm">
                  <span className="text-muted">{label}</span>
                  <span className={cls}>{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Compare with Staging */}
          <div className="rounded-lg border border-line bg-white p-4">
            <div className="mb-1 flex items-center gap-2">
              <GitBranch size={13} className="text-muted" />
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted">
                Compare with Staging
              </span>
              <Badge tone="warning">3 changes</Badge>
            </div>
            <p className="mb-3 text-xs text-muted">
              v2.4.1 (Production) vs v2.5.0 (Staging candidate)
            </p>
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-md border border-line bg-stone-50 p-3">
                <div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-muted">
                  Production v2.4.1
                </div>
                <p className="font-mono text-xs leading-5 text-stone-500">
                  If no order found after 10 min,{" "}
                  <span className="line-through text-danger">contact support</span>
                </p>
              </div>
              <div className="rounded-md border border-success/20 bg-success/5 p-3">
                <div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-success">
                  Staging v2.5.0
                </div>
                <p className="font-mono text-xs leading-5 text-stone-600">
                  If no order found after 15 min,{" "}
                  <span className="font-medium text-success">escalate to order team</span>
                </p>
              </div>
            </div>
            <button className="mt-3 text-xs font-medium text-accent hover:underline">
              View full diff →
            </button>
          </div>
        </div>
      )}

      {/* ── Main card ────────────────────────────────────────── */}
      <div
        key={isProd ? `card-glow-${cardGlowKey}` : "card"}
        className={isProd && cardGlowKey > 0 ? "prod-card-glow" : ""}
      >
        <Card className={`overflow-hidden ${isProd ? "ring-1 ring-red-100" : ""}`}>
          {tabBar}

          <div className="grid grid-cols-[1.2fr_0.8fr] divide-x divide-line">

            {/* ── Left column ──────────────────────────────── */}
            <div className="divide-y divide-line">

              {isProd ? (
                /* Production: Deployed Configuration */
                <div className="p-5 pb-4">
                  <div className="mb-3 flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-semibold text-ink">Deployed Configuration</h2>
                      <p className="mt-0.5 text-xs text-muted">Currently active in Production</p>
                    </div>
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-success/25 bg-success/10 px-2.5 py-1 text-xs font-semibold text-success">
                      <span className="h-1.5 w-1.5 rounded-full bg-success" />
                      Live
                    </span>
                  </div>

                  {/* Version metadata */}
                  <div className="mb-3 flex items-center gap-3 rounded-md border border-line bg-stone-50 px-3 py-2 text-xs text-muted">
                    <span className="font-mono font-semibold text-ink">v2.4.1</span>
                    <span className="text-stone-300">·</span>
                    <span>Promoted by <span className="font-medium text-ink">Sarah J.</span></span>
                    <span className="text-stone-300">·</span>
                    <span>2h ago</span>
                    <span className="text-stone-300">·</span>
                    <span className="text-success">Stable</span>
                  </div>

                  {/* Instructions display */}
                  {isUnlocked ? (
                    /* Unlocked: editable textarea */
                    <>
                      <div className="mb-1.5 flex items-center gap-1.5 rounded-md border border-red-200 bg-red-50 px-2.5 py-1.5 text-xs text-red-600">
                        <TriangleAlert size={11} className="shrink-0" />
                        Direct Production edits affect live users immediately. Prefer promoting from Staging.
                      </div>
                      <textarea
                        value={instructions}
                        onChange={(e) => setInstructions(e.target.value)}
                        className="min-h-[360px] w-full resize-none rounded-md border border-red-200 bg-white p-3 font-mono text-sm leading-6 text-ink outline-none focus:border-red-400"
                      />
                      <div className="mt-1.5 flex items-center justify-end gap-2 text-[11px] text-muted">
                        <span>{characterCount} characters</span>
                        <span className="text-stone-300">·</span>
                        <span className="text-red-500">Unsaved in Production</span>
                      </div>
                    </>
                  ) : (
                    /* Locked: read-only snapshot */
                    <>
                      <div className="min-h-[360px] overflow-auto rounded-md border border-line bg-stone-50 p-4 font-mono text-sm leading-6 text-stone-600">
                        <pre className="whitespace-pre-wrap">{instructions}</pre>
                      </div>
                      <div className="mt-1.5 flex items-center justify-end gap-2 text-[11px] text-muted">
                        <span>{characterCount} characters</span>
                        <span className="text-stone-300">·</span>
                        <span className="text-success">Deployed</span>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                /* Development: editable Instructions */
                <div className="p-5 pb-4">
                  <div className="mb-3">
                    <h2 className="text-lg font-semibold text-ink">Instructions</h2>
                    <p className="mt-0.5 text-xs text-muted">Define role, behavior, tone, and escalation logic.</p>
                  </div>
                  <textarea
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    className="min-h-[400px] w-full resize-none rounded-md border border-line bg-white p-3 font-mono text-sm leading-6 text-ink outline-none focus:border-accent"
                  />
                  <div className="mt-1.5 flex items-center justify-end gap-2 text-[11px] text-muted">
                    <span>{characterCount} characters</span>
                    <span className="text-stone-300">·</span>
                    <span className="text-success">Saved</span>
                  </div>
                </div>
              )}

              {/* Capabilities — shared, but read-only indicator differs */}
              <div className="px-5 py-4">
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-semibold text-ink">
                      {isProd ? "Active Capabilities" : "Capabilities"}
                    </h2>
                    <p className="mt-0.5 text-xs text-muted">
                      {isProd
                        ? "Tools connected to the live Production agent."
                        : "Tools and integrations available to this agent."}
                    </p>
                  </div>
                  {!isProd && (
                    <ActionButton variant="secondary" className="h-7 px-2 text-xs">
                      <Wrench size={13} />
                      {role.capabilityAction}
                    </ActionButton>
                  )}
                </div>
                {capabilityList(isProd)}
              </div>
            </div>

            {/* ── Right column ─────────────────────────────── */}
            {isProd
              ? testPanel("Live Validation", "Validate Production")
              : testPanel("Test", "Run Test")
            }
          </div>
        </Card>
      </div>

      {/* ════════════════════════════════════════════════════════
          Production-only secondary sections
      ════════════════════════════════════════════════════════ */}
      {isProd && (
        <>
          {/* ── Deployment History ──────────────────────────── */}
          {collapsible(
            <Clock size={14} className="text-muted" />,
            "Deployment History",
            null,
            showHistory,
            () => setShowHistory((v) => !v),
            <div className="divide-y divide-line">
              {deploymentHistory.map((d, i) => {
                const s = deployStatusStyle[d.status];
                return (
                  <div key={i} className="flex items-center gap-4 px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className={`h-2 w-2 shrink-0 rounded-full ${s.dot}`} />
                      <span className="w-12 font-mono text-xs font-semibold text-ink">{d.version}</span>
                    </div>
                    <span className={`w-24 text-[10px] font-bold tracking-wide ${s.labelColor}`}>
                      {s.label}
                    </span>
                    <span className="flex-1 text-xs text-muted">{d.note}</span>
                    <div className="flex items-center gap-3 text-xs text-muted">
                      <span>{d.by}</span>
                      <span>{d.time}</span>
                    </div>
                  </div>
                );
              })}
            </div>,
          )}

          {/* ── Governance & Access ─────────────────────────── */}
          {collapsible(
            <Shield size={14} className="text-muted" />,
            "Governance & Access",
            null,
            showGovernance,
            () => setShowGovernance((v) => !v),
            <div className="grid grid-cols-3 gap-0 divide-x divide-line p-0">
              {/* Approval Status */}
              <div className="p-4">
                <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted">
                  Approval Status
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle size={13} className="text-success" />
                  <span className="text-xs font-semibold text-success">Approved</span>
                </div>
                <p className="mt-1 text-xs text-muted">By Sarah J. · 2h ago</p>
                <p className="mt-0.5 text-xs text-muted">Org Admin · Workspace Admin sign-off</p>
              </div>
              {/* Access Control */}
              <div className="p-4">
                <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted">
                  Access Control
                </div>
                <div className="flex items-center gap-1.5">
                  <User size={13} className="text-muted" />
                  <span className="text-xs font-medium text-ink">Edit restricted</span>
                </div>
                <p className="mt-1 text-xs text-muted">Requires Workspace Admin</p>
                <p className="mt-0.5 text-xs text-muted">Currently locked · No active editor</p>
              </div>
              {/* Promotion Path */}
              <div className="p-4">
                <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted">
                  Promotion Path
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted">
                  <span className="font-medium text-ink">Dev</span>
                  <span>→</span>
                  <span className="font-medium text-ink">Staging</span>
                  <span>→</span>
                  <span className="font-medium text-success">Production ✓</span>
                </div>
                <p className="mt-1 text-xs text-muted">Standard 3-stage pipeline</p>
                <p className="mt-0.5 text-xs text-muted">Last full cycle: 3d ago</p>
              </div>
            </div>,
          )}
        </>
      )}

      {/* ── Development-only: test results + context ─────────── */}
      {!isProd && (
        <>
          <div className="rounded-lg border border-line bg-white">
            <button
              onClick={() => setShowQuality((v) => !v)}
              className="flex w-full items-center justify-between px-4 py-3 text-left"
            >
              <span className="text-sm font-medium text-ink">Test results</span>
              <div className="flex items-center gap-2">
                {failedCount > 0 && (
                  <span className="text-xs text-muted">{failedCount} case needs attention</span>
                )}
                <ChevronDown
                  size={14}
                  className={`text-muted transition-transform ${showQuality ? "rotate-180" : ""}`}
                />
              </div>
            </button>
            {showQuality && (
              <div className="border-t border-line p-4">
                <DataTable<ImpactRow>
                  rows={impactRows}
                  getRowKey={(row) => row.id}
                  columns={[
                    { key: "case",   header: "Test case", render: (row) => <span className="font-medium text-ink">{row.testCase}</span> },
                    { key: "area",   header: "Area",      render: (row) => <span className="text-muted">{row.area}</span> },
                    { key: "result", header: "Result",    render: (row) => <Badge tone={resultTone(row.result)}>{row.result}</Badge> },
                  ]}
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Card className="p-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-ink">
                <BookOpen size={15} className="text-accent" />
                Knowledge
              </div>
              <div className="mt-1 text-xs text-muted">
                Payment FAQ and refund policy references are current.
              </div>
            </Card>
            <Card className="p-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-ink">
                <Wrench size={15} className="text-accent" />
                Tool scope
              </div>
              <div className="mt-1 text-xs text-muted">
                Payment status lookup is available in {app.environment}.
              </div>
            </Card>
          </div>
        </>
      )}

    </div>
  );
}
