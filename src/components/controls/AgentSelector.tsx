import { agents } from "../../data/mockData";

type AgentSelectorProps = {
  workspaceId: string;
  value: string;
  onChange: (agentId: string) => void;
};

export function AgentSelector({ workspaceId, value, onChange }: AgentSelectorProps) {
  const options = agents.filter((agent) => agent.workspaceId === workspaceId);

  return (
    <label className="flex items-center gap-2 whitespace-nowrap text-xs text-muted">
      Agent
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-9 min-w-48 rounded-md border border-line bg-white px-2 text-sm font-medium text-ink outline-none focus:border-accent"
      >
        {options.map((agent) => (
          <option key={agent.id} value={agent.id}>
            {agent.name}
          </option>
        ))}
      </select>
    </label>
  );
}
