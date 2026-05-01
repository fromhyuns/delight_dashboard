import type { Action, Agent, EnvironmentStatus, Permission, Role, Workspace } from "../types";

export type TaskStatus = "Resolved" | "Escalated" | "Failed";

export type TaskRow = {
  id: string;
  task: string;
  status: TaskStatus;
  envTag: string;
  time: string;
};

type EnvStatus = "Stable" | "Attention" | "At Risk";
type Issue = { id: string; title: string; description: string };
type MetricData = { value: string; trend: { delta: string; positive: boolean }; detail?: string };

export type AgentPageData = {
  pipeline: {
    dev:     { label: string; status: EnvStatus; metric: string };
    staging: { label: string; status: EnvStatus; metric: string };
    prod:    { label: string; status: EnvStatus; metric: string };
  };
  issues: Issue[];
  conversations:   MetricData;
  successRate:     MetricData;
  resolutionTime:  MetricData;
  escalationRate:  MetricData;
  tasks: TaskRow[];
};

export const agentPageData: Record<string, AgentPageData> = {
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
      dev:     { label: "v0.9.1-dev",       status: "Attention", metric: "Draft changes pending" },
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
      dev:     { label: "v0.3.0-dev", status: "Stable", metric: "In development" },
      staging: { label: "—",          status: "Stable", metric: "Not yet run"    },
      prod:    { label: "—",          status: "Stable", metric: "Not deployed"   },
    },
    issues: [
      { id: "i-1", title: "Intent classification accuracy", description: "Current model accuracy in dev is 81.4%, below the 90% threshold required before staging. Booking change vs. cancellation intent is frequently confused." },
    ],
    conversations:  { value: "—",     trend: { delta: "No production data yet", positive: true  }, detail: "Not deployed" },
    successRate:    { value: "81.4%", trend: { delta: "Dev testing only",       positive: false } },
    resolutionTime: { value: "—",     trend: { delta: "No production data yet", positive: true  } },
    escalationRate: { value: "—",     trend: { delta: "No production data yet", positive: true  } },
    tasks: [
      { id: "t-1", task: "Booking change intent test",       status: "Resolved",  envTag: "DEV", time: "2h ago" },
      { id: "t-2", task: "Cancellation vs. change",          status: "Failed",    envTag: "DEV", time: "3h ago" },
      { id: "t-3", task: "Date modification request",        status: "Resolved",  envTag: "DEV", time: "4h ago" },
      { id: "t-4", task: "Guest count update",               status: "Resolved",  envTag: "DEV", time: "5h ago" },
      { id: "t-5", task: "Ambiguous request classification", status: "Failed",    envTag: "DEV", time: "6h ago" },
    ],
  },

  "ticket-routing": {
    pipeline: {
      dev:     { label: "v5.2.1-dev",        status: "Attention", metric: "Update in review"  },
      staging: { label: "v5.2.0 · candidate", status: "Stable",    metric: "All tests passed" },
      prod:    { label: "v5.1.8 · paused",    status: "At Risk",   metric: "Agent paused"     },
    },
    issues: [
      { id: "i-1", title: "Access review required",   description: "Security team flagged 2 permission scopes that require re-approval before the agent can resume. Review SLA is 48 hours." },
      { id: "i-2", title: "Routing policy conflict",  description: "Agent's routing rules conflict with updated tier-2 SLA policy rolled out on Apr 28. Manual override needed until agent is updated." },
      { id: "i-3", title: "Escalation queue backlog", description: "Pausing the agent caused 34 tickets to remain unrouted. Manual triage is ongoing; estimated 4-hour resolution." },
    ],
    conversations:  { value: "2,180",  trend: { delta: "−18.4% · agent paused",     positive: false }, detail: "Last active period" },
    successRate:    { value: "89.4%",  trend: { delta: "−1.1 pts before pause",      positive: false } },
    resolutionTime: { value: "3m 28s", trend: { delta: "+44s · queue backlog impact", positive: false } },
    escalationRate: { value: "15.2%",  trend: { delta: "+5.8 pts · backlog effect",  positive: false } },
    tasks: [
      { id: "t-1", task: "Tier-1 routing — billing",     status: "Escalated", envTag: "PROD", time: "1h ago" },
      { id: "t-2", task: "VIP ticket misroute",          status: "Failed",    envTag: "PROD", time: "2h ago" },
      { id: "t-3", task: "SLA breach — unrouted ticket", status: "Escalated", envTag: "PROD", time: "3h ago" },
      { id: "t-4", task: "Standard routing — refund",    status: "Resolved",  envTag: "PROD", time: "4h ago" },
      { id: "t-5", task: "Policy conflict — escalation", status: "Failed",    envTag: "PROD", time: "5h ago" },
    ],
  },
};

export const roles: Role[] = ["Agent Builder / Operator", "Workspace Admin", "Org Admin"];

export const workspaces: Workspace[] = [
  { id: "naver-pay", name: "Naver Pay Operations", owner: "NAVER Pay", region: "KR", agents: 8, activeRuns: 124 },
  { id: "shopping-support", name: "Shopping Support", owner: "NAVER Commerce", region: "KR", agents: 6, activeRuns: 88 },
  { id: "reservation-cx", name: "Reservation CX", owner: "NAVER Booking", region: "KR", agents: 5, activeRuns: 61 },
  { id: "global-care", name: "Global Customer Care", owner: "NAVER Cloud", region: "APAC", agents: 7, activeRuns: 203 },
];

export const agents: Agent[] = [
  {
    id: "refund-review",
    workspaceId: "naver-pay",
    name: "Payment Issue Resolver",
    purpose: "Resolves payment failures, missing order cases, and refund handoff decisions.",
    status: "Review",
    environment: "Production",
    qualityScore: 88,
    lastRun: "12 min ago",
    hasActivity: true,
  },
  {
    id: "refund-assistant",
    workspaceId: "naver-pay",
    name: "Refund Assistant",
    purpose: "Handles refund status questions and prepares support-ready summaries.",
    status: "Live",
    environment: "Production",
    qualityScore: 96,
    lastRun: "28 min ago",
  },
  {
    id: "transaction-failure",
    workspaceId: "naver-pay",
    name: "Transaction Failure Bot",
    purpose: "Classifies transaction failures and routes unclear cases to operations.",
    status: "Review",
    environment: "Staging",
    qualityScore: 91,
    lastRun: "41 min ago",
    hasActivity: true,
  },
  {
    id: "catalog-monitor",
    workspaceId: "shopping-support",
    name: "Catalog Monitor",
    purpose: "Flags listing anomalies before they reach customer-facing channels.",
    status: "Review",
    environment: "Staging",
    qualityScore: 91,
    lastRun: "31 min ago",
  },
  {
    id: "query-intent",
    workspaceId: "reservation-cx",
    name: "Reservation Change Triage",
    purpose: "Classifies booking change requests for customer experience analysts.",
    status: "Draft",
    environment: "Development",
    qualityScore: 84,
    lastRun: "1 hr ago",
  },
  {
    id: "ticket-routing",
    workspaceId: "global-care",
    name: "Ticket Routing Agent",
    purpose: "Routes incoming tickets to queues using policy and customer context.",
    status: "Paused",
    environment: "Production",
    qualityScore: 89,
    lastRun: "Yesterday",
  },
];

export const environmentStatuses: EnvironmentStatus[] = [
  { environment: "Development", status: "Healthy", version: "v0.18.4", lastUpdated: "12 min ago", incidents: 0 },
  { environment: "Staging", status: "Watching", version: "v0.18.2", lastUpdated: "42 min ago", incidents: 1 },
  { environment: "Production", status: "Restricted", version: "v0.17.9", lastUpdated: "2 hrs ago", incidents: 0 },
];

export const nextActions: Action[] = [
  {
    id: "act-1",
    title: "Review production escalation boundary for Payment Issue Resolver",
    ownerRole: "Workspace Admin",
    workspaceId: "commerce",
    agentId: "refund-review",
    priority: "High",
    due: "Today",
  },
  {
    id: "act-2",
    title: "Promote Catalog Monitor evaluation set after policy sign-off",
    ownerRole: "Agent Builder / Operator",
    workspaceId: "commerce",
    agentId: "catalog-monitor",
    priority: "Medium",
    due: "Tomorrow",
  },
  {
    id: "act-3",
    title: "Audit workspace-level deploy approvals",
    ownerRole: "Org Admin",
    workspaceId: "support",
    priority: "Medium",
    due: "This week",
  },
];

export const productionPermissions: Permission[] = [
  {
    id: "perm-1",
    area: "Deploy to production",
    productionAccess: "Approval required",
    approver: "Workspace Admin",
    updatedAt: "Apr 25",
  },
  {
    id: "perm-2",
    area: "Change customer-facing policy",
    productionAccess: "Blocked",
    approver: "Org Admin",
    updatedAt: "Apr 24",
  },
  {
    id: "perm-3",
    area: "Pause production agent",
    productionAccess: "Allowed",
    approver: "On-call Operator",
    updatedAt: "Apr 26",
  },
  {
    id: "perm-4",
    area: "Export evaluation traces",
    productionAccess: "Approval required",
    approver: "Security Reviewer",
    updatedAt: "Apr 22",
  },
];
