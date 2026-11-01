import { PageHeader } from "@/components/PageHeader";
import { QueryState } from "@/components/PageState";
import { useCameras } from "@/hooks/useRoadwatch";
import { formatCoordinates } from "@/lib/roadwatch";
import { MapPin } from "lucide-react";

export default function LocationManagementPage() {
  const camerasQuery = useCameras();
  const cameras = camerasQuery.data ?? [];

  return (
    <section data-ocid="locations.page">
      <PageHeader
        icon={MapPin}
        title="Location Management"
        description="Every registered camera with its road, area and geographic coordinates for control-room reference."
      />

      <QueryState
        isLoading={camerasQuery.isLoading}
        isError={camerasQuery.isError}
        error={camerasQuery.error}
        isEmpty={cameras.length === 0}
        emptyTitle="No camera locations"
        emptyDescription="Register a camera to see its road, area and coordinates listed here."
        onRetry={() => void camerasQuery.refetch()}
      >
        <div
          data-ocid="locations.table"
          className="overflow-x-auto rounded-xl border border-border bg-card shadow-subtle"
        >
          <table className="w-full min-w-[44rem] border-collapse text-sm">
            <caption className="sr-only">
              Camera locations with road, area and coordinates
            </caption>
            <thead>
              <tr className="border-b border-border bg-secondary/40 text-left">
                <th
                  scope="col"
                  className="px-4 py-3 font-mono text-[0.65rem] uppercase tracking-[0.15em] text-muted-foreground"
                >
                  Camera ID
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 font-mono text-[0.65rem] uppercase tracking-[0.15em] text-muted-foreground"
                >
                  Road name
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 font-mono text-[0.65rem] uppercase tracking-[0.15em] text-muted-foreground"
                >
                  Area
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 font-mono text-[0.65rem] uppercase tracking-[0.15em] text-muted-foreground"
                >
                  Latitude
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 font-mono text-[0.65rem] uppercase tracking-[0.15em] text-muted-foreground"
                >
                  Longitude
                </th>
              </tr>
            </thead>
            <tbody>
              {cameras.map((camera) => (
                <tr
                  key={camera.id.toString()}
                  data-ocid="locations.row"
                  className="border-b border-border/60 last:border-b-0 transition-colors hover:bg-secondary/30"
                >
                  <td className="px-4 py-3">
                    <span className="font-mono text-xs font-semibold text-accent">
                      {camera.code}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-foreground">
                    {camera.roadName}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {camera.area}
                  </td>
                  <td className="px-4 py-3 font-mono-num text-foreground">
                    {camera.latitude.toFixed(5)}
                  </td>
                  <td className="px-4 py-3 font-mono-num text-foreground">
                    {camera.longitude.toFixed(5)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-3 text-xs text-muted-foreground">
          {cameras.length} {cameras.length === 1 ? "location" : "locations"}{" "}
          registered · coordinates shown as decimal degrees
        </p>
      </QueryState>
    </section>
  );
}
