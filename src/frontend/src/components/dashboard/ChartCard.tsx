import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export function ChartCard({
  title,
  description,
  icon: Icon,
  ocid,
  children,
}: {
  title: string;
  description: string;
  icon: LucideIcon;
  ocid: string;
  children: ReactNode;
}) {
  return (
    <section
      data-ocid={ocid}
      className="flex flex-col rounded-xl border border-border bg-card p-5"
    >
      <div className="flex items-start gap-2">
        <Icon
          className="mt-0.5 size-4 shrink-0 text-accent"
          aria-hidden="true"
        />
        <div className="min-w-0">
          <h2 className="font-display text-sm font-semibold uppercase tracking-wider text-foreground">
            {title}
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}
