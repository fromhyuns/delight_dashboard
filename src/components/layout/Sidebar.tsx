import { BarChart3, Boxes, ClipboardCheck, Gauge, GitBranch, Settings, ShieldCheck, SquareStack } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";

const navItems = [
  { label: "Home", path: "/", icon: Gauge },
  { label: "Workspace", path: "/workspace", icon: Boxes },
  { label: "Agent Overview", path: "/agent", icon: SquareStack },
  { label: "Development", path: "/build/development", icon: GitBranch },
  { label: "Production Safety", path: "/build/production-safety", icon: ShieldCheck },
  { label: "Evaluate", path: "/evaluate", icon: BarChart3 },
];

export function Sidebar() {
  const location = useLocation();
  const isAgentWorkflow =
    location.pathname === "/agent" ||
    location.pathname === "/build/development" ||
    location.pathname === "/build/production-safety" ||
    location.pathname === "/evaluate";
  const agentItems = [
    { label: "Overview", path: "/agent", icon: SquareStack },
    { label: "Build", path: "/build/development", icon: GitBranch },
    { label: "Test", path: "/evaluate", icon: ClipboardCheck },
    { label: "Evaluate", path: "/evaluate", icon: BarChart3 },
    { label: "Settings", path: "/agent", icon: Settings },
  ];
  const items = isAgentWorkflow ? agentItems : navItems;

  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-black/20 bg-sidebar text-stone-200">
      <div className="border-b border-white/10 px-4 py-4">
        <div className="text-xs font-semibold uppercase tracking-wide text-stone-400">
          {isAgentWorkflow ? "Agent Workflow" : "Workflow"}
        </div>
      </div>
      <nav className="space-y-1 px-3 py-3">
        {items.map((item) => {
          const Icon = item.icon;
          const forceActive =
            (location.pathname === "/agent" && item.label === "Overview") ||
            ((location.pathname === "/build/development" || location.pathname === "/build/production-safety") &&
              item.label === "Build") ||
            (location.pathname === "/evaluate" && item.label === "Evaluate");
          return (
            <NavLink
              key={`${item.label}-${item.path}`}
              to={item.path}
              end={item.path === "/"}
              className={({ isActive }) => {
                const active = forceActive || (isActive && !isAgentWorkflow);
                return `flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium transition ${
                  active ? "bg-white/10 text-white" : "text-stone-300 hover:bg-white/5 hover:text-white"
                }`;
              }}
            >
              <Icon size={17} />
              {item.label}
            </NavLink>
          );
        })}
      </nav>
      <div className="mt-auto border-t border-white/10 p-4 text-xs leading-5 text-stone-400">
        Controlled operations workspace for builders, operators, and admins.
      </div>
    </aside>
  );
}
