import type { Action, Agent, EnvironmentStatus, Permission, Role, Workspace } from "../types";

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
