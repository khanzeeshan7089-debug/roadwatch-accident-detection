import { cn } from "@/lib/utils";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  Activity,
  BarChart3,
  Bell,
  Camera,
  Car,
  LayoutDashboard,
  type LucideIcon,
  MapPin,
  Settings,
  ShieldAlert,
  Video,
} from "lucide-react";

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/live", label: "Live CCTV Monitoring", icon: Video },
  { to: "/cameras", label: "Camera Management", icon: Camera },
  { to: "/locations", label: "Location Management", icon: MapPin },
  { to: "/vehicles", label: "Vehicle Detection", icon: Car },
  { to: "/accidents", label: "Accident Detection", icon: ShieldAlert },
  { to: "/alerts", label: "Emergency Alerts", icon: Bell },
  { to: "/incidents", label: "Incident History", icon: Activity },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });

  return (
    <nav
      aria-label="Primary"
      data-ocid="nav.sidebar"
      className="flex h-full flex-col gap-1 overflow-y-auto bg-sidebar px-3 py-4"
    >
      <p className="px-3 pb-2 font-mono text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground">
        Operations
      </p>
      {NAV_ITEMS.map((item) => {
        const active =
          item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
        const Icon = item.icon;
        return (
          <Link
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            data-ocid={`nav.link.${item.label.toLowerCase().replace(/[^a-z0-9]+/g, "_")}`}
            aria-current={active ? "page" : undefined}
            className={cn(
              "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-smooth",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring",
              active
                ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-[inset_2px_0_0_0_var(--accent)]"
                : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
            )}
          >
            <Icon
              className={cn(
                "size-4 shrink-0 transition-colors",
                active
                  ? "text-accent"
                  : "text-muted-foreground group-hover:text-accent",
              )}
              aria-hidden="true"
            />
            <span className="truncate">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
