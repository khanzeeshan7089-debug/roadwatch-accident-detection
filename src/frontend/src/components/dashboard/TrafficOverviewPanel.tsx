import { StatusDot } from "@/components/dashboard/StatusDot";
import { formatCount } from "@/lib/roadwatch";
import { cn } from "@/lib/utils";
import { Cctv, Radio, Video } from "lucide-react";

export function TrafficOverviewPanel({
  totalCameras,
  activeCameras,
  monitoringCameras,
  simulationMode,
}: {
  totalCameras: number;
  activeCameras: number;
  monitoringCameras: number;
  simulationMode: boolean;
}) {
  const coverage =
    totalCameras > 0 ? Math.round((activeCameras / totalCameras) * 100) : 0;

  return (
    <section
      data-ocid="dashboard.traffic_overview.panel"
      className="rounded-xl border border-border bg-card p-5"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Radio className="size-4 text-accent" aria-hidden="true" />
          <h2 className="font-display text-sm font-semibold uppercase tracking-wider text-foreground">
            Traffic Monitoring Overview
          </h2>
        </div>
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[0.65rem] uppercase tracking-wider",
            simulationMode
              ? "border-warning/40 bg-warning/10 text-warning"
              : "border-success/40 bg-success/10 text-success",
          )}
        >
          <StatusDot tone={simulationMode ? "warning" : "success"} pulse />
          {simulationMode ? "Simulation mode" : "Live model mode"}
        </span>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-border bg-secondary/40 p-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Cctv className="size-4" aria-hidden="true" />
            <span className="text-xs uppercase tracking-wider">Monitored</span>
          </div>
          <p className="mt-2 font-display text-2xl font-bold tabular-nums text-foreground">
            {formatCount(monitoringCameras)}
            <span className="ml-1 text-sm font-normal text-muted-foreground">
              / {formatCount(totalCameras)}
            </span>
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            cameras actively processing
          </p>
        </div>

        <div className="rounded-lg border border-border bg-secondary/40 p-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Video className="size-4" aria-hidden="true" />
            <span className="text-xs uppercase tracking-wider">Online</span>
          </div>
          <p className="mt-2 font-display text-2xl font-bold tabular-nums text-success">
            {formatCount(activeCameras)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            streams reporting healthy
          </p>
        </div>

        <div className="rounded-lg border border-border bg-secondary/40 p-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Radio className="size-4" aria-hidden="true" />
            <span className="text-xs uppercase tracking-wider">Coverage</span>
          </div>
          <p className="mt-2 font-display text-2xl font-bold tabular-nums text-accent">
            {coverage}%
          </p>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-accent transition-smooth"
              style={{ width: `${coverage}%` }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
