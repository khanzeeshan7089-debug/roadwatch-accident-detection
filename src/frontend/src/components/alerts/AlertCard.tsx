import { AlertStatus, type EmergencyAlert } from "@/backend";
import { AlertStatusBadge } from "@/components/alerts/AlertStatusBadge";
import { NotificationStatusPanel } from "@/components/alerts/NotificationStatusPanel";
import { Button } from "@/components/ui/button";
import {
  alertLocation,
  formatRelativeTime,
  formatTimestamp,
} from "@/lib/roadwatch";
import { cn } from "@/lib/utils";
import {
  BadgeCheck,
  Camera,
  CheckCircle2,
  Clock,
  MapPin,
  ShieldQuestion,
} from "lucide-react";

export type AlertAction = "verified" | "falseAlarm" | "resolved";

const ACTION_LABELS: Record<AlertAction, string> = {
  verified: "Mark verified",
  falseAlarm: "False alarm",
  resolved: "Mark resolved",
};

function MetaItem({
  icon: Icon,
  label,
  value,
  mono,
}: {
  icon: typeof Camera;
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-start gap-2">
      <Icon
        className="mt-0.5 size-3.5 shrink-0 text-muted-foreground"
        aria-hidden="true"
      />
      <div className="min-w-0">
        <p className="font-mono text-[0.6rem] uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <p
          className={cn(
            "truncate text-sm text-foreground",
            mono && "font-mono-num",
          )}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

export function AlertCard({
  alert,
  onAction,
  pendingAction,
  disabled,
}: {
  alert: EmergencyAlert;
  onAction: (action: AlertAction) => void;
  pendingAction?: AlertAction;
  disabled?: boolean;
}) {
  const isResolved = alert.status === AlertStatus.resolved;
  const isActive = alert.status === AlertStatus.active;

  return (
    <article
      data-ocid={`alerts.card.${alert.id.toString()}`}
      className={cn(
        "flex flex-col gap-4 rounded-xl border bg-card p-4 transition-smooth hover:border-accent/40",
        isActive ? "border-destructive/40" : "border-border",
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
              Alert
            </span>
            <span className="font-mono-num text-sm font-semibold text-accent">
              #{alert.id.toString()}
            </span>
          </div>
          <p className="mt-1 truncate font-display text-base font-semibold text-foreground">
            {alertLocation(alert)}
          </p>
        </div>
        <AlertStatusBadge status={alert.status} />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <MetaItem
          icon={Camera}
          label="Camera"
          value={alert.cameraId.toString()}
          mono
        />
        <MetaItem
          icon={ShieldQuestion}
          label="Incident"
          value={`#${alert.incidentId.toString()}`}
          mono
        />
        <MetaItem icon={MapPin} label="Location" value={alertLocation(alert)} />
        <MetaItem
          icon={Clock}
          label="Raised"
          value={`${formatTimestamp(alert.raisedAt)} · ${formatRelativeTime(alert.raisedAt)}`}
        />
      </div>

      <NotificationStatusPanel
        policeStatus={alert.policeStatus}
        hospitalStatus={alert.hospitalStatus}
      />

      <div className="flex flex-wrap items-center gap-2 border-t border-border pt-3">
        <Button
          type="button"
          size="sm"
          variant="outline"
          data-ocid={`alerts.verify_button.${alert.id.toString()}`}
          disabled={disabled || isResolved}
          onClick={() => onAction("verified")}
        >
          <BadgeCheck className="size-4" aria-hidden="true" />
          {pendingAction === "verified" ? "Saving…" : ACTION_LABELS.verified}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          data-ocid={`alerts.false_alarm_button.${alert.id.toString()}`}
          disabled={disabled || isResolved}
          onClick={() => onAction("falseAlarm")}
        >
          <ShieldQuestion className="size-4" aria-hidden="true" />
          {pendingAction === "falseAlarm"
            ? "Saving…"
            : ACTION_LABELS.falseAlarm}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="default"
          className="ml-auto"
          data-ocid={`alerts.resolve_button.${alert.id.toString()}`}
          disabled={disabled || isResolved}
          onClick={() => onAction("resolved")}
        >
          <CheckCircle2 className="size-4" aria-hidden="true" />
          {pendingAction === "resolved" ? "Saving…" : ACTION_LABELS.resolved}
        </Button>
      </div>
    </article>
  );
}
