import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export type StatTone = "primary" | "accent" | "success" | "danger" | "warning";

const TONE_STYLES: Record<
  StatTone,
  { icon: string; value: string; ring: string }
> = {
  primary: {
    icon: "bg-primary/15 text-primary",
    value: "text-foreground",
    ring: "hover:border-primary/40",
  },
  accent: {
    icon: "bg-accent/15 text-accent",
    value: "text-foreground",
    ring: "hover:border-accent/40",
  },
  success: {
    icon: "bg-success/15 text-success",
    value: "text-foreground",
    ring: "hover:border-success/40",
  },
  danger: {
    icon: "bg-destructive/15 text-destructive",
    value: "text-destructive",
    ring: "hover:border-destructive/40",
  },
  warning: {
    icon: "bg-warning/15 text-warning",
    value: "text-foreground",
    ring: "hover:border-warning/40",
  },
};

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "primary",
  ocid,
}: {
  label: string;
  value: string;
  hint?: string;
  icon: LucideIcon;
  tone?: StatTone;
  ocid: string;
}) {
  const styles = TONE_STYLES[tone];
  return (
    <div
      data-ocid={ocid}
      className={cn(
        "group relative overflow-hidden rounded-xl border border-border bg-card p-5 transition-smooth",
        styles.ring,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-muted-foreground">
            {label}
          </p>
          <p
            className={cn(
              "mt-2 font-display text-3xl font-bold tabular-nums",
              styles.value,
            )}
          >
            {value}
          </p>
          {hint && (
            <p className="mt-1 truncate text-xs text-muted-foreground">
              {hint}
            </p>
          )}
        </div>
        <span
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-lg transition-transform group-hover:scale-105",
            styles.icon,
          )}
        >
          <Icon className="size-5" aria-hidden="true" />
        </span>
      </div>
    </div>
  );
}
