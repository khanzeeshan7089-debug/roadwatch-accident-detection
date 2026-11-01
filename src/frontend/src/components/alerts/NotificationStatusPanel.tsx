import type { NotificationStatus } from "@/backend";
import { NotificationStatusBadge } from "@/components/alerts/AlertStatusBadge";
import { cn } from "@/lib/utils";
import { Ambulance, ShieldAlert } from "lucide-react";
import type { LucideIcon } from "lucide-react";

function NotificationRow({
  icon: Icon,
  label,
  status,
  ocid,
}: {
  icon: LucideIcon;
  label: string;
  status: NotificationStatus;
  ocid: string;
}) {
  return (
    <div
      data-ocid={ocid}
      className="flex items-center justify-between gap-3 rounded-lg border border-border bg-secondary/40 px-3 py-2"
    >
      <span className="flex min-w-0 items-center gap-2">
        <Icon className="size-4 shrink-0 text-accent" aria-hidden="true" />
        <span className="truncate text-xs font-medium text-foreground">
          {label}
        </span>
      </span>
      <NotificationStatusBadge status={status} />
    </div>
  );
}

/**
 * Police and hospital notification status for a single alert. Both channels
 * operate in simulation mode; the surrounding page carries the persistent
 * simulation notice.
 */
export function NotificationStatusPanel({
  policeStatus,
  hospitalStatus,
  className,
}: {
  policeStatus: NotificationStatus;
  hospitalStatus: NotificationStatus;
  className?: string;
}) {
  return (
    <div className={cn("grid gap-2", className)}>
      <NotificationRow
        icon={ShieldAlert}
        label="Police dispatch"
        status={policeStatus}
        ocid="alerts.police_status"
      />
      <NotificationRow
        icon={Ambulance}
        label="Hospital dispatch"
        status={hospitalStatus}
        ocid="alerts.hospital_status"
      />
    </div>
  );
}
