import {
  BarChart2, Bot, CheckCircle, ChevronDown, ChevronRight,
  BookOpen, Clock, Database, FilePlus2, FolderOpen, GitBranch, History,
  Lock, Save, Shield, TriangleAlert, X, Zap,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import type { AppState } from "../App";
import { ActionButton } from "../components/ui/ActionButton";

type PageProps = { app: AppState };

type DeployRecord = {
  version: string;
  status: "current" | "stable" | "rolled-back";
  by: string;
  time: string;
  note: string;
};

type SavedTask = {
  id: string;
  name: string;
  lastEdited: string;
};

type Tool = { id: string; name: string; description: string };
type KnowledgeSource = { id: string; name: string; type: string; linked: boolean };
type AgentBuildConfig = {
  defaultInstructions: string;
  tools: Tool[];
  defaultToolStates: Record<string, boolean>;
  knowledgeSources: KnowledgeSource[];
  savedTasks: SavedTask[];
  deploymentHistory: DeployRecord[];
  mock: {
    userMessage: string;
    primaryToolId: string;
    agentResponseWithTool: string;
    agentResponseWithoutTool: string;
    traceToolIds: string[];
    traceOutputByToolId: Record<string, string>;
    showEscalation: (ts: Record<string, boolean>) => boolean;
    escalationTrace: string;
  };
};

const agentBuildConfigs: Record<string, AgentBuildConfig> = {
  "refund-review": {
    defaultInstructions:
`You are Payment Issue Resolver for Naver Pay Operations.

Primary task: Identify and resolve payment failures, missing orders, and refund routing decisions.

Rules:
- Do not confirm a refund unless the payment record shows it initiated.
- Escalate if order and payment status disagree for more than 10 minutes.
- Always ask for transaction ID or order ID before drawing conclusions.
- Keep responses concise and operator-ready.`,
    tools: [
      { id: "payment-check",  name: "Payment Status Check", description: "Query payment gateway for current status" },
      { id: "order-lookup",   name: "Order Lookup",          description: "Retrieve order by ID or transaction ref" },
      { id: "refund-process", name: "Refund Process",        description: "Initiate and track refund requests"      },
      { id: "escalation",     name: "Escalation Handler",    description: "Route to manual review queue"            },
      { id: "notification",   name: "Notification Sender",   description: "Send status updates to customer"         },
    ],
    defaultToolStates: { "payment-check": true, "order-lookup": false, "refund-process": true, "escalation": true, "notification": false },
    knowledgeSources: [
      { id: "kb-1", name: "Payment Policy v3.2",        type: "PDF",        linked: true  },
      { id: "kb-2", name: "FAQ: Common Payment Issues", type: "Notion",     linked: true  },
      { id: "kb-3", name: "Refund Guidelines 2024",     type: "Google Doc", linked: false },
    ],
    savedTasks: [
      { id: "d-1", name: "Webhook timeout fix",   lastEdited: "2h ago" },
      { id: "d-2", name: "Refund flow update",    lastEdited: "1d ago" },
      { id: "d-3", name: "New escalation rules",  lastEdited: "3d ago" },
    ],
    deploymentHistory: [
      { version: "v2.4.1", status: "current",     by: "Sarah J.", time: "2h ago", note: "Escalation timeout update"       },
      { version: "v2.4.0", status: "rolled-back", by: "Mike R.",  time: "1d ago", note: "Reverted — response degradation" },
      { version: "v2.3.2", status: "stable",      by: "Sarah J.", time: "3d ago", note: "Refund process refinement"       },
    ],
    mock: {
      userMessage: "I paid successfully but my order isn't showing. Transaction #NP-2412-8821",
      primaryToolId: "payment-check",
      agentResponseWithTool: "Found it. Transaction completed at 14:32 KST but the order wasn't created — looks like a webhook timeout. Flagging for manual order creation.",
      agentResponseWithoutTool: "Could you provide your order ID or transaction number so I can look into this?",
      traceToolIds: ["payment-check", "order-lookup"],
      traceOutputByToolId: { "payment-check": "Completed ✓ 14:32 KST", "order-lookup": "Order #NP-2412-8821 not found" },
      showEscalation: (ts) => !!(ts["escalation"] && ts["payment-check"]),
      escalationTrace: "Queued for manual review",
    },
  },

  "refund-assistant": {
    defaultInstructions:
`You are Refund Assistant for Naver Pay Operations.

Primary task: Handle refund status inquiries and prepare support-ready summaries for operators.

Rules:
- Always verify refund eligibility before proceeding.
- Do not initiate a refund without confirming the original transaction.
- Escalate disputes exceeding ₩500,000 to senior support.
- Keep responses brief and factual.`,
    tools: [
      { id: "refund-status",        name: "Refund Status Check",    description: "Query current refund processing status"       },
      { id: "transaction-lookup",   name: "Transaction Lookup",     description: "Retrieve original transaction details"        },
      { id: "customer-notification",name: "Customer Notification",  description: "Send refund status updates to customer"       },
      { id: "manual-escalation",    name: "Manual Escalation",      description: "Route complex refund cases to senior support" },
    ],
    defaultToolStates: { "refund-status": true, "transaction-lookup": true, "customer-notification": false, "manual-escalation": false },
    knowledgeSources: [
      { id: "kb-1", name: "Refund Policy v2.1",     type: "PDF",    linked: true  },
      { id: "kb-2", name: "Support Handbook",        type: "Notion", linked: true  },
      { id: "kb-3", name: "Customer FAQ — Refunds",  type: "Notion", linked: false },
    ],
    savedTasks: [
      { id: "d-1", name: "Refund status flow v2",          lastEdited: "3h ago" },
      { id: "d-2", name: "Escalation threshold update",    lastEdited: "2d ago" },
    ],
    deploymentHistory: [
      { version: "v1.8.1", status: "current", by: "Daniel C.", time: "28m ago", note: "Notification trigger fix"   },
      { version: "v1.8.0", status: "stable",  by: "Daniel C.", time: "3d ago",  note: "Eligibility check update"  },
      { version: "v1.7.4", status: "stable",  by: "Hana J.",   time: "1w ago",  note: "Response tone improvement" },
    ],
    mock: {
      userMessage: "My refund was approved 3 days ago but I still haven't received the money.",
      primaryToolId: "refund-status",
      agentResponseWithTool: "Your refund of ₩48,000 was approved on Apr 28 and is currently in bank processing. Typical transfer takes 3–5 business days. Expected by May 2.",
      agentResponseWithoutTool: "Could you share your order number or the refund request ID so I can check the status?",
      traceToolIds: ["refund-status", "transaction-lookup"],
      traceOutputByToolId: { "refund-status": "Processing · ETA May 2", "transaction-lookup": "Txn #RP-8821 — ₩48,000" },
      showEscalation: (ts) => !!(ts["manual-escalation"] && ts["refund-status"]),
      escalationTrace: "Routed to senior support",
    },
  },

  "transaction-failure": {
    defaultInstructions:
`You are Transaction Failure Bot for Naver Pay Operations.

Primary task: Classify transaction failures and route unclear cases to the operations team.

Rules:
- Always retrieve the transaction log before classifying.
- Distinguish between bank-side, gateway-side, and user-side failures.
- Escalate if classification confidence is below 80%.
- Do not confirm a refund — that is handled by Refund Assistant.`,
    tools: [
      { id: "failure-classifier", name: "Failure Classifier",    description: "Classify transaction failure type and cause"    },
      { id: "transaction-log",    name: "Transaction Log",        description: "Retrieve full transaction event log"            },
      { id: "routing-engine",     name: "Routing Engine",         description: "Route case to appropriate operations queue"     },
      { id: "escalation-handler", name: "Escalation Handler",     description: "Escalate low-confidence cases to senior ops"   },
      { id: "status-notifier",    name: "Status Notifier",        description: "Notify customer of failure resolution status"  },
    ],
    defaultToolStates: { "failure-classifier": true, "transaction-log": true, "routing-engine": true, "escalation-handler": false, "status-notifier": false },
    knowledgeSources: [
      { id: "kb-1", name: "Transaction Error Codes", type: "PDF",        linked: true  },
      { id: "kb-2", name: "Routing Rules v4",        type: "Notion",     linked: true  },
      { id: "kb-3", name: "Bank Response Guide",     type: "Google Doc", linked: false },
    ],
    savedTasks: [
      { id: "d-1", name: "Classification accuracy fix", lastEdited: "41m ago" },
      { id: "d-2", name: "Routing delay patch",         lastEdited: "2d ago"  },
    ],
    deploymentHistory: [
      { version: "v3.0.3", status: "current", by: "Mina P.",  time: "41m ago", note: "Classifier threshold tuned"  },
      { version: "v3.0.2", status: "stable",  by: "Mina P.",  time: "4d ago",  note: "Routing latency improved"    },
      { version: "v2.9.1", status: "stable",  by: "Sarah J.", time: "2w ago",  note: "Bank error code coverage"    },
    ],
    mock: {
      userMessage: "My payment failed but the money was deducted from my account.",
      primaryToolId: "failure-classifier",
      agentResponseWithTool: "Identified as a bank-side gateway timeout. Your payment was not captured — the deduction will reverse within 1–3 business days. Routing to ops queue for monitoring.",
      agentResponseWithoutTool: "Could you provide your transaction ID or the time of the failed payment so I can pull the log?",
      traceToolIds: ["transaction-log", "failure-classifier"],
      traceOutputByToolId: { "transaction-log": "Txn #TF-3391 · bank timeout", "failure-classifier": "Bank-side · confidence 94%" },
      showEscalation: (ts) => !!(ts["escalation-handler"] && ts["failure-classifier"]),
      escalationTrace: "Low-confidence case escalated",
    },
  },

  "catalog-monitor": {
    defaultInstructions:
`You are Catalog Monitor for Shopping Support.

Primary task: Detect and flag listing anomalies before they reach customer-facing channels.

Rules:
- Flag any price change exceeding 30% from 7-day baseline.
- Alert on out-of-stock listings still marked as available.
- Do not auto-correct listings — flag only, await admin approval.
- Prioritize high-traffic listings (top 1000 by weekly views).`,
    tools: [
      { id: "catalog-scanner",   name: "Catalog Scanner",    description: "Scan listings for anomalies and policy violations" },
      { id: "price-monitor",     name: "Price Monitor",      description: "Detect price changes against 7-day baseline"       },
      { id: "listing-validator", name: "Listing Validator",  description: "Validate listing content and availability status"  },
      { id: "alert-dispatcher",  name: "Alert Dispatcher",   description: "Send flagged listing alerts to review queue"       },
      { id: "content-checker",   name: "Content Checker",    description: "Check for policy-violating content in listings"    },
    ],
    defaultToolStates: { "catalog-scanner": true, "price-monitor": true, "listing-validator": false, "alert-dispatcher": true, "content-checker": false },
    knowledgeSources: [
      { id: "kb-1", name: "Catalog Policy v1.3",  type: "PDF",    linked: true  },
      { id: "kb-2", name: "Price Anomaly Guide",  type: "Notion", linked: true  },
      { id: "kb-3", name: "Listing Standards",    type: "PDF",    linked: false },
    ],
    savedTasks: [
      { id: "d-1", name: "Sync lag fix",               lastEdited: "31m ago" },
      { id: "d-2", name: "Price threshold update",     lastEdited: "1d ago"  },
      { id: "d-3", name: "Duplicate listing filter",   lastEdited: "4d ago"  },
    ],
    deploymentHistory: [
      { version: "v0.8.7", status: "current",     by: "Jisu H.",   time: "31m ago", note: "Draft changes pending"      },
      { version: "v0.8.5", status: "stable",      by: "Jisu H.",   time: "5d ago",  note: "Price threshold calibrated" },
      { version: "v0.8.0", status: "rolled-back", by: "Minwoo O.", time: "2w ago",  note: "Reverted — false positive spike" },
    ],
    mock: {
      userMessage: "There's a pricing error on product #SKU-4892 — it's showing ₩0.",
      primaryToolId: "catalog-scanner",
      agentResponseWithTool: "Confirmed. SKU-4892 shows ₩0 due to a failed price sync at 09:14. Flagged for immediate review — listing has been temporarily hidden from search results pending admin correction.",
      agentResponseWithoutTool: "Could you share the SKU or listing URL so I can scan it for anomalies?",
      traceToolIds: ["catalog-scanner", "price-monitor"],
      traceOutputByToolId: { "catalog-scanner": "SKU-4892 · price anomaly detected", "price-monitor": "₩0 vs ₩32,000 baseline (−100%)" },
      showEscalation: (ts) => !!(ts["alert-dispatcher"] && ts["catalog-scanner"]),
      escalationTrace: "Alert dispatched to review queue",
    },
  },

  "query-intent": {
    defaultInstructions:
`You are Reservation Change Triage for Reservation CX.

Primary task: Classify booking change requests and route them to the appropriate customer experience analyst.

Rules:
- Distinguish between date changes, guest count changes, and room type changes.
- Escalate ambiguous requests that could be either a change or a cancellation.
- Always confirm the booking reference before routing.
- Do not process the change — classify and route only.`,
    tools: [
      { id: "intent-classifier", name: "Intent Classifier",  description: "Classify booking change request type and intent" },
      { id: "booking-lookup",    name: "Booking Lookup",     description: "Retrieve booking details by reference ID"        },
      { id: "change-handler",    name: "Change Handler",     description: "Route classified request to appropriate queue"   },
      { id: "escalation",        name: "Escalation",         description: "Escalate ambiguous or high-value requests"      },
    ],
    defaultToolStates: { "intent-classifier": true, "booking-lookup": false, "change-handler": false, "escalation": false },
    knowledgeSources: [
      { id: "kb-1", name: "Booking Policy",        type: "PDF",    linked: true  },
      { id: "kb-2", name: "Change Request SOP",    type: "Notion", linked: false },
    ],
    savedTasks: [
      { id: "d-1", name: "Intent accuracy improvement", lastEdited: "1h ago" },
    ],
    deploymentHistory: [],
    mock: {
      userMessage: "I need to change my reservation from July 5th to July 8th for 2 guests.",
      primaryToolId: "intent-classifier",
      agentResponseWithTool: "Classified as a date change request (confidence 91%). Routing to the date-change queue for analyst review. Reference your booking ID for faster processing.",
      agentResponseWithoutTool: "Could you share your booking reference number so I can look up the reservation details?",
      traceToolIds: ["intent-classifier", "booking-lookup"],
      traceOutputByToolId: { "intent-classifier": "Date change · confidence 91%", "booking-lookup": "Booking not loaded yet" },
      showEscalation: (ts) => !!(ts["escalation"] && ts["intent-classifier"]),
      escalationTrace: "Routed to escalation queue",
    },
  },

  "ticket-routing": {
    defaultInstructions:
`You are Ticket Routing Agent for Global Customer Care.

Primary task: Route incoming support tickets to the correct queue using policy rules and customer context.

Rules:
- Match tickets to queues based on issue type, customer tier, and SLA requirements.
- Prioritize VIP and Tier-1 customers for expedited routing.
- Do not resolve tickets — classify and route only.
- Escalate any ticket where routing confidence is below 85%.`,
    tools: [
      { id: "ticket-parser",    name: "Ticket Parser",     description: "Parse ticket content and extract key attributes"    },
      { id: "policy-matcher",   name: "Policy Matcher",    description: "Match ticket attributes to routing policy rules"    },
      { id: "queue-router",     name: "Queue Router",      description: "Route ticket to the appropriate support queue"      },
      { id: "priority-scorer",  name: "Priority Scorer",   description: "Score ticket priority based on customer tier + SLA" },
      { id: "escalation-handler", name: "Escalation Handler", description: "Handle low-confidence or policy-conflict cases" },
    ],
    defaultToolStates: { "ticket-parser": true, "policy-matcher": true, "queue-router": true, "priority-scorer": false, "escalation-handler": false },
    knowledgeSources: [
      { id: "kb-1", name: "Routing Policy v5.2",     type: "PDF",        linked: true  },
      { id: "kb-2", name: "Tier SLA Guidelines",     type: "Notion",     linked: true  },
      { id: "kb-3", name: "Access Policy Rev.3",     type: "Google Doc", linked: false },
    ],
    savedTasks: [
      { id: "d-1", name: "Policy conflict fix",    lastEdited: "18m ago" },
      { id: "d-2", name: "Routing rule update",    lastEdited: "3d ago"  },
      { id: "d-3", name: "Access review patch",    lastEdited: "1w ago"  },
    ],
    deploymentHistory: [
      { version: "v5.1.8", status: "current",     by: "Chris M.", time: "Paused",  note: "Agent paused — access review"  },
      { version: "v5.1.7", status: "rolled-back", by: "Chris M.", time: "2d ago",  note: "Reverted — policy conflict"    },
      { version: "v5.1.5", status: "stable",      by: "Amy S.",   time: "1w ago",  note: "Tier-2 SLA rules updated"      },
    ],
    mock: {
      userMessage: "I've been waiting 3 days for a response to my billing issue. This is unacceptable.",
      primaryToolId: "policy-matcher",
      agentResponseWithTool: "Ticket matched to Tier-1 billing queue (priority: High, SLA: 4h). Routing now — you'll receive a confirmation and an assigned agent within the hour.",
      agentResponseWithoutTool: "Could you provide your ticket ID or account number so I can retrieve the details and route this correctly?",
      traceToolIds: ["ticket-parser", "policy-matcher"],
      traceOutputByToolId: { "ticket-parser": "Type: billing · tier-1 customer", "policy-matcher": "Queue: billing-priority · SLA 4h" },
      showEscalation: (ts) => !!(ts["escalation-handler"] && ts["policy-matcher"]),
      escalationTrace: "Policy conflict — escalated",
    },
  },
};

const deployStatusStyle: Record<DeployRecord["status"], { dot: string; label: string; labelColor: string }> = {
  "current":     { dot: "bg-success",   label: "CURRENT",     labelColor: "text-success" },
  "stable":      { dot: "bg-stone-300", label: "STABLE",      labelColor: "text-muted"   },
  "rolled-back": { dot: "bg-danger",    label: "ROLLED BACK", labelColor: "text-danger"  },
};

function SectionHeader({
  number, title, isOpen, onClick, badge,
}: {
  number: string;
  title: string;
  isOpen: boolean;
  onClick: () => void;
  badge?: ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-3 px-5 py-4 text-left transition hover:bg-stone-50"
    >
      <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold transition ${
        isOpen ? "bg-stone-800 text-white" : "bg-stone-100 text-stone-500"
      }`}>
        {number}
      </div>
      <span className="flex-1 text-sm font-semibold text-ink">{title}</span>
      {badge}
      <ChevronRight size={14} className={`shrink-0 text-stone-400 transition-transform ${isOpen ? "rotate-90" : ""}`} />
    </button>
  );
}

function ToolToggle({ enabled, onChange }: { enabled: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className={`relative h-5 w-9 shrink-0 overflow-hidden rounded-full transition-colors ${
        enabled ? "bg-accent" : "bg-stone-200"
      }`}
    >
      <span className={`absolute left-0 top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
        enabled ? "translate-x-[18px]" : "translate-x-[2px]"
      }`} />
    </button>
  );
}

/* ── Entry modal ─────────────────────────────────────────── */
function EntryModal({
  savedTasks,
  onConfirm,
  onClose,
}: {
  savedTasks: SavedTask[];
  onConfirm: (name: string, isNew: boolean) => void;
  onClose: () => void;
}) {
  const [step, setStep]           = useState<"choose" | "name" | "resume">("choose");
  const [nameInput, setNameInput] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (step === "name") inputRef.current?.focus();
  }, [step]);

  const canConfirm =
    (step === "name" && nameInput.trim().length > 0) ||
    (step === "resume" && selectedId !== null);

  const handleConfirm = () => {
    if (!canConfirm) return;
    if (step === "name") {
      onConfirm(nameInput.trim(), true);
    } else {
      const draft = savedTasks.find((d) => d.id === selectedId);
      onConfirm(draft?.name ?? "", false);
    }
  };

  const headerTitle = {
    choose: "How do you want to start?",
    name:   "Name your task",
    resume: "Continue a task",
  }[step];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/25 backdrop-blur-[2px]">
      <div className="w-[440px] overflow-hidden rounded-xl border border-line bg-white shadow-xl">

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4">
          <div className="text-sm font-semibold text-ink">{headerTitle}</div>
          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-muted transition hover:bg-stone-100 hover:text-ink"
          >
            <X size={15} />
          </button>
        </div>

        {/* Step: choose */}
        {step === "choose" && (
          <div className="flex gap-3 px-5 pb-5">
            <button
              onClick={() => setStep("name")}
              className="flex-1 rounded-lg border border-line p-5 text-left transition hover:border-accent hover:bg-accentSoft"
            >
              <FilePlus2 size={22} className="mb-3 text-stone-400" />
              <div className="text-sm font-semibold text-ink">New task</div>
              <div className="mt-0.5 text-xs text-muted">Start from scratch</div>
            </button>
            <button
              onClick={() => setStep("resume")}
              className="flex-1 rounded-lg border border-line p-5 text-left transition hover:border-accent hover:bg-accentSoft"
            >
              <History size={22} className="mb-3 text-stone-400" />
              <div className="text-sm font-semibold text-ink">Continue a task</div>
              <div className="mt-0.5 text-xs text-muted">{savedTasks.length} saved tasks</div>
            </button>
          </div>
        )}

        {/* Step: name */}
        {step === "name" && (
          <div className="p-5">
            <input
              ref={inputRef}
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && canConfirm) handleConfirm(); }}
              placeholder="e.g. Webhook timeout fix"
              className="w-full rounded-md border border-line bg-white px-3 py-2.5 text-sm text-ink outline-none placeholder:text-stone-400 focus:border-accent"
            />
          </div>
        )}

        {/* Step: resume */}
        {step === "resume" && (
          <div className="space-y-1 p-5">
            {savedTasks.map((draft) => (
              <button
                key={draft.id}
                onClick={() => setSelectedId(draft.id)}
                className={`w-full rounded-md border px-3 py-2.5 text-left transition ${
                  selectedId === draft.id
                    ? "border-accent bg-accentSoft"
                    : "border-line hover:bg-stone-50"
                }`}
              >
                <div className="text-sm font-medium text-ink">{draft.name}</div>
                <div className="mt-0.5 text-[10px] text-muted">Last edited {draft.lastEdited}</div>
              </button>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className={`flex items-center px-5 pb-5 ${step === "choose" ? "justify-end" : "justify-between"}`}>
          {step !== "choose" && (
            <button
              onClick={() => { setStep("choose"); setNameInput(""); setSelectedId(null); }}
              className="text-sm text-muted transition hover:text-ink"
            >
              ← Back
            </button>
          )}
          {step !== "choose" && (
            <button
              disabled={!canConfirm}
              onClick={handleConfirm}
              className="rounded-md bg-stone-800 px-4 py-2 text-sm font-medium text-white transition hover:bg-stone-900 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Continue
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Main page ───────────────────────────────────────────── */
export function BuildDevelopment({ app }: PageProps) {
  const navigate = useNavigate();
  const buildConfig = agentBuildConfigs[app.agent?.id ?? ""] ?? agentBuildConfigs["refund-review"];
  const [showEntryModal, setShowEntryModal] = useState(true);
  const [draftName, setDraftName]           = useState("");
  const [openSection, setOpenSection]       = useState("define");
  const [instructions, setInstructions]     = useState("");
  const [toolStates, setToolStates]         = useState<Record<string, boolean>>({});
  const [versionNote, setVersionNote]       = useState("");
  const [isUnlocked, setIsUnlocked]         = useState(false);
  const [showHistory, setShowHistory]       = useState(false);
  const [showGovernance, setShowGovernance] = useState(false);
  const [cardGlowKey, setCardGlowKey]       = useState(0);
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

  useEffect(() => {
    setShowEntryModal(true);
    setDraftName("");
    setInstructions("");
    setToolStates({});
    setVersionNote("");
  }, [app.agent?.id]);

  const toggleSection = (id: string) =>
    setOpenSection((prev) => (prev === id ? "" : id));

  const toggleTool = (id: string) =>
    setToolStates((prev) => ({ ...prev, [id]: !prev[id] }));

  const enabledTools = useMemo(
    () => buildConfig.tools.filter((t) => toolStates[t.id]),
    [buildConfig.tools, toolStates],
  );

  const readiness = useMemo(() => [
    { label: "Instructions defined",      ok: instructions.trim().length > 50                  },
    { label: "At least 1 tool connected", ok: enabledTools.length > 0                          },
    { label: "Knowledge base linked",     ok: buildConfig.knowledgeSources.some((k) => k.linked) },
  ], [instructions, enabledTools, buildConfig.knowledgeSources]);

  const allReady = readiness.every((r) => r.ok);

  const mockTraceTools = buildConfig.tools.filter(
    (t) => toolStates[t.id] && buildConfig.mock.traceToolIds.includes(t.id),
  );

  const mockAgentResponse = toolStates[buildConfig.mock.primaryToolId]
    ? buildConfig.mock.agentResponseWithTool
    : buildConfig.mock.agentResponseWithoutTool;

  const cardHeight = isProd ? "calc(100vh - 13rem)" : "calc(100vh - 11rem)";

  return (
    <>
      {showEntryModal && (
        <EntryModal
          savedTasks={buildConfig.savedTasks}
          onConfirm={(name, isNew) => {
            setDraftName(name);
            if (isNew) {
              setInstructions("");
              setToolStates(Object.fromEntries(buildConfig.tools.map((t) => [t.id, false])));
              setVersionNote("");
            } else {
              setInstructions(buildConfig.defaultInstructions);
              setToolStates(buildConfig.defaultToolStates);
            }
            setShowEntryModal(false);
          }}
          onClose={() => navigate("/agent")}
        />
      )}

      <div className="flex flex-col gap-4">

        {/* ── Production guard banner ──────────────────────────── */}
        {isProd && (
          <div className="-mx-6 -mt-5 flex items-center justify-between border-b border-red-600/80 bg-red-700/85 px-6 py-2.5 text-sm">
            <div className="flex items-center gap-2 text-red-50">
              <TriangleAlert size={13} className="shrink-0" />
              <span className="font-semibold">Production environment</span>
              <span className="text-red-200/70">—</span>
              <span className="font-normal text-red-100/90">Changes apply immediately to 1,247 live users</span>
            </div>
            {isUnlocked ? (
              <button
                onClick={() => setIsUnlocked(false)}
                className="flex items-center gap-1.5 rounded border border-white/35 bg-white/15 px-2.5 py-1 text-xs font-medium text-red-50 transition hover:bg-white/25"
              >
                <Lock size={11} />Lock editing
              </button>
            ) : (
              <button
                onClick={() => setIsUnlocked(true)}
                className="rounded border border-white/35 bg-transparent px-2.5 py-1 text-xs font-medium text-red-50 transition hover:bg-white/10"
              >
                Unlock editing
              </button>
            )}
          </div>
        )}

        {/* ── Page header ──────────────────────────────────────── */}
        <div className="flex items-center justify-between gap-5">
          <div className="min-w-0">
            <div className="text-xs font-semibold uppercase tracking-wide text-accent">Build</div>
            <h1 className="mt-0.5 truncate text-2xl font-semibold text-ink">
              {draftName || "—"}
            </h1>
            {isProd && (
              <div className="mt-1.5 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-success/25 bg-success/10 px-2.5 py-0.5 text-xs font-medium text-success">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-success" />
                  Live · 1,247 active users
                </span>
                <span className="text-xs text-muted">v2.4.1 · Deployed 2h ago by Sarah J.</span>
                <span className="text-xs font-semibold text-danger">Error rate 3.2% ↑</span>
              </div>
            )}
          </div>

          <div className="flex shrink-0 items-center gap-2">
            {isProd ? (
              <>
                <ActionButton variant="secondary"><BarChart2 size={15} />View Performance</ActionButton>
                <ActionButton variant="secondary">
                  <GitBranch size={15} />
                  View diff
                  <span className="rounded-full bg-warning/20 px-1.5 py-0.5 text-[10px] font-bold text-warning">3</span>
                </ActionButton>
                {isUnlocked ? (
                  <button className="flex items-center gap-1.5 rounded-md bg-red-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-red-700">
                    <Save size={15} />Save to Production
                  </button>
                ) : (
                  <ActionButton variant="primary"><CheckCircle size={15} />Request Approval</ActionButton>
                )}
              </>
            ) : (
              <>
                <span className="text-xs text-muted">Saved 2 min ago</span>
                <ActionButton variant="secondary"><BookOpen size={15} />Guide</ActionButton>
                <ActionButton
                  variant="secondary"
                  onClick={() => setShowEntryModal(true)}
                >
                  <FolderOpen size={15} />Saved Drafts
                </ActionButton>
                <ActionButton variant="primary"><Save size={15} />Save</ActionButton>
              </>
            )}
          </div>
        </div>

        {/* ── Main: Accordion + Static Mock ───────────────────── */}
        {showEntryModal && (
          <div className="flex-1 rounded-lg border border-line bg-stone-50/50" style={{ height: cardHeight }} />
        )}
        {!showEntryModal && <div
          className={`relative overflow-hidden ${isProd && cardGlowKey > 0 ? "prod-card-glow" : ""}`}
          style={{ height: cardHeight }}
          key={isProd ? `card-glow-${cardGlowKey}` : "card"}
        >
          <div className={`flex h-full overflow-hidden rounded-lg border border-line bg-white ${isProd ? "ring-1 ring-red-100" : ""}`}>

            {/* ── Left: Accordion (50%) ────────────────────────── */}
            <div className="flex flex-1 flex-col border-r border-line">

              <div className="compact-scrollbar flex-1 overflow-y-auto">

                {/* ① Define */}
                <div className="border-b border-line">
                  <SectionHeader
                    number="1"
                    title="Define"
                    isOpen={openSection === "define"}
                    onClick={() => toggleSection("define")}
                    badge={
                      <CheckCircle
                        size={13}
                        className={instructions.trim().length > 50 ? "text-success" : "text-stone-300"}
                      />
                    }
                  />
                  {openSection === "define" && (
                    <div className="space-y-4 px-5 pb-5">
                      <div>
                        <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted">Task Instructions</div>
                        <textarea
                          value={instructions}
                          onChange={(e) => setInstructions(e.target.value)}
                          disabled={isProd && !isUnlocked}
                          className="h-52 w-full resize-none rounded-md border border-line bg-white p-3 font-mono text-[12px] leading-5 text-ink outline-none focus:border-accent disabled:bg-stone-50 disabled:text-stone-500"
                        />
                        <div className="mt-1 text-right text-[10px] text-muted">{instructions.length.toLocaleString()} chars</div>
                      </div>

                      <div>
                        <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted">Example Tasks</div>
                        <div className="space-y-1.5">
                          {["Paid but order missing", "Duplicate payment reported", "Refund eligibility check"].map((ex) => (
                            <div key={ex} className="flex items-center gap-1.5 rounded-md border border-line bg-stone-50 px-3 py-2 text-xs text-ink">
                              <span className="select-none text-stone-300">"</span>
                              {ex}
                              <span className="select-none text-stone-300">"</span>
                            </div>
                          ))}
                          <button className="w-full rounded-md border border-dashed border-stone-300 py-1.5 text-xs text-muted hover:border-stone-400 hover:text-ink">
                            + Add example
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* ② Connect */}
                <div className="border-b border-line">
                  <SectionHeader
                    number="2"
                    title="Connect"
                    isOpen={openSection === "connect"}
                    onClick={() => toggleSection("connect")}
                    badge={
                      <span className="text-[10px] font-semibold text-muted">
                        {enabledTools.length} tools
                      </span>
                    }
                  />
                  {openSection === "connect" && (
                    <div className="space-y-4 px-5 pb-5">
                      <div>
                        <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted">Tools</div>
                        <div className="space-y-1">
                          {buildConfig.tools.map((tool) => (
                            <div key={tool.id} className="flex items-center gap-3 rounded-md border border-line bg-white px-3 py-2.5">
                              <div className="min-w-0 flex-1">
                                <div className="text-xs font-medium text-ink">{tool.name}</div>
                                <div className="text-[10px] text-muted">{tool.description}</div>
                              </div>
                              <ToolToggle
                                enabled={toolStates[tool.id]}
                                onChange={() => toggleTool(tool.id)}
                              />
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted">Knowledge</div>
                        <div className="space-y-1">
                          {buildConfig.knowledgeSources.map((src) => (
                            <div key={src.id} className="flex items-center gap-3 rounded-md border border-line bg-white px-3 py-2.5">
                              <Database size={13} className="shrink-0 text-muted" />
                              <div className="min-w-0 flex-1">
                                <div className="text-xs font-medium text-ink">{src.name}</div>
                                <div className="text-[10px] text-muted">{src.type}</div>
                              </div>
                              {src.linked
                                ? <span className="text-[10px] font-semibold text-success">Linked</span>
                                : <button className="text-[10px] font-semibold text-accent hover:underline">Link</button>
                              }
                            </div>
                          ))}
                          <button className="w-full rounded-md border border-dashed border-stone-300 py-1.5 text-xs text-muted hover:border-stone-400 hover:text-ink">
                            + Add source
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* ③ Finalize */}
                <div className="border-b border-line">
                  <SectionHeader
                    number="3"
                    title="Finalize"
                    isOpen={openSection === "finalize"}
                    onClick={() => toggleSection("finalize")}
                    badge={
                      allReady
                        ? <CheckCircle size={13} className="text-success" />
                        : <span className="text-[10px] font-semibold text-muted">{readiness.filter((r) => r.ok).length}/{readiness.length}</span>
                    }
                  />
                  {openSection === "finalize" && (
                    <div className="space-y-4 px-5 pb-5">
                      <div>
                        <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted">Readiness</div>
                        <div className="space-y-2">
                          {readiness.map((item) => (
                            <div key={item.label} className="flex items-center gap-2 text-xs">
                              <CheckCircle
                                size={14}
                                className={`shrink-0 ${item.ok ? "text-success" : "text-stone-300"}`}
                              />
                              <span className={item.ok ? "text-ink" : "text-muted"}>{item.label}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted">Version Note</div>
                        <input
                          type="text"
                          value={versionNote}
                          onChange={(e) => setVersionNote(e.target.value)}
                          placeholder="Describe what changed..."
                          className="w-full rounded-md border border-line bg-white px-3 py-2 text-xs text-ink outline-none placeholder:text-stone-400 focus:border-accent"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Advanced */}
                <div>
                  <SectionHeader
                    number="···"
                    title="Advanced"
                    isOpen={openSection === "advanced"}
                    onClick={() => toggleSection("advanced")}
                  />
                  {openSection === "advanced" && (
                    <div className="space-y-3 px-5 pb-5">
                      <div>
                        <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted">Workflow</div>
                        <div className="rounded-md border border-dashed border-stone-300 bg-stone-50 py-6 text-center">
                          <p className="text-xs text-muted">Workflow configuration coming soon</p>
                        </div>
                      </div>

                      <div className="rounded-lg border border-line">
                        <button
                          onClick={() => setShowHistory((v) => !v)}
                          className="flex w-full items-center justify-between px-4 py-3 text-left"
                        >
                          <div className="flex items-center gap-2 text-xs font-medium text-ink">
                            <Clock size={13} className="text-muted" />Deployment History
                          </div>
                          <ChevronDown size={13} className={`text-muted transition-transform ${showHistory ? "rotate-180" : ""}`} />
                        </button>
                        {showHistory && (
                          <div className="divide-y divide-line border-t border-line">
                            {buildConfig.deploymentHistory.map((d, i) => {
                              const s = deployStatusStyle[d.status];
                              return (
                                <div key={i} className="flex items-center gap-3 px-4 py-2.5">
                                  <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${s.dot}`} />
                                  <span className="w-12 font-mono text-[11px] font-semibold text-ink">{d.version}</span>
                                  <span className={`w-20 text-[10px] font-bold ${s.labelColor}`}>{s.label}</span>
                                  <span className="min-w-0 flex-1 truncate text-[10px] text-muted">{d.note}</span>
                                  <span className="shrink-0 text-[10px] text-muted">{d.time}</span>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      <div className="rounded-lg border border-line">
                        <button
                          onClick={() => setShowGovernance((v) => !v)}
                          className="flex w-full items-center justify-between px-4 py-3 text-left"
                        >
                          <div className="flex items-center gap-2 text-xs font-medium text-ink">
                            <Shield size={13} className="text-muted" />Governance & Access
                          </div>
                          <ChevronDown size={13} className={`text-muted transition-transform ${showGovernance ? "rotate-180" : ""}`} />
                        </button>
                        {showGovernance && (
                          <div className="divide-y divide-line border-t border-line px-4 py-0">
                            {[
                              { label: "Approval",    value: "Approved · Sarah J.",        valueClass: "text-success" },
                              { label: "Edit access", value: "Workspace Admin",            valueClass: "text-ink"     },
                              { label: "Pipeline",    value: "Dev → Staging → Production", valueClass: "text-ink"     },
                            ].map((item) => (
                              <div key={item.label} className="flex items-center justify-between py-2.5 text-xs">
                                <span className="text-muted">{item.label}</span>
                                <span className={`font-medium ${item.valueClass}`}>{item.value}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Fixed bottom CTA */}
              {!isProd && (
                <div className="shrink-0 border-t border-line bg-white p-4">
                  <button
                    disabled={!allReady}
                    className="flex w-full items-center justify-center gap-2 rounded-md bg-stone-800 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-stone-900 disabled:cursor-not-allowed disabled:opacity-35"
                  >
                    {isStaging ? "Promote to Production" : "Send to Test"}
                    <ChevronRight size={14} className="shrink-0" />
                  </button>
                </div>
              )}
            </div>

            {/* ── Right: Static mock panel (50%) ──────────────── */}
            <div className="flex flex-1 flex-col overflow-hidden bg-stone-50/50">

              <div className="compact-scrollbar flex-1 overflow-y-auto p-5">
                <div className="mx-auto max-w-lg space-y-3">

                  {/* Simulated preview tag */}
                  <div className="flex justify-center">
                    <span className="rounded-full border border-stone-200 bg-white px-2.5 py-0.5 text-[10px] font-medium text-stone-400">
                      Simulated preview
                    </span>
                  </div>

                  {/* User message */}
                  <div className="flex justify-end">
                    <div className="max-w-[82%] rounded-2xl rounded-tr-sm bg-stone-900/[0.12] px-3.5 py-2.5 text-xs leading-5 text-stone-800">
                      {buildConfig.mock.userMessage}
                    </div>
                  </div>

                  {/* Tool traces */}
                  {mockTraceTools.length > 0 && (
                    <div className="space-y-1.5 pl-2">
                      {mockTraceTools.map((tool) => (
                        <div key={tool.id} className="flex items-center gap-2 rounded-md border border-stone-200 bg-white px-3 py-2 text-[11px]">
                          <Zap size={11} className="shrink-0 text-stone-400" />
                          <span className="font-medium text-stone-600">{tool.name}</span>
                          <span className="text-stone-300">→</span>
                          <span className="text-muted">
                            {buildConfig.mock.traceOutputByToolId[tool.id] ?? ""}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Agent response */}
                  <div className="flex items-start gap-2.5">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-stone-900/20">
                      <Bot size={13} className="text-white" />
                    </div>
                    <div className="max-w-[82%] rounded-2xl rounded-tl-sm border border-line bg-white px-3.5 py-2.5 text-xs leading-5 text-ink">
                      {mockAgentResponse}
                    </div>
                  </div>

                  {/* Escalation trace */}
                  {buildConfig.mock.showEscalation(toolStates) && (
                    <div className="pl-2">
                      <div className="flex items-center gap-2 rounded-md border border-stone-200 bg-white px-3 py-2 text-[11px]">
                        <Zap size={11} className="shrink-0 text-stone-400" />
                        <span className="font-medium text-stone-600">Escalation</span>
                        <span className="text-stone-300">→</span>
                        <span className="text-muted">{buildConfig.mock.escalationTrace}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Active tools bar */}
              {enabledTools.length > 0 && (
                <div className="shrink-0 border-t border-line bg-white px-5 py-2.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-muted">Active</span>
                    {enabledTools.map((t) => (
                      <span key={t.id} className="rounded border border-stone-200 bg-stone-50 px-2 py-0.5 text-[10px] font-medium text-stone-600">
                        {t.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}


            </div>
          </div>
        </div>}
      </div>
    </>
  );
}
