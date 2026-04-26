import { BookOpen, CheckCircle2, Lock, PlayCircle, Save, ShieldCheck, Wrench } from "lucide-react";
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

type Capability = {
  id: string;
  name: string;
  status: string;
  owner: string;
  locked?: boolean;
};

type ImpactRow = {
  id: string;
  testCase: string;
  area: string;
  result: "Passed" | "Failed" | "Unchanged";
};

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

const testScenarios = [
  "Paid but order missing",
  "Duplicate payment reported",
  "Refund status unclear",
  "Card verification failed",
];

const capabilities: Capability[] = [
  { id: "cap-1", name: "Payment Issue Detection", status: "Enabled", owner: "Sora Kim" },
  { id: "cap-2", name: "Payment Status Check", status: "Enabled", owner: "Payments Platform", locked: true },
  { id: "cap-3", name: "Refund Process", status: "Review", owner: "Sora Kim" },
  { id: "cap-4", name: "Payment Method Update", status: "Enabled", owner: "Workspace Admin" },
  { id: "cap-5", name: "Escalation", status: "Enabled", owner: "Operations" },
];

const impactRows: ImpactRow[] = [
  { id: "imp-1", testCase: "Missing order after payment", area: "Payment lookup", result: "Failed" },
  { id: "imp-2", testCase: "Duplicate payment handoff", area: "Escalation", result: "Passed" },
  { id: "imp-3", testCase: "Refund eligibility summary", area: "Refund Process", result: "Unchanged" },
  { id: "imp-4", testCase: "Card verification retry", area: "Payment Method Update", result: "Passed" },
];

function roleState(role: AppState["role"]) {
  if (role === "Workspace Admin") {
    return {
      helper: "Can edit, manage knowledge/tools, run readiness checks, and promote this draft to staging.",
      promoteDisabled: false,
      secondaryCta: "Manage Knowledge",
      governanceLabel: "Workspace managed",
    };
  }

  if (role === "Org Admin") {
    return {
      helper: "Can edit with governance indicators visible. Policy-controlled tools remain marked for review.",
      promoteDisabled: false,
      secondaryCta: "Review Policy",
      governanceLabel: "Governance visible",
    };
  }

  return {
    helper: "Can edit this assigned agent in Development. Governance-controlled tools are visible but locked.",
    promoteDisabled: true,
    secondaryCta: "View Locked Tools",
    governanceLabel: "Assigned editor",
  };
}

function resultTone(result: ImpactRow["result"]) {
  if (result === "Passed") return "success";
  if (result === "Failed") return "danger";
  return "neutral";
}

export function BuildDevelopment({ app }: PageProps) {
  const [activeTab, setActiveTab] = useState("Development");
  const [instructions, setInstructions] = useState(defaultInstructions);
  const [testEnvironment, setTestEnvironment] = useState<"Development" | "Staging">("Development");
  const role = roleState(app.role);
  const characterCount = useMemo(() => instructions.length.toLocaleString(), [instructions]);

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-5">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-accent">Build</div>
          <h1 className="mt-1 text-2xl font-semibold text-ink">Development</h1>
          <p className="mt-1 max-w-3xl text-sm text-muted">
            Edit Payment Issue Resolver safely in Development before testing and staging promotion.
          </p>
          <div className="mt-2 flex items-center gap-2">
            <Badge tone="accent">{role.governanceLabel}</Badge>
            <Badge tone="neutral">Saved 2 min ago</Badge>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ActionButton variant="secondary">
            <Save size={16} />
            Save
          </ActionButton>
          <ActionButton variant="secondary">
            <PlayCircle size={16} />
            Run Test
          </ActionButton>
          <ActionButton
            variant="primary"
            disabled={role.promoteDisabled}
            title={role.promoteDisabled ? "Workspace Admin permission required to promote to staging." : undefined}
          >
            Promote to Staging
          </ActionButton>
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="flex items-center gap-1 border-b border-line px-3 pt-2">
          {buildTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`h-9 border-b-2 px-3 text-sm font-medium ${
                activeTab === tab ? "border-accent text-accent" : "border-transparent text-muted hover:text-ink"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="border-b border-line bg-stone-50/60 px-4 py-2 text-sm text-muted">{role.helper}</div>

        <div className="grid grid-cols-[1.15fr_0.85fr] gap-4 p-4">
          <section className="space-y-4">
            <Card className="p-4">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-semibold text-ink">System Instructions</h2>
                  <p className="text-xs text-muted">Development draft for operator-reviewed payment support behavior.</p>
                </div>
                <div className="text-right text-xs text-muted">
                  <div>{characterCount} characters</div>
                  <div className="text-success">Saved</div>
                </div>
              </div>
              <textarea
                value={instructions}
                onChange={(event) => setInstructions(event.target.value)}
                className="min-h-[330px] w-full resize-none rounded-md border border-line bg-white p-3 font-mono text-sm leading-6 text-ink outline-none focus:border-accent"
              />
            </Card>

            <Card className="p-4">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-base font-semibold text-ink">Capability List</h2>
                <ActionButton variant="secondary" className="h-8 px-2.5 text-xs">
                  <Wrench size={14} />
                  {role.secondaryCta}
                </ActionButton>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {capabilities.map((capability) => {
                  const locked = capability.locked && app.role === "Agent Builder / Operator";
                  return (
                    <div
                      key={capability.id}
                      className={`rounded-md border border-line p-3 ${locked ? "bg-stone-50" : "bg-white"}`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-sm font-semibold text-ink">{capability.name}</div>
                          <div className="mt-1 text-xs text-muted">Owner: {capability.owner}</div>
                        </div>
                        {locked ? <Lock size={15} className="text-muted" /> : <StatusChip status={capability.status} />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </section>

          <aside className="space-y-4">
            <Card className="p-4">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-base font-semibold text-ink">Test Panel</h2>
                <select
                  value={testEnvironment}
                  onChange={(event) => setTestEnvironment(event.target.value as "Development" | "Staging")}
                  className="h-8 rounded-md border border-line bg-white px-2 text-xs font-medium text-ink outline-none focus:border-accent"
                >
                  <option value="Development">Development</option>
                  <option value="Staging">Staging</option>
                </select>
              </div>
              <div className="space-y-3">
                <div>
                  <div className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">Test scenarios</div>
                  <div className="space-y-1.5">
                    {testScenarios.map((scenario, index) => (
                      <button
                        key={scenario}
                        className={`flex w-full items-center justify-between rounded-md border px-3 py-2 text-left text-sm ${
                          index === 0 ? "border-violet-200 bg-accentSoft text-accent" : "border-line bg-white text-ink"
                        }`}
                      >
                        <span>{scenario}</span>
                        {index === 0 && <CheckCircle2 size={15} />}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="rounded-md border border-line bg-stone-50 p-3">
                  <div className="text-xs font-medium uppercase tracking-wide text-muted">Sample user message</div>
                  <p className="mt-2 text-sm leading-6 text-ink">
                    I paid successfully, but my order is not showing in Naver Pay. Can you check what happened?
                  </p>
                </div>

                <div className="rounded-md border border-line bg-white p-3">
                  <div className="text-xs font-medium uppercase tracking-wide text-muted">Agent response preview</div>
                  <p className="mt-2 text-sm leading-6 text-muted">
                    I can help check the payment and order creation state. Please provide the transaction ID or order ID,
                    then I will verify whether escalation is needed.
                  </p>
                </div>

                <ActionButton variant="primary" className="w-full">
                  <PlayCircle size={16} />
                  Run Test
                </ActionButton>
              </div>
            </Card>

            <Card className="p-4">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-semibold text-ink">Quality Checker</h2>
                  <p className="text-xs text-muted">Impact preview for the current draft.</p>
                </div>
                {app.role === "Org Admin" && (
                  <Badge tone="accent">
                    <span className="inline-flex items-center gap-1">
                      <ShieldCheck size={12} />
                      Policy visible
                    </span>
                  </Badge>
                )}
              </div>
              <DataTable<ImpactRow>
                rows={impactRows}
                getRowKey={(row) => row.id}
                columns={[
                  { key: "case", header: "Affected test case", render: (row) => <div className="font-medium">{row.testCase}</div> },
                  { key: "area", header: "Area", render: (row) => row.area },
                  { key: "result", header: "Result", render: (row) => <Badge tone={resultTone(row.result)}>{row.result}</Badge> },
                ]}
              />
            </Card>
          </aside>
        </div>
      </Card>

      <div className="grid grid-cols-3 gap-3">
        <Card className="p-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-ink">
            <BookOpen size={16} className="text-accent" />
            Knowledge sync
          </div>
          <div className="mt-1 text-xs text-muted">Payment FAQ and refund policy references are current.</div>
        </Card>
        <Card className="p-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-ink">
            <Wrench size={16} className="text-accent" />
            Tool boundary
          </div>
          <div className="mt-1 text-xs text-muted">Payment status lookup is available in Development.</div>
        </Card>
        <Card className="p-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-ink">
            <ShieldCheck size={16} className="text-accent" />
            Change impact
          </div>
          <div className="mt-1 text-xs text-muted">One failed case remains before staging promotion.</div>
        </Card>
      </div>
    </div>
  );
}
