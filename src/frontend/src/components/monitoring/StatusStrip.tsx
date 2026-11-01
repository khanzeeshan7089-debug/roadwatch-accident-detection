import type { MonitoringState } from "@/backend";
import { formatCount, monitoringLabel } from "@/lib/roadwatch";
import { cn } from "@/lib/utils";
import { Activity, Car, Radio } from "lucide-react";

function Stat({
  icon: Icon,
  label,
  value,
  tone = "default",
  ocid,
}: {
  icon: typeof Activity;
  label: string;
  value: string;
  tone?: "default" | "accent" | "success";
  ocid: string;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <span
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-md",
          tone === "accent" && "bg-accent/15 text-accent",
          tone === "success" && "bg-success/15 text-success",
          tone === "default" && "bg-secondary text-muted-foreground",
        )}
      >
        <Icon className="size-4" aria-hidden="true" />
      </span>
      <span className="flex min-w-0 flex-col">
        <span className="font-mono text-[0.6rem] uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        <span
          data-ocid={ocid}
          className="font-mono-num text-lg font-semibold text-foreground"
        >
          {value}
        </span>
      </span>
    </div>
  );
}

export function StatusStrip({
  monitoringState,
  framesProcessed,
  vehiclesDetected,
}: {
  monitoringState: MonitoringState;
  framesProcessed: number;
  vehiclesDetected: number;
}) {
  const monitoring = monitoringState === "monitoring";

  return (
    <div
      data-ocid="live.status_strip"
      className="grid grid-cols-1 divide-y divide-border overflow-hidden rounded-xl border border-border bg-card sm:grid-cols-3 sm:divide-x sm:divide-y-0"
    >
      <div className="flex items-center gap-3 px-4 py-3">
        <span
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-md",
            monitoring
              ? "bg-success/15 text-success"
              : "bg-secondary text-muted-foreground",
          )}
        >
          <Radio
            className={cn("size-4", monitoring && "status-pulse")}
            aria-hidden="true"
          />
        </span>
        <span className="flex min-w-0 flex-col">
          <span className="font-mono text-[0.6rem] uppercase tracking-wider text-muted-foreground">
            Processing state
          </span>
          <span
            data-ocid="live.processing_state"
            className={cn(
              "font-display text-lg font-semibold",
              monitoring ? "text-success" : "text-muted-foreground",
            )}
          >
            {monitoringLabel(monitoringState)}
          </span>
        </span>
      </div>

      <Stat
        icon={Activity}
        label="Frames processed"
        value={formatCount(framesProcessed)}
        tone="accent"
        ocid="live.frames_processed"
      />
      <Stat
        icon={Car}
        label="Vehicles detected"
        value={formatCount(vehiclesDetected)}
        tone="success"
        ocid="live.vehicles_detected"
      />
    </div>
  );
}
