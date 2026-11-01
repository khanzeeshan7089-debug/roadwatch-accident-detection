import { PageHeader } from "@/components/PageHeader";
import { ErrorState, LoadingState } from "@/components/PageState";
import { AccidentDetectionChart } from "@/components/dashboard/AccidentDetectionChart";
import { CameraStatusPanel } from "@/components/dashboard/CameraStatusPanel";
import { IncidentActivityFeed } from "@/components/dashboard/IncidentActivityFeed";
import { StatCard } from "@/components/dashboard/StatCard";
import { TrafficAnalyticsChart } from "@/components/dashboard/TrafficAnalyticsChart";
import { TrafficOverviewPanel } from "@/components/dashboard/TrafficOverviewPanel";
import {
  useAnalytics,
  useCameras,
  useDashboardStats,
  useIncidents,
  useSettings,
} from "@/hooks/useRoadwatch";
import { formatCount } from "@/lib/roadwatch";
import {
  Activity,
  Bell,
  Camera,
  Car,
  CheckCircle2,
  LayoutDashboard,
  ShieldAlert,
  Video,
} from "lucide-react";

export default function DashboardPage() {
  const statsQuery = useDashboardStats();
  const analyticsQuery = useAnalytics();
  const camerasQuery = useCameras();
  const incidentsQuery = useIncidents();
  const settingsQuery = useSettings();

  const isLoading =
    statsQuery.isLoading ||
    analyticsQuery.isLoading ||
    camerasQuery.isLoading ||
    incidentsQuery.isLoading ||
    settingsQuery.isLoading;

  const isError =
    statsQuery.isError ||
    analyticsQuery.isError ||
    camerasQuery.isError ||
    incidentsQuery.isError ||
    settingsQuery.isError;

  const retry = () => {
    void statsQuery.refetch();
    void analyticsQuery.refetch();
    void camerasQuery.refetch();
    void incidentsQuery.refetch();
    void settingsQuery.refetch();
  };

  const stats = statsQuery.data ?? null;
  const analytics = analyticsQuery.data ?? null;
  const cameras = camerasQuery.data ?? [];
  const incidents = incidentsQuery.data ?? [];
  const settings = settingsQuery.data ?? null;

  const monitoringCameras = cameras.filter(
    (camera) => camera.monitoringState === "monitoring",
  ).length;

  const recentIncidents = [...incidents]
    .sort((a, b) => Number(b.detectedAt - a.detectedAt))
    .slice(0, 6);

  const hasAnyData =
    stats !== null ||
    cameras.length > 0 ||
    incidents.length > 0 ||
    (analytics !== null &&
      (analytics.dailyDetections.length > 0 ||
        analytics.detectionStats.length > 0));

  return (
    <section data-ocid="dashboard.page">
      <PageHeader
        icon={LayoutDashboard}
        title="Dashboard"
        description="Live overview of camera health, vehicle detections, potential accidents and pending emergency alerts across the monitored road network."
      />

      {isLoading ? (
        <LoadingState label="Loading control-room telemetry…" />
      ) : isError ? (
        <ErrorState
          message="The dashboard data could not be loaded. Check the backend connection and try again."
          onRetry={retry}
        />
      ) : !hasAnyData ? (
        <div
          data-ocid="dashboard.empty_state"
          className="rounded-xl border border-dashed border-border bg-card/40 px-6 py-16 text-center"
        >
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-secondary text-accent">
            <LayoutDashboard className="size-6" aria-hidden="true" />
          </div>
          <h3 className="mt-3 font-display text-lg font-semibold text-foreground">
            No monitoring data yet
          </h3>
          <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
            Register cameras and start monitoring to populate the dashboard with
            detections, incidents and alerts.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <div
            data-ocid="dashboard.stats.grid"
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6"
          >
            <StatCard
              ocid="dashboard.stat.total_cameras"
              label="Total CCTV Cameras"
              value={formatCount(stats?.totalCameras)}
              hint="registered in the network"
              icon={Camera}
              tone="primary"
            />
            <StatCard
              ocid="dashboard.stat.active_cameras"
              label="Active Cameras"
              value={formatCount(stats?.activeCameras)}
              hint="reporting online"
              icon={Video}
              tone="success"
            />
            <StatCard
              ocid="dashboard.stat.vehicles_detected"
              label="Vehicles Detected"
              value={formatCount(stats?.vehiclesDetected)}
              hint="across all cameras"
              icon={Car}
              tone="accent"
            />
            <StatCard
              ocid="dashboard.stat.potential_accidents"
              label="Potential Accidents"
              value={formatCount(stats?.potentialAccidents)}
              hint="flagged by the pipeline"
              icon={ShieldAlert}
              tone="danger"
            />
            <StatCard
              ocid="dashboard.stat.pending_alerts"
              label="Pending Alerts"
              value={formatCount(stats?.pendingAlerts)}
              hint="awaiting acknowledgement"
              icon={Bell}
              tone="warning"
            />
            <StatCard
              ocid="dashboard.stat.resolved_incidents"
              label="Resolved Incidents"
              value={formatCount(stats?.resolvedIncidents)}
              hint="closed after review"
              icon={CheckCircle2}
              tone="success"
            />
          </div>

          <TrafficOverviewPanel
            totalCameras={Number(stats?.totalCameras ?? cameras.length)}
            activeCameras={Number(stats?.activeCameras ?? 0)}
            monitoringCameras={monitoringCameras}
            simulationMode={settings?.simulationMode ?? true}
          />

          <div className="grid gap-6 lg:grid-cols-2">
            <IncidentActivityFeed incidents={recentIncidents} />
            <CameraStatusPanel cameras={cameras} />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <TrafficAnalyticsChart data={analytics?.dailyDetections ?? []} />
            <AccidentDetectionChart data={analytics?.detectionStats ?? []} />
          </div>

          <p className="flex items-center gap-2 text-xs text-muted-foreground">
            <Activity className="size-3.5" aria-hidden="true" />
            Detection runs in clearly labelled simulation mode until a trained
            accident-classification model is configured.
          </p>
        </div>
      )}
    </section>
  );
}
