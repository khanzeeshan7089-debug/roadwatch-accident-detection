import { type AlertId, AlertStatus, type EmergencyAlert } from "@/backend";
import { PageHeader } from "@/components/PageHeader";
import { EmptyState, ErrorState, LoadingState } from "@/components/PageState";
import { type AlertAction, AlertCard } from "@/components/alerts/AlertCard";
import { AlertHistoryTable } from "@/components/alerts/AlertHistoryTable";
import { SimulationNotice } from "@/components/alerts/SimulationNotice";
import { Button } from "@/components/ui/button";
import { useAlerts, useUpdateAlertStatus } from "@/hooks/useRoadwatch";
import { roadwatchErrorMessage } from "@/lib/roadwatch";
import { cn } from "@/lib/utils";
import { Bell, History, RefreshCw, ShieldAlert } from "lucide-react";
import { useMemo, useState } from "react";

type AlertTab = "active" | "history";

const ACTION_TO_STATUS: Record<AlertAction, AlertStatus> = {
  verified: AlertStatus.acknowledged,
  falseAlarm: AlertStatus.resolved,
  resolved: AlertStatus.resolved,
};

function isActiveAlert(alert: EmergencyAlert): boolean {
  return alert.status !== AlertStatus.resolved;
}

export default function EmergencyAlertsPage() {
  const [tab, setTab] = useState<AlertTab>("active");
  const [pending, setPending] = useState<{
    id: AlertId;
    action: AlertAction;
  } | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const alertsQuery = useAlerts();
  const updateStatus = useUpdateAlertStatus();

  const alerts = alertsQuery.data ?? [];
  const activeAlerts = useMemo(() => alerts.filter(isActiveAlert), [alerts]);
  const historyAlerts = useMemo(
    () => alerts.filter((alert) => !isActiveAlert(alert)),
    [alerts],
  );

  const visible = tab === "active" ? activeAlerts : historyAlerts;

  function handleAction(alert: EmergencyAlert, action: AlertAction) {
    setActionError(null);
    setPending({ id: alert.id, action });
    updateStatus.mutate(
      { id: alert.id, status: ACTION_TO_STATUS[action] },
      {
        onSuccess: (result) => {
          if (result.__kind__ === "err") {
            setActionError(roadwatchErrorMessage(result.err));
          }
        },
        onError: (error) => {
          setActionError(
            error instanceof Error
              ? error.message
              : "The alert status could not be updated.",
          );
        },
        onSettled: () => {
          setPending(null);
        },
      },
    );
  }

  const tabs: { id: AlertTab; label: string; count: number }[] = [
    { id: "active", label: "Active alerts", count: activeAlerts.length },
    { id: "history", label: "Alert history", count: historyAlerts.length },
  ];

  return (
    <section data-ocid="alerts.page" className="space-y-6">
      <PageHeader
        icon={Bell}
        title="Emergency Alerts"
        description="Track police and hospital notification status for each alert, review alert history, and mark alerts as verified, false alarm or resolved."
        actions={
          <Button
            type="button"
            variant="outline"
            size="sm"
            data-ocid="alerts.refresh_button"
            onClick={() => void alertsQuery.refetch()}
            disabled={alertsQuery.isFetching}
          >
            <RefreshCw
              className={cn("size-4", alertsQuery.isFetching && "animate-spin")}
              aria-hidden="true"
            />
            Refresh
          </Button>
        }
      />

      <SimulationNotice />

      {actionError && (
        <div
          data-ocid="alerts.action_error"
          role="alert"
          className="flex items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          <ShieldAlert className="size-4 shrink-0" aria-hidden="true" />
          {actionError}
        </div>
      )}

      <div
        role="tablist"
        aria-label="Alert views"
        className="flex flex-wrap gap-2 border-b border-border pb-3"
      >
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={tab === item.id}
            data-ocid={`alerts.tab.${item.id}`}
            onClick={() => setTab(item.id)}
            className={cn(
              "inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-medium transition-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              tab === item.id
                ? "border-accent/50 bg-accent/10 text-accent"
                : "border-border bg-card text-muted-foreground hover:text-foreground",
            )}
          >
            {item.id === "active" ? (
              <Bell className="size-4" aria-hidden="true" />
            ) : (
              <History className="size-4" aria-hidden="true" />
            )}
            {item.label}
            <span className="font-mono-num rounded-full bg-secondary px-2 py-0.5 text-xs text-foreground">
              {item.count}
            </span>
          </button>
        ))}
      </div>

      {alertsQuery.isLoading ? (
        <LoadingState label="Loading emergency alerts…" />
      ) : alertsQuery.isError ? (
        <ErrorState
          message={
            alertsQuery.error instanceof Error
              ? alertsQuery.error.message
              : "The alert feed could not be loaded."
          }
          onRetry={() => void alertsQuery.refetch()}
        />
      ) : visible.length === 0 ? (
        <EmptyState
          icon={
            tab === "active" ? (
              <Bell className="size-6" aria-hidden="true" />
            ) : (
              <History className="size-6" aria-hidden="true" />
            )
          }
          title={tab === "active" ? "No active alerts" : "No alert history yet"}
          description={
            tab === "active"
              ? "Every raised alert has been resolved. New potential accidents will appear here for verification."
              : "Resolved and false-alarm alerts will be listed here with their full status change history."
          }
        />
      ) : tab === "active" ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {activeAlerts.map((alert) => (
            <AlertCard
              key={alert.id.toString()}
              alert={alert}
              disabled={updateStatus.isPending}
              pendingAction={
                pending?.id === alert.id ? pending.action : undefined
              }
              onAction={(action) => handleAction(alert, action)}
            />
          ))}
        </div>
      ) : (
        <AlertHistoryTable alerts={historyAlerts} />
      )}
    </section>
  );
}
