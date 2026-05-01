import { Bot, Boxes, Gauge, Settings } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import type { ReactNode } from "react";
import type { AppState } from "../../App";
import { agents, workspaces } from "../../data/mockData";

type RailItem = {
  id: string;
  icon: ReactNode;
  label: string;
  to: string;
  activePaths: string[];
  exact?: boolean;
};

const topItems: RailItem[] = [
  { id: "dashboard", icon: <Gauge size={18} />,  label: "Dashboard", to: "/",          activePaths: ["/"],          exact: true },
  { id: "workspace", icon: <Boxes size={18} />,  label: "Workspace",  to: "/workspace", activePaths: ["/workspace"] },
  { id: "agent",     icon: <Bot size={18} />,    label: "Agent",      to: "/agent",     activePaths: ["/agent", "/build", "/evaluate"] },
];

const bottomItems: RailItem[] = [
  { id: "settings", icon: <Settings size={18} />, label: "Settings", to: "/", activePaths: [] },
];

export function LeftRail({ state, onExpandContext }: { state: AppState; onExpandContext: () => void }) {
  const location = useLocation();
  const navigate = useNavigate();

  function isActive(item: RailItem) {
    if (item.exact) return location.pathname === item.to;
    return item.activePaths.some((p) => location.pathname.startsWith(p));
  }

  function handleClick(item: RailItem) {
    if (item.id === "workspace" && workspaces.length > 0) {
      state.setWorkspaceId(workspaces[0].id);
      onExpandContext();
    } else if (item.id === "agent" && agents.length > 0) {
      state.setWorkspaceId(agents[0].workspaceId);
      state.setAgentId(agents[0].id);
      onExpandContext();
    }
    navigate(item.to);
  }

  return (
    <div className="flex h-full w-[68px] shrink-0 flex-col border-r border-black/25 bg-sidebar">
      <nav className="flex flex-1 flex-col items-center gap-0.5 pt-3">
        {topItems.map((item) => (
          <RailButton
            key={item.id}
            item={item}
            active={isActive(item)}
            onClick={() => handleClick(item)}
          />
        ))}
      </nav>
      <nav className="flex flex-col items-center gap-0.5 border-t border-white/10 py-3">
        {bottomItems.map((item) => (
          <RailButton
            key={item.id}
            item={item}
            active={isActive(item)}
            onClick={() => navigate(item.to)}
          />
        ))}
      </nav>
    </div>
  );
}

function RailButton({
  item,
  active,
  onClick,
}: {
  item: RailItem;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      title={item.label}
      className={`flex h-14 w-14 flex-col items-center justify-center gap-1 rounded-lg transition ${
        active
          ? "bg-white/20 text-white"
          : "text-stone-300 hover:bg-white/10 hover:text-white"
      }`}
    >
      {item.icon}
      <span className="text-[10px] font-medium leading-none tracking-wide">
        {item.label}
      </span>
    </button>
  );
}
