import type { DetectionLog } from "@/backend";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  formatConfidence,
  formatRelativeTime,
  vehicleClassLabel,
} from "@/lib/roadwatch";
import { cn } from "@/lib/utils";
import { ScanLine } from "lucide-react";

/** Running detection log for the current session, newest first. */
export function DetectionLogList({ logs }: { logs: DetectionLog[] }) {
  return (
    <div
      data-ocid="vehicles.log"
      className="rounded-xl border border-border bg-card"
    >
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <ScanLine className="size-4 text-accent" aria-hidden="true" />
          <h2 className="font-display text-sm font-semibold text-foreground">
            Detection log
          </h2>
          <Badge
            variant="outline"
            data-ocid="vehicles.log_simulated_badge"
            className="border-warning/50 text-warning"
          >
            Simulated
          </Badge>
        </div>
        <span className="font-mono-num text-xs text-muted-foreground">
          {logs.length} {logs.length === 1 ? "entry" : "entries"}
        </span>
      </div>

      {logs.length === 0 ? (
        <p className="px-4 py-8 text-center text-sm text-muted-foreground">
          No detections recorded in this session yet.
        </p>
      ) : (
        <ScrollArea className="h-[22rem]">
          <ul className="divide-y divide-border">
            {logs.map((log, index) => (
              <li
                key={log.id.toString()}
                data-ocid={`vehicles.log_item.${index + 1}`}
                className="flex items-center justify-between gap-3 px-4 py-2.5 transition-smooth hover:bg-secondary/40"
              >
                <div className="flex min-w-0 items-center gap-2">
                  <span
                    className={cn(
                      "size-2 shrink-0 rounded-full",
                      log.simulated ? "bg-warning" : "bg-success",
                    )}
                    aria-hidden="true"
                  />
                  <span className="truncate text-sm font-medium text-foreground">
                    {vehicleClassLabel(log.vehicleClass)}
                  </span>
                  {log.simulated && (
                    <Badge
                      variant="outline"
                      className="border-warning/50 text-warning"
                    >
                      Simulated
                    </Badge>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <span className="font-mono-num text-sm text-accent">
                    {formatConfidence(log.confidence)}
                  </span>
                  <span className="font-mono-num text-xs text-muted-foreground">
                    {formatRelativeTime(log.detectedAt)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </ScrollArea>
      )}
    </div>
  );
}
