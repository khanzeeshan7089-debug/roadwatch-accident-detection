import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export function PageHeader({
  title,
  description,
  icon: Icon,
  actions,
  className,
}: {
  title: string;
  description: string;
  icon?: LucideIcon;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <div
      data-ocid="page.header"
      className={cn(
        "mb-6 flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-end sm:justify-between",
        className,
      )}
    >
      <div className="flex items-start gap-3">
        {Icon && (
          <span className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-lg bg-secondary text-accent">
            <Icon className="size-5" aria-hidden="true" />
          </span>
        )}
        <div className="min-w-0">
          <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
            {title}
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            {description}
          </p>
        </div>
      </div>
      {actions && (
        <div className="flex shrink-0 items-center gap-2">{actions}</div>
      )}
    </div>
  );
}
