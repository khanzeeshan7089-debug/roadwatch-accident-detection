import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

/**
 * Shared frame for every analytics chart: title, optional subtitle, an icon
 * badge and a fixed-height body so the grid stays visually aligned.
 */
export function ChartCard({
  title,
  description,
  icon: Icon,
  badge,
  children,
  className,
  bodyClassName,
}: {
  title: string;
  description?: string;
  icon?: LucideIcon;
  badge?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <section
      data-ocid="analytics.card"
      className={cn(
        "flex flex-col rounded-xl border border-border bg-card shadow-subtle transition-smooth hover:border-accent/40",
        className,
      )}
    >
      <header className="flex items-start justify-between gap-3 border-b border-border px-5 py-4">
        <div className="flex min-w-0 items-start gap-3">
          {Icon && (
            <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-secondary text-accent">
              <Icon className="size-4" aria-hidden="true" />
            </span>
          )}
          <div className="min-w-0">
            <h2 className="font-display text-base font-semibold tracking-tight text-foreground">
              {title}
            </h2>
            {description && (
              <p className="mt-0.5 text-xs text-muted-foreground">
                {description}
              </p>
            )}
          </div>
        </div>
        {badge && <div className="shrink-0">{badge}</div>}
      </header>
      <div className={cn("flex-1 px-3 py-4 sm:px-4", bodyClassName)}>
        {children}
      </div>
    </section>
  );
}
