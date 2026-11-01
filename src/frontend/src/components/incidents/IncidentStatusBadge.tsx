import type {
  IncidentStatus,
  ResolutionStatus,
  VerificationStatus,
} from "@/backend";
import { Badge } from "@/components/ui/badge";
import {
  incidentStatusLabel,
  resolutionLabel,
  verificationLabel,
} from "@/lib/roadwatch";
import { cn } from "@/lib/utils";
import {
  AlertTriangle,
  CheckCircle2,
  CircleDashed,
  ShieldCheck,
  ShieldX,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const INCIDENT_STATUS_STYLES: Record<IncidentStatus, string> = {
  potential: "border-warning/40 bg-warning/10 text-warning",
  verified: "border-destructive/40 bg-destructive/10 text-destructive",
  falseAlarm: "border-border bg-muted text-muted-foreground",
  resolved: "border-success/40 bg-success/10 text-success",
};

const INCIDENT_STATUS_ICONS: Record<IncidentStatus, LucideIcon> = {
  potential: AlertTriangle,
  verified: ShieldCheck,
  falseAlarm: ShieldX,
  resolved: CheckCircle2,
};

export function IncidentStatusBadge({ status }: { status: IncidentStatus }) {
  const Icon = INCIDENT_STATUS_ICONS[status] ?? CircleDashed;
  return (
    <Badge
      variant="outline"
      className={cn(
        "gap-1.5 font-mono text-[0.65rem] uppercase tracking-wider",
        INCIDENT_STATUS_STYLES[status],
      )}
    >
      <Icon className="size-3" aria-hidden="true" />
      {incidentStatusLabel(status)}
    </Badge>
  );
}

const VERIFICATION_STYLES: Record<VerificationStatus, string> = {
  unverified: "border-border bg-muted text-muted-foreground",
  verified: "border-success/40 bg-success/10 text-success",
  falseAlarm: "border-border bg-muted text-muted-foreground",
};

export function VerificationBadge({
  status,
}: {
  status: VerificationStatus;
}) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "font-mono text-[0.65rem] uppercase tracking-wider",
        VERIFICATION_STYLES[status],
      )}
    >
      {verificationLabel(status)}
    </Badge>
  );
}

const RESOLUTION_STYLES: Record<ResolutionStatus, string> = {
  unresolved: "border-warning/40 bg-warning/10 text-warning",
  resolved: "border-success/40 bg-success/10 text-success",
};

export function ResolutionBadge({ status }: { status: ResolutionStatus }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "font-mono text-[0.65rem] uppercase tracking-wider",
        RESOLUTION_STYLES[status],
      )}
    >
      {resolutionLabel(status)}
    </Badge>
  );
}
