export type Role = "Agent Builder / Operator" | "Workspace Admin" | "Org Admin";

export type Environment = "Development" | "Staging" | "Production";

export type EnvironmentStatus = {
  environment: Environment;
  status: "Healthy" | "Watching" | "Restricted" | "Pending approval";
  version: string;
  lastUpdated: string;
  incidents: number;
};

export type Workspace = {
  id: string;
  name: string;
  owner: string;
  region: string;
  agents: number;
  activeRuns: number;
};

export type Agent = {
  id: string;
  workspaceId: string;
  name: string;
  purpose: string;
  status: "Live" | "Draft" | "Review" | "Paused";
  environment: Environment;
  qualityScore: number;
  lastRun: string;
  hasActivity?: boolean;
};

export type Permission = {
  id: string;
  area: string;
  productionAccess: "Allowed" | "Approval required" | "Blocked";
  approver: string;
  updatedAt: string;
};

export type Action = {
  id: string;
  title: string;
  ownerRole: Role;
  workspaceId: string;
  agentId?: string;
  priority: "High" | "Medium" | "Low";
  due: string;
};
