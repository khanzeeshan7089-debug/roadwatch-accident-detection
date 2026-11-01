import type { Incident, IncidentStatus } from "@/backend";
import { EmptyState } from "@/components/PageState";
import { type DotTone, StatusDot } from "@/components/dashboard/StatusDot";
import {
  formatConfidence,
  formatRelativeTime,
  incidentLocation,
  incidentStatusLabel,
} from "@/lib/roadwatch";
import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";
import { Activity, ArrowRight } from "lucide-react";

const STATUS_TONE: Record<IncidentStatus, DotTone> = {
  potential: "danger",
  verified: "warning",
  falseAlarm: "muted",
  resolved: "success",
};

const STATUS_BADGE: Record<IncidentStatus, string> = {
  potential: "border-destructive/40 bg-destructive/10 text-destructive",
  verified: "border-warning/40 bg-warning/10 text-warning",
  falseAlarm: "border-border bg-muted text-muted-foreground",
  resolved: "border-success/40 bg-success/10 text-success",
};

export function IncidentActivityFeed({ incidents }: { incidents: Incident[] }) {
  return (
    <section
      data-ocid="dashboard.incident_feed.panel"
      className="flex h-full flex-col rounded-xl border border-border bg-card"
    >
      <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
        <div className="flex items-center gap-2">
          <Activity className="size-4 text-accent" aria-hidden="true" />
          <h2 className="font-display text-sm font-semibold uppercase tracking-wider text-foreground">
            Recent Incident Activity
          </h2>
        </div>
        <Link
          to="/incidents"
          data-ocid="dashboard.incident_feed.view_all_link"
          className="inline-flex items-center gap-1 text-xs font-medium text-accent transition-smooth hover:text-accent/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          View history
          <ArrowRight className="size-3.5" aria-hidden="true" />
        </Link>
      </div>

      {incidents.length === 0 ? (
        <div className="p-5">
          <EmptyState
            title="No incidents recorded"
            description="Detected incidents will appear here as the monitoring pipeline raises events."
            icon={<Activity className="size-6" aria-hidden="true" />}
          />
        </div>
      ) : (
        <ul
          data-ocid="dashboard.incident_feed.list"
          className="divide-y divide-border"
        >
          {incidents.map((incident, index) => (
            <li key={incident.id.toString()}>
              <Link
                to="/incidents"
                data-ocid={`dashboard.incident_feed.item.${index + 1}`}
                className="flex items-start gap-3 px-5 py-3.5 transition-smooth hover:bg-secondary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <StatusDot
                  tone={STATUS_TONE[incident.status]}
                  pulse={incident.status === "potential"}
                  className="mt-1.5"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate font-mono text-xs text-accent">
                      {incident.cameraCode}
                    </p>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {formatRelativeTime(incident.detectedAt)}
                    </span>
                  </div>
                  <p className="mt-0.5 truncate text-sm text-foreground">
                    {incidentLocation(incident) || "Unknown location"}
                  </p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-2">
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full border px-2 py-0.5 font-mono text-[0.6rem] uppercase tracking-wider",
                        STATUS_BADGE[incident.status],
                      )}
                    >
                      {incidentStatusLabel(incident.status)}
                    </span>
                    {incident.confidence !== undefined && (
                      <span className="font-mono text-[0.65rem] text-muted-foreground">
                        {formatConfidence(incident.confidence)} confidence
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
