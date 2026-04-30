import { useEffect, useRef, useState, type ReactNode } from "react";
import { useLocation } from "react-router-dom";
import type { AppState } from "../../App";
import { LeftRail } from "./LeftRail";
import { ContextPanel } from "./ContextPanel";
import { TopBar } from "./TopBar";

type AppShellProps = {
  state: AppState;
  children: ReactNode;
};

export function AppShell({ state, children }: AppShellProps) {
  const location = useLocation();
  const isNoScrollPage =
    location.pathname === "/evaluate" || location.pathname.startsWith("/build");
  const [viewportWidth, setViewportWidth] = useState<number>(
    typeof window === "undefined" ? 1280 : window.innerWidth,
  );

  useEffect(() => {
    function onResize() {
      setViewportWidth(window.innerWidth);
    }

    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (location.pathname === "/workspace") {
      mainRef.current?.scrollTo({ top: 0 });
    }
  }, [state.workspace?.id, location.pathname]);

  useEffect(() => {
    if (location.pathname === "/agent") {
      mainRef.current?.scrollTo({ top: 0 });
    }
  }, [state.agent?.id, location.pathname]);

  const isMobile = viewportWidth < 768;
  const isTablet = viewportWidth >= 768 && viewportWidth < 1024;

  if (isMobile) {
    return (
      <div className="min-h-screen bg-canvas px-6 py-10 text-ink">
        <div className="mx-auto max-w-md rounded-xl border border-line bg-white p-6 shadow-sm">
          <h1 className="text-lg font-semibold">Desktop Recommended</h1>
          <p className="mt-2 text-sm text-muted">
            This dashboard supports full workflows on screens 1024px and wider.
          </p>
          <p className="mt-1 text-sm text-muted">
            On mobile, please use desktop or tablet for build, test, and evaluate actions.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-canvas text-ink">
      <TopBar state={state} />
      <div className="flex h-[calc(100vh-3.5rem)]">
        <LeftRail state={state} />
        {!isTablet && <ContextPanel state={state} />}
        <main ref={mainRef} className={`flex-1 ${isNoScrollPage ? "overflow-hidden" : "compact-scrollbar overflow-auto"}`}>
          <div
            className={`mx-auto max-w-[1440px] ${
              isNoScrollPage
                ? "flex h-full flex-col pt-5 pb-6"
                : "space-y-5 py-5"
            } ${isTablet ? "px-4" : "px-6"}`}
          >
            {isTablet && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-xs text-amber-800">
                Limited layout mode (768-1023px): side context panel is hidden for readability.
              </div>
            )}
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
