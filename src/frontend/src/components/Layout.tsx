import { Sidebar } from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useSettings } from "@/hooks/useRoadwatch";
import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";
import { Menu, Radio, ShieldCheck } from "lucide-react";
import { type ReactNode, useEffect, useState } from "react";

function useClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);
  return now;
}

function SimulationBadge() {
  const { data: settings } = useSettings();
  const simulation = settings?.simulationMode ?? true;
  return (
    <span
      data-ocid="topbar.simulation_indicator"
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[0.65rem] uppercase tracking-wider",
        simulation
          ? "border-warning/40 bg-warning/10 text-warning"
          : "border-success/40 bg-success/10 text-success",
      )}
      title={
        simulation
          ? "Detection runs in clearly labelled simulation mode"
          : "Detection pipeline reports live model output"
      }
    >
      <Radio className="size-3" aria-hidden="true" />
      {simulation ? "Simulation mode" : "Live model"}
    </span>
  );
}

function TopBar({ onOpenNav }: { onOpenNav: () => void }) {
  const now = useClock();
  const time = now.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const date = now.toLocaleDateString(undefined, {
    weekday: "short",
    day: "2-digit",
    month: "short",
  });

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-card/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-card/80 lg:px-6">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="lg:hidden"
        aria-label="Open navigation"
        data-ocid="topbar.open_nav_button"
        onClick={onOpenNav}
      >
        <Menu className="size-5" aria-hidden="true" />
      </Button>

      <Link
        to="/"
        data-ocid="topbar.brand_link"
        className="flex items-center gap-2.5 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <span className="flex size-9 items-center justify-center rounded-lg gradient-primary text-primary-foreground shadow-sm">
          <ShieldCheck className="size-5" aria-hidden="true" />
        </span>
        <span className="flex flex-col leading-none">
          <span className="font-display text-lg font-bold tracking-tight text-foreground">
            ROAD<span className="text-accent">WATCH</span>
          </span>
          <span className="hidden font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground sm:block">
            Traffic Safety Console
          </span>
        </span>
      </Link>

      <div className="ml-auto flex items-center gap-3">
        <SimulationBadge />
        <div
          data-ocid="topbar.clock"
          className="hidden flex-col items-end leading-tight sm:flex"
        >
          <span className="font-mono-num text-sm font-semibold text-foreground">
            {time}
          </span>
          <span className="font-mono text-[0.6rem] uppercase tracking-wider text-muted-foreground">
            {date}
          </span>
        </div>
      </div>
    </header>
  );
}

export function Layout({ children }: { children: ReactNode }) {
  const [navOpen, setNavOpen] = useState(false);

  return (
    <div className="flex min-h-dvh bg-background">
      <aside className="hidden w-64 shrink-0 border-r border-sidebar-border lg:block">
        <div className="sticky top-0 h-dvh">
          <Sidebar />
        </div>
      </aside>

      <Sheet open={navOpen} onOpenChange={setNavOpen}>
        <SheetTrigger className="hidden" aria-hidden="true" tabIndex={-1} />
        <SheetContent
          side="left"
          className="w-72 border-sidebar-border bg-sidebar p-0"
        >
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <Sidebar onNavigate={() => setNavOpen(false)} />
        </SheetContent>
      </Sheet>

      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar onOpenNav={() => setNavOpen(true)} />
        <main className="flex-1 bg-background bg-grid px-4 py-6 lg:px-8 lg:py-8">
          <div className="mx-auto w-full max-w-7xl">{children}</div>
        </main>
        <footer className="border-t border-border bg-card px-4 py-4 text-center text-xs text-muted-foreground lg:px-8">
          <p>
            © {new Date().getFullYear()}. Built with love using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noreferrer"
              className="text-accent underline-offset-4 hover:underline"
            >
              caffeine.ai
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}
