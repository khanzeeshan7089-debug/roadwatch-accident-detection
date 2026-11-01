import { PageHeader } from "@/components/PageHeader";
import { QueryState } from "@/components/PageState";
import { CameraActivityChart } from "@/components/analytics/CameraActivityChart";
import { DailyDetectionsChart } from "@/components/analytics/DailyDetectionsChart";
import { DetectionStatsChart } from "@/components/analytics/DetectionStatsChart";
import { IncidentDistributionChart } from "@/components/analytics/IncidentDistributionChart";
import { WeeklyAlertsChart } from "@/components/analytics/WeeklyAlertsChart";
import { useAnalytics } from "@/hooks/useRoadwatch";
import { BarChart3 } from "lucide-react";

export default function AnalyticsPage() {
  const analytics = useAnalytics();
  const data = analytics.data;

  const hasData =
    !!data &&
    (data.dailyDetections.length > 0 ||
      data.weeklyAlerts.length > 0 ||
      data.cameraActivity.length > 0 ||
      data.incidentDistribution.length > 0 ||
      data.detectionStats.length > 0);

  return (
    <section data-ocid="analytics.page">
      <PageHeader
        icon={BarChart3}
        title="Analytics"
        description="Daily vehicle detections, weekly accident alerts, camera activity, incident distribution and detection statistics visualised over time."
      />

      <QueryState
        isLoading={analytics.isLoading}
        isError={analytics.isError}
        error={analytics.error}
        isEmpty={!hasData}
        emptyTitle="Not enough data to chart yet"
        emptyDescription="Analytics charts populate automatically as cameras record detections and incidents are logged. Load sample data or start monitoring a camera to see trends here."
        onRetry={() => {
          void analytics.refetch();
        }}
      >
        {data && (
          <div className="grid gap-5 xl:grid-cols-2">
            <DailyDetectionsChart data={data.dailyDetections} />
            <WeeklyAlertsChart data={data.weeklyAlerts} />
            <CameraActivityChart data={data.cameraActivity} />
            <IncidentDistributionChart data={data.incidentDistribution} />
            <DetectionStatsChart
              data={data.detectionStats}
              className="xl:col-span-2"
            />
          </div>
        )}
      </QueryState>
    </section>
  );
}
