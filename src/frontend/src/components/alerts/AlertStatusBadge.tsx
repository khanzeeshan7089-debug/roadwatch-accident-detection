import { AlertStatus, NotificationStatus } from "@/backend";
import { alertStatusLabel, notificationStatusLabel } from "@/lib/roadwatch";
import { cn } from "@/lib/utils";
import { BellRing, CheckCircle2, CircleDashed, XCircle } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const ALERT_STATUS_STYLES: Record<AlertStatus, string> = {
  [AlertStatus.active]:
    "border-destructive/40 bg-destructive/10 text-destructive",
  [AlertStatus.acknowledged]: "border-warning/40 bg-warning/10 text-warning",
  [AlertStatus.resolved]: "border-success/40 bg-success/10 text-success",
};

const ALERT_STATUS_ICONS: Record<AlertStatus, LucideIcon> = {
  [AlertStatus.active]: BellRing,
  [AlertStatus.acknowledged]: CircleDashed,
  [AlertStatus.resolved]: CheckCircle2,
};

export function AlertStatusBadge({
  status,
  className,
}: {
  status: AlertStatus;
  className?: string;
}) {
  const Icon = ALERT_STATUS_ICONS[status] ?? CircleDashed;
  return (
    <span
      data-ocid="alerts.status_badge"
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[0.65rem] uppercase tracking-wider",
        ALERT_STATUS_STYLES[status] ??
          "border-border bg-secondary text-muted-foreground",
        className,
      )}
    >
      <Icon className="size-3" aria-hidden="true" />
      {alertStatusLabel(status)}
    </span>
  );
}

const NOTIFICATION_STYLES: Record<NotificationStatus, string> = {
  [NotificationStatus.pending]: "border-warning/40 bg-warning/10 text-warning",
  [NotificationStatus.notified]: "border-success/40 bg-success/10 text-success",
  [NotificationStatus.failed]:
    "border-destructive/40 bg-destructive/10 text-destructive",
};

const NOTIFICATION_ICONS: Record<NotificationStatus, LucideIcon> = {
  [NotificationStatus.pending]: CircleDashed,
  [NotificationStatus.notified]: CheckCircle2,
  [NotificationStatus.failed]: XCircle,
};

export function NotificationStatusBadge({
  status,
  className,
}: {
  status: NotificationStatus;
  className?: string;
}) {
  const Icon = NOTIFICATION_ICONS[status] ?? CircleDashed;
  return (
    <span
      data-ocid="alerts.notification_badge"
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[0.65rem] uppercase tracking-wider",
        NOTIFICATION_STYLES[status] ??
          "border-border bg-secondary text-muted-foreground",
        className,
      )}
    >
      <Icon className="size-3" aria-hidden="true" />
      {notificationStatusLabel(status)}
    </span>
  );
}
