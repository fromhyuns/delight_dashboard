import { Navigate, Route, Routes } from "react-router-dom";
import { useMemo, useState } from "react";
import { AppShell } from "./components/layout/AppShell";
import { agents, environmentStatuses, roles, workspaces } from "./data/mockData";
import type { Agent, Environment, Role, Workspace } from "./types";
import { HomeDashboard } from "./pages/HomeDashboard";
import { WorkspaceDetail } from "./pages/WorkspaceDetail";
import { AgentOverview } from "./pages/AgentOverview";
import { BuildDevelopment } from "./pages/BuildDevelopment";
import { ProductionSafety } from "./pages/ProductionSafety";
import { Evaluate } from "./pages/Evaluate";

export type AppState = {
  role: Role;
  workspace: Workspace;
  agent: Agent;
  environment: Environment;
  setRole: (role: Role) => void;
  setWorkspaceId: (id: string) => void;
  setAgentId: (id: string) => void;
  setEnvironment: (environment: Environment) => void;
};

export default function App() {
  const [role, setRole] = useState<Role>(roles[0]);
  const [workspaceId, setWorkspaceId] = useState(workspaces[0].id);
  const [agentId, setAgentId] = useState(agents[0].id);
  const [environment, setEnvironment] = useState<Environment>("Production");

  const workspace = useMemo(
    () => workspaces.find((item) => item.id === workspaceId) ?? workspaces[0],
    [workspaceId],
  );
  const workspaceAgents = useMemo(
    () => agents.filter((candidate) => candidate.workspaceId === workspace.id),
    [workspace.id],
  );
  const agent = useMemo(
    () => workspaceAgents.find((item) => item.id === agentId) ?? workspaceAgents[0] ?? agents[0],
    [agentId, workspaceAgents],
  );

  const state: AppState = {
    role,
    workspace,
    agent,
    environment,
    setRole,
    setWorkspaceId: (id) => {
      setWorkspaceId(id);
      const firstAgent = agents.find((candidate) => candidate.workspaceId === id);
      if (firstAgent && !agents.some((candidate) => candidate.id === agentId && candidate.workspaceId === id)) {
        setAgentId(firstAgent.id);
      }
    },
    setAgentId,
    setEnvironment,
  };

  return (
    <AppShell state={state}>
      <Routes>
        <Route path="/" element={<HomeDashboard app={state} />} />
        <Route path="/workspace" element={<WorkspaceDetail app={state} />} />
        <Route path="/agent" element={<AgentOverview app={state} />} />
        <Route path="/build/development" element={<BuildDevelopment app={state} />} />
        <Route path="/build/production-safety" element={<ProductionSafety app={state} />} />
        <Route path="/evaluate" element={<Evaluate app={state} environmentStatuses={environmentStatuses} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppShell>
  );
}
