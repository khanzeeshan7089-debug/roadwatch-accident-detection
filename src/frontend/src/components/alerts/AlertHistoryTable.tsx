import type { EmergencyAlert } from "@/backend";
import { AlertStatusBadge } from "@/components/alerts/AlertStatusBadge";
import { alertLocation, formatTimestamp } from "@/lib/roadwatch";
import { cn } from "@/lib/utils";
import { History } from "lucide-react";

function StatusTimeline({ alert }: { alert: EmergencyAlert }) {
  const entries = [...alert.history].sort((a, b) =>
    a.at < b.at ? -1 : a.at > b.at ? 1 : 0,
  );

  if (entries.length === 0) {
    return (
      <p className="text-xs text-muted-foreground">
        No status changes recorded yet.
      </p>
    );
  }

  return (
    <ol className="relative space-y-3 border-l border-border pl-4">
      {entries.map((entry, index) => (
        <li
          key={`${alert.id.toString()}-${entry.at.toString()}-${index}`}
          className="relative"
        >
          <span
            className="absolute -left-[1.4rem] top-1 size-2.5 rounded-full border-2 border-card bg-accent"
            aria-hidden="true"
          />
          <div className="flex flex-wrap items-center gap-2">
            <AlertStatusBadge status={entry.status} />
            <span className="font-mono-num text-xs text-muted-foreground">
              {formatTimestamp(entry.at)}
            </span>
          </div>
          {entry.note && (
            <p className="mt-1 text-xs text-muted-foreground">{entry.note}</p>
          )}
        </li>
      ))}
    </ol>
  );
}

export function AlertHistoryTable({ alerts }: { alerts: EmergencyAlert[] }) {
  return (
    <div className="space-y-3">
      {alerts.map((alert) => (
        <details
          key={alert.id.toString()}
          data-ocid={`alerts.history_item.${alert.id.toString()}`}
          className={cn(
            "group rounded-xl border border-border bg-card transition-smooth open:border-accent/40",
          )}
        >
          <summary className="flex cursor-pointer list-none flex-wrap items-center gap-3 px-4 py-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-secondary text-accent">
              <History className="size-4" aria-hidden="true" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-2">
                <span className="font-mono-num text-sm font-semibold text-foreground">
                  #{alert.id.toString()}
                </span>
                <span className="truncate text-sm text-muted-foreground">
                  {alertLocation(alert)}
                </span>
              </span>
              <span className="mt-0.5 block font-mono-num text-xs text-muted-foreground">
                {formatTimestamp(alert.raisedAt)}
              </span>
            </span>
            <AlertStatusBadge status={alert.status} />
          </summary>
          <div className="border-t border-border px-4 py-4">
            <p className="mb-3 font-mono text-[0.6rem] uppercase tracking-wider text-muted-foreground">
              Status change history
            </p>
            <StatusTimeline alert={alert} />
          </div>
        </details>
      ))}
    </div>
  );
}
