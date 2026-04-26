import { BarChart3, Boxes, GitBranch, Search, SquareStack, TestTube2, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import type { AppState } from "../../App";
import { agents, workspaces } from "../../data/mockData";

type CommandItem = {
  id: string;
  label: string;
  sublabel?: string;
  icon: ReactNode;
  onSelect: () => void;
  idx: number;
};

type CommandSection = {
  title: string;
  items: CommandItem[];
};

type Props = {
  state: AppState;
  onClose: () => void;
};

export function CommandPalette({ state, onClose }: Props) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const normalized = query.trim().toLowerCase();

  function go(path: string) {
    navigate(path);
    onClose();
  }

  const sections = useMemo<CommandSection[]>(() => {
    const raw: Omit<CommandSection, "items"> & { items: Omit<CommandItem, "idx">[] }[] = [];

    if (!normalized) {
      const recentAgents = agents.filter((a) => ["refund-review", "catalog-monitor"].includes(a.id));
      const recentWs = workspaces.find((w) => w.id === "naver-pay");
      const recentItems: Omit<CommandItem, "idx">[] = [
        ...recentAgents.map((agent) => ({
          id: `recent-${agent.id}`,
          label: agent.name,
          sublabel: workspaces.find((w) => w.id === agent.workspaceId)?.name,
          icon: <SquareStack size={15} />,
          onSelect: () => {
            state.setWorkspaceId(agent.workspaceId);
            state.setAgentId(agent.id);
            go("/agent");
          },
        })),
        ...(recentWs
          ? [
              {
                id: `recent-ws-${recentWs.id}`,
                label: recentWs.name,
                sublabel: "Workspace",
                icon: <Boxes size={15} />,
                onSelect: () => {
                  state.setWorkspaceId(recentWs.id);
                  go("/workspace");
                },
              },
            ]
          : []),
      ];
      if (recentItems.length) raw.push({ title: "Recent", items: recentItems });
    }

    const filteredAgents = agents
      .filter((a) => !normalized || a.name.toLowerCase().includes(normalized))
      .slice(0, 5)
      .map((agent) => ({
        id: `agent-${agent.id}`,
        label: agent.name,
        sublabel: workspaces.find((w) => w.id === agent.workspaceId)?.name,
        icon: <SquareStack size={15} />,
        onSelect: () => {
          state.setWorkspaceId(agent.workspaceId);
          state.setAgentId(agent.id);
          go("/agent");
        },
      }));
    if (filteredAgents.length) raw.push({ title: "Agents", items: filteredAgents });

    const filteredWorkspaces = workspaces
      .filter((w) => !normalized || w.name.toLowerCase().includes(normalized))
      .slice(0, 4)
      .map((ws) => ({
        id: `ws-${ws.id}`,
        label: ws.name,
        sublabel: `${ws.agents} agents · ${ws.region}`,
        icon: <Boxes size={15} />,
        onSelect: () => {
          state.setWorkspaceId(ws.id);
          go("/workspace");
        },
      }));
    if (filteredWorkspaces.length) raw.push({ title: "Workspaces", items: filteredWorkspaces });

    const allActions = [
      {
        id: "action-build",
        label: "Open Build",
        sublabel: "Development environment",
        icon: <GitBranch size={15} />,
        path: "/build/development",
      },
      {
        id: "action-test",
        label: "Run Test",
        sublabel: "Run test suite for current agent",
        icon: <TestTube2 size={15} />,
        path: "/evaluate?tab=test-results",
      },
      {
        id: "action-evaluate",
        label: "View Evaluate",
        sublabel: "Evaluation dashboard",
        icon: <BarChart3 size={15} />,
        path: "/evaluate",
      },
    ];
    const filteredActions = allActions
      .filter(
        (a) =>
          !normalized ||
          a.label.toLowerCase().includes(normalized) ||
          a.sublabel.toLowerCase().includes(normalized),
      )
      .map((a) => ({
        id: a.id,
        label: a.label,
        sublabel: a.sublabel,
        icon: a.icon,
        onSelect: () => go(a.path),
      }));
    if (filteredActions.length) raw.push({ title: "Actions", items: filteredActions });

    let idx = 0;
    return raw.map((section) => ({
      ...section,
      items: section.items.map((item) => ({ ...item, idx: idx++ })),
    }));
  }, [normalized]);

  const flatItems = useMemo(() => sections.flatMap((s) => s.items), [sections]);

  useEffect(() => { setActiveIndex(0); }, [normalized]);
  useEffect(() => { inputRef.current?.focus(); }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") { onClose(); return; }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, flatItems.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        flatItems[activeIndex]?.onSelect();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [flatItems, activeIndex, onClose]);

  useEffect(() => {
    listRef.current
      ?.querySelector<HTMLElement>('[data-active="true"]')
      ?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/20" onClick={onClose} />

      <div className="fixed left-1/2 top-24 z-50 w-[560px] -translate-x-1/2 overflow-hidden rounded-lg border border-line bg-white shadow-xl">
        <div className="flex items-center gap-3 border-b border-line px-4">
          <Search size={16} className="shrink-0 text-muted" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search agents, workspaces, actions..."
            className="h-12 flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-muted"
          />
          <kbd className="shrink-0 rounded border border-line px-1.5 py-0.5 text-[10px] text-muted">
            ⌘K
          </kbd>
          <button
            onClick={onClose}
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded text-muted hover:bg-stone-100 hover:text-ink"
          >
            <X size={14} />
          </button>
        </div>

        <div ref={listRef} className="max-h-[420px] overflow-y-auto py-1.5">
          {flatItems.length === 0 ? (
            <p className="px-4 py-10 text-center text-sm text-muted">No results for "{query}"</p>
          ) : (
            sections.map((section) => (
              <div key={section.title}>
                <div className="px-4 pb-1 pt-3 text-[11px] font-semibold uppercase tracking-wide text-stone-400">
                  {section.title}
                </div>
                {section.items.map((item) => {
                  const isActive = activeIndex === item.idx;
                  return (
                    <button
                      key={item.id}
                      data-active={isActive}
                      onClick={item.onSelect}
                      onMouseEnter={() => setActiveIndex(item.idx)}
                      className={`flex w-full items-center gap-3 px-3 py-2 text-left transition-colors ${
                        isActive ? "bg-stone-50" : "hover:bg-stone-50/60"
                      }`}
                    >
                      <span
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md border transition-colors ${
                          isActive
                            ? "border-line bg-white shadow-sm text-ink"
                            : "border-transparent bg-stone-100 text-muted"
                        }`}
                      >
                        {item.icon}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-ink">
                          {item.label}
                        </span>
                        {item.sublabel && (
                          <span className="block truncate text-xs text-muted">{item.sublabel}</span>
                        )}
                      </span>
                      {isActive && (
                        <span className="shrink-0 rounded border border-line px-1.5 py-0.5 text-[10px] text-muted">
                          ↵
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        <div className="flex items-center gap-4 border-t border-line px-4 py-2 text-[11px] text-stone-400">
          <span>
            <kbd className="rounded border border-line px-1 py-0.5 text-[10px]">↑↓</kbd> navigate
          </span>
          <span>
            <kbd className="rounded border border-line px-1 py-0.5 text-[10px]">↵</kbd> open
          </span>
          <span>
            <kbd className="rounded border border-line px-1 py-0.5 text-[10px]">esc</kbd> close
          </span>
        </div>
      </div>
    </>
  );
}
