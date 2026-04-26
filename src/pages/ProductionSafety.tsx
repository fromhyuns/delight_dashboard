import { AlertTriangle, GitCompareArrows, Lock, RotateCcw, ShieldCheck } from "lucide-react";
import { useState } from "react";
import type { AppState } from "../App";
import { ActionButton } from "../components/ui/ActionButton";
import { Badge } from "../components/ui/Badge";
import { Card } from "../components/ui/Card";
import { DataTable } from "../components/ui/DataTable";
import { MetricCard } from "../components/ui/MetricCard";
import { StatusChip } from "../components/ui/StatusChip";

type PageProps = {
  app: AppState;
};

type ApprovalStep = {
  id: string;
  step: string;
  owner: string;
  status: string;
  detail: string;
};

type AreaRow = {
  id: string;
  area: string;
  impact: string;
  state: string;
};

type RoleAction = {
  label: string;
  enabled: boolean;
  reason?: string;
  nextStep?: string;
  variant?: "primary" | "secondary" | "quiet";
};

type ModalKind = "approval" | "deploy" | "rollback" | null;

const buildTabs = ["Development", "Knowledge", "Tools", "Workflow", "Configuration", "Production"];

const approvalSteps: ApprovalStep[] = [
  {
    id: "builder",
    step: "Builder Review",
    owner: "Sora Kim",
    status: "Complete",
    detail: "Staging comparison prepared",
  },
  {
    id: "workspace",
    step: "Workspace Admin Review",
    owner: "Naver Pay Admin",
    status: "In Progress",
    detail: "Readiness review pending",
  },
  {
    id: "org",
    step: "Org Admin Approval",
    owner: "Org Governance",
    status: "Waiting",
    detail: "Required before deploy",
  },
  {
    id: "deploy",
    step: "Auto Deploy",
    owner: "Release pipeline",
    status: "Locked",
    detail: "Starts after approval",
  },
];

const affectedAreas: AreaRow[] = [
  { id: "area-1", area: "Missing order after payment", impact: "1,240 conversations", state: "At Risk" },
  { id: "area-2", area: "Payment status lookup", impact: "Moderate test drift", state: "Attention" },
  { id: "area-3", area: "Refund handoff", impact: "No expected change", state: "Stable" },
  { id: "area-4", area: "Escalation routing", impact: "Review recommended", state: "Attention" },
];

function roleActions(role: AppState["role"]): RoleAction[] {
  if (role === "Workspace Admin") {
    return [
      { label: "Compare with Staging", enabled: true, variant: "secondary" },
      { label: "Request Approval", enabled: true, variant: "primary" },
      {
        label: "Rollback",
        enabled: false,
        reason: "Rollback requires active incident approval for this workspace.",
        nextStep: "Open rollback request with Org Admin.",
        variant: "secondary",
      },
      {
        label: "Unlock Editing",
        enabled: false,
        reason: "Production editing is locked until Org Admin approval.",
        nextStep: "Request final approval after review.",
        variant: "quiet",
      },
    ];
  }

  if (role === "Org Admin") {
    return [
      { label: "Unlock Editing", enabled: true, variant: "secondary" },
      { label: "Approve & Deploy", enabled: true, variant: "primary" },
      { label: "Rollback", enabled: true, variant: "secondary" },
      { label: "Compare with Staging", enabled: true, variant: "secondary" },
    ];
  }

  return [
    { label: "Compare with Staging", enabled: true, variant: "secondary" },
    { label: "View Performance", enabled: true, variant: "secondary" },
    { label: "Request Approval", enabled: true, variant: "primary" },
    {
      label: "Unlock Editing",
      enabled: false,
      reason: "Production edit requires Workspace Admin or Org Admin permission.",
      nextStep: "Request approval or continue changes in Development.",
      variant: "quiet",
    },
  ];
}

function roleMessage(role: AppState["role"]) {
  if (role === "Workspace Admin") {
    return "Read-only by default. You can compare, request approval, and prepare rollback when permitted.";
  }
  if (role === "Org Admin") {
    return "Final approval responsibility is active. Unlocking production editing should be used only for reviewed changes.";
  }
  return "Read-only production access. You can compare staging, view performance, and request approval.";
}

export function ProductionSafety({ app }: PageProps) {
  const actions = roleActions(app.role);
  const [modal, setModal] = useState<ModalKind>(null);

  function openAction(label: string) {
    if (label === "Request Approval") setModal("approval");
    if (label === "Approve & Deploy") setModal("deploy");
    if (label === "Rollback") setModal("rollback");
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-5">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-accent">Build</div>
          <h1 className="mt-1 text-2xl font-semibold text-ink">Production Safety</h1>
          <p className="mt-1 max-w-3xl text-sm text-muted">
            Guardrails for Payment Issue Resolver before live Production changes are approved or deployed.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ActionButton variant="secondary">
            <GitCompareArrows size={16} />
            Compare with Staging
          </ActionButton>
          <ActionButton variant="primary" onClick={() => setModal("approval")}>
            Request Approval
          </ActionButton>
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="flex items-center gap-1 border-b border-line px-3 pt-2">
          {buildTabs.map((tab) => (
            <button
              key={tab}
              className={`h-9 border-b-2 px-3 text-sm font-medium ${
                tab === "Production" ? "border-accent text-accent" : "border-transparent text-muted hover:text-ink"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="border-b border-amber-200 bg-amber-50 px-4 py-3">
          <div className="flex items-start gap-3">
            <AlertTriangle size={18} className="mt-0.5 text-warning" />
            <div>
              <div className="text-sm font-semibold text-ink">Production environment is live and may affect end users.</div>
              <div className="mt-0.5 text-xs text-muted">
                Changes require approval and remain read-only until the correct permission is granted.
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4 p-4">
          <div className="grid grid-cols-4 gap-3">
            <MetricCard label="Version" value="v2.3.1 Live" detail="Current production release" />
            <MetricCard label="Deployed" value="2 days ago" detail="Latest production deploy" />
            <MetricCard label="Deployed by" value="Minjun Lee" detail="Workspace release owner" />
            <MetricCard label="Success rate" value="91.2%" detail="Production · last 7 days" />
          </div>

          <div className="grid grid-cols-[0.9fr_1.1fr] gap-4">
            <Card className="p-4">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-semibold text-ink">Change Summary</h2>
                  <p className="text-xs text-muted">Compare Staging → Production</p>
                </div>
                <Badge tone="accent">12 changes</Badge>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  ["5", "Added"],
                  ["4", "Modified"],
                  ["3", "Deleted"],
                ].map(([value, label]) => (
                  <div key={label} className="rounded-md border border-line bg-stone-50 p-3">
                    <div className="text-xl font-semibold text-ink">{value}</div>
                    <div className="mt-1 text-xs text-muted">{label}</div>
                  </div>
                ))}
              </div>
              <div className="mt-3 rounded-md border border-line bg-white p-3 text-sm leading-6 text-muted">
                Staging includes updated payment lookup handling, revised escalation copy, and removed legacy duplicate
                payment fallback paths.
              </div>
            </Card>

            <Card className="p-4">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-base font-semibold text-ink">Impact Analysis</h2>
                <StatusChip status="Attention" />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="rounded-md border border-line p-3">
                  <div className="text-xs font-medium uppercase tracking-wide text-muted">Conversations affected</div>
                  <div className="mt-2 text-lg font-semibold text-ink">1,240</div>
                </div>
                <div className="rounded-md border border-line p-3">
                  <div className="text-xs font-medium uppercase tracking-wide text-muted">Success rate impact</div>
                  <div className="mt-2 text-lg font-semibold text-warning">-1.8 pts</div>
                </div>
                <div className="rounded-md border border-line p-3">
                  <div className="text-xs font-medium uppercase tracking-wide text-muted">Resolution time impact</div>
                  <div className="mt-2 text-lg font-semibold text-ink">+14 sec</div>
                </div>
              </div>
              <div className="mt-3">
                <DataTable<AreaRow>
                  rows={affectedAreas}
                  getRowKey={(row) => row.id}
                  columns={[
                    { key: "area", header: "Affected areas", render: (row) => <div className="font-medium">{row.area}</div> },
                    { key: "impact", header: "Impact", render: (row) => row.impact },
                    { key: "state", header: "State", render: (row) => <StatusChip status={row.state} /> },
                  ]}
                />
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-[1fr_0.9fr] gap-4">
            <Card className="p-4">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-base font-semibold text-ink">Approval Flow</h2>
                <Badge tone="neutral">Auto Deploy locked</Badge>
              </div>
              <div className="grid grid-cols-4 gap-3">
                {approvalSteps.map((step) => (
                  <div key={step.id} className="rounded-md border border-line bg-white p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="text-sm font-semibold text-ink">{step.step}</div>
                      <StatusChip status={step.status} />
                    </div>
                    <div className="mt-2 text-xs text-muted">{step.owner}</div>
                    <div className="mt-1 text-xs text-muted">{step.detail}</div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-4">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-semibold text-ink">Action Area</h2>
                  <p className="text-xs text-muted">{roleMessage(app.role)}</p>
                </div>
                <Badge tone={app.role === "Org Admin" ? "accent" : "neutral"}>{app.role}</Badge>
              </div>

              <div className="space-y-2">
                {actions.map((action) => (
                  <div key={action.label} className="rounded-md border border-line bg-white p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        {!action.enabled && <Lock size={15} className="text-muted" />}
                        {action.label === "Rollback" && action.enabled && <RotateCcw size={15} className="text-muted" />}
                        {action.label.includes("Approve") && action.enabled && <ShieldCheck size={15} className="text-accent" />}
                        <div className="text-sm font-semibold text-ink">{action.label}</div>
                      </div>
                      <ActionButton
                        variant={action.variant ?? "secondary"}
                        className="h-8 px-2.5 text-xs"
                        disabled={!action.enabled}
                        onClick={() => openAction(action.label)}
                        title={!action.enabled ? action.reason : undefined}
                      >
                        {action.enabled ? action.label : "Unavailable"}
                      </ActionButton>
                    </div>
                    {!action.enabled && (
                      <div className="mt-2 text-xs leading-5 text-muted">
                        <span className="font-medium text-ink">Reason:</span> {action.reason}
                        <br />
                        <span className="font-medium text-ink">Next step:</span> {action.nextStep}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </Card>
      {modal && (
        <ProductionModal kind={modal} role={app.role} onClose={() => setModal(null)} />
      )}
    </div>
  );
}

function ProductionModal({
  kind,
  role,
  onClose,
}: {
  kind: Exclude<ModalKind, null>;
  role: AppState["role"];
  onClose: () => void;
}) {
  const copy = {
    approval: {
      title: "Request production approval",
      body: "Submit the Staging to Production change summary to workspace reviewers. Production remains read-only while approval is pending.",
      primary: "Submit Request",
    },
    deploy: {
      title: "Confirm approve and deploy",
      body: "This approves the reviewed production change for Payment Issue Resolver and starts the controlled deployment flow.",
      primary: "Approve & Deploy",
    },
    rollback: {
      title: "Confirm rollback",
      body: "Rollback restores the previous live version v2.3.0 and records this action in the production audit trail.",
      primary: "Confirm Rollback",
    },
  }[kind];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/25 px-4">
      <div className="w-full max-w-md rounded-lg border border-line bg-white p-4 shadow-lg">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-line bg-stone-50 text-accent">
            {kind === "rollback" ? <RotateCcw size={17} /> : <ShieldCheck size={17} />}
          </div>
          <div>
            <h2 className="text-base font-semibold text-ink">{copy.title}</h2>
            <p className="mt-2 text-sm leading-6 text-muted">{copy.body}</p>
            <div className="mt-3 rounded-md border border-line bg-stone-50 p-2 text-xs text-muted">
              Role: <span className="font-medium text-ink">{role}</span> · Agent: Payment Issue Resolver
            </div>
          </div>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <ActionButton variant="secondary" onClick={onClose}>Cancel</ActionButton>
          <ActionButton variant={kind === "rollback" ? "secondary" : "primary"} onClick={onClose}>
            {copy.primary}
          </ActionButton>
        </div>
      </div>
    </div>
  );
}
