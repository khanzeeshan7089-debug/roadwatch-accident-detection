import type { Incident } from "@/backend";
import { IncidentStatus } from "@/backend";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  formatConfidence,
  formatRelativeTime,
  formatTimestamp,
  incidentLocation,
  incidentStatusLabel,
  verificationLabel,
} from "@/lib/roadwatch";
import { cn } from "@/lib/utils";
import {
  Camera,
  Clock,
  FlaskConical,
  MapPin,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";

const STATUS_STYLES: Record<IncidentStatus, string> = {
  [IncidentStatus.potential]:
    "border-destructive/40 bg-destructive/10 text-destructive",
  [IncidentStatus.verified]: "border-success/40 bg-success/10 text-success",
  [IncidentStatus.falseAlarm]: "border-warning/40 bg-warning/10 text-warning",
  [IncidentStatus.resolved]: "border-border bg-secondary text-muted-foreground",
};

export function AccidentEventCard({
  incident,
  index,
}: {
  incident: Incident;
  index: number;
}) {
  const simulated = incident.detectionSource === "simulated";
  const hasConfidence =
    incident.confidence !== undefined && incident.confidence !== null;

  return (
    <Card
      data-ocid={`accidents.event_card.${index + 1}`}
      className={cn(
        "gap-3 border-l-4 py-4 transition-smooth hover:border-l-accent",
        incident.status === IncidentStatus.potential
          ? "border-l-destructive"
          : "border-l-border",
      )}
    >
      <CardContent className="flex flex-col gap-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            <span
              className={cn(
                "mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-md",
                incident.status === IncidentStatus.potential
                  ? "bg-destructive/15 text-destructive"
                  : "bg-secondary text-accent",
              )}
            >
              <ShieldAlert className="size-4" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <h3 className="truncate font-display text-sm font-semibold text-foreground">
                {incident.summary || "Potential accident detected"}
              </h3>
              <p className="mt-0.5 font-mono text-xs text-muted-foreground">
                Incident #{incident.id.toString()}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {simulated && (
              <Badge
                variant="outline"
                data-ocid={`accidents.event_simulated_badge.${index + 1}`}
                className="border-warning/40 bg-warning/10 text-warning"
              >
                <FlaskConical className="size-3" aria-hidden="true" />
                Simulated
              </Badge>
            )}
            <Badge
              variant="outline"
              data-ocid={`accidents.event_status_badge.${index + 1}`}
              className={STATUS_STYLES[incident.status]}
            >
              {incidentStatusLabel(incident.status)}
            </Badge>
          </div>
        </div>

        <dl className="grid gap-x-6 gap-y-2 text-xs sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex items-center gap-2">
            <Camera
              className="size-3.5 shrink-0 text-muted-foreground"
              aria-hidden="true"
            />
            <dt className="sr-only">Camera</dt>
            <dd className="truncate font-mono text-foreground">
              {incident.cameraCode}
            </dd>
          </div>
          <div className="flex items-center gap-2">
            <MapPin
              className="size-3.5 shrink-0 text-muted-foreground"
              aria-hidden="true"
            />
            <dt className="sr-only">Location</dt>
            <dd className="truncate text-muted-foreground">
              {incidentLocation(incident) || "Unknown location"}
            </dd>
          </div>
          <div className="flex items-center gap-2">
            <Clock
              className="size-3.5 shrink-0 text-muted-foreground"
              aria-hidden="true"
            />
            <dt className="sr-only">Detected</dt>
            <dd
              className="text-muted-foreground"
              title={formatTimestamp(incident.detectedAt)}
            >
              {formatRelativeTime(incident.detectedAt)}
            </dd>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck
              className="size-3.5 shrink-0 text-muted-foreground"
              aria-hidden="true"
            />
            <dt className="sr-only">Verification</dt>
            <dd className="text-muted-foreground">
              {verificationLabel(incident.verificationStatus)}
            </dd>
          </div>
        </dl>

        {hasConfidence && (
          <p
            data-ocid={`accidents.event_confidence.${index + 1}`}
            className="font-mono-num text-xs text-muted-foreground"
          >
            Detection confidence:{" "}
            <span className="font-semibold text-accent">
              {formatConfidence(incident.confidence)}
            </span>
          </p>
        )}
      </CardContent>
    </Card>
  );
}
