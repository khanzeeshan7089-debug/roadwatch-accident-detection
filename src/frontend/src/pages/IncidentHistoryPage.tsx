import { type Incident, type IncidentFilter, IncidentStatus } from "@/backend";
import { PageHeader } from "@/components/PageHeader";
import { EmptyState, ErrorState } from "@/components/PageState";
import { IncidentDetailDialog } from "@/components/incidents/IncidentDetailDialog";
import {
  EMPTY_INCIDENT_FILTERS,
  type IncidentFilterState,
  IncidentFilters,
} from "@/components/incidents/IncidentFilters";
import { IncidentTable } from "@/components/incidents/IncidentTable";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useCameras, useIncidents } from "@/hooks/useRoadwatch";
import { Activity, RefreshCw, SearchX } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

const STATUS_VALUES = new Set<string>(Object.values(IncidentStatus));

/** Read the incident filter state from the current URL query string. */
function readFiltersFromUrl(): IncidentFilterState {
  if (typeof window === "undefined") return EMPTY_INCIDENT_FILTERS;
  const params = new URLSearchParams(window.location.search);
  const status = params.get("status");
  return {
    searchId: params.get("q") ?? "",
    status:
      status && STATUS_VALUES.has(status) ? (status as IncidentStatus) : "all",
    cameraId: params.get("camera") ?? "all",
    fromDate: params.get("from") ?? "",
    toDate: params.get("to") ?? "",
  };
}

/** Serialize the filter state into the URL so it survives a refresh. */
function writeFiltersToUrl(filters: IncidentFilterState) {
  if (typeof window === "undefined") return;
  const params = new URLSearchParams();
  if (filters.searchId.trim()) params.set("q", filters.searchId.trim());
  if (filters.status !== "all") params.set("status", filters.status);
  if (filters.cameraId !== "all") params.set("camera", filters.cameraId);
  if (filters.fromDate) params.set("from", filters.fromDate);
  if (filters.toDate) params.set("to", filters.toDate);
  const query = params.toString();
  const url = `${window.location.pathname}${query ? `?${query}` : ""}`;
  window.history.replaceState(null, "", url);
}

/** Convert a `YYYY-MM-DD` date input value to a nanosecond timestamp. */
function dateToNs(value: string, endOfDay: boolean): bigint | undefined {
  if (!value) return undefined;
  const date = new Date(
    `${value}T${endOfDay ? "23:59:59.999" : "00:00:00.000"}`,
  );
  if (Number.isNaN(date.getTime())) return undefined;
  return BigInt(date.getTime()) * 1_000_000n;
}

/**
 * A backend filter that is also safe to use as a React Query key.
 *
 * `IncidentFilter` carries `bigint` fields (`cameraId`, `fromTime`, `toTime`),
 * and React Query hashes keys with `JSON.stringify`, which throws on a bigint.
 * `toJSON` runs before the serializer sees the value, so the key stays
 * serializable while the object still holds the real bigints the backend
 * binding expects.
 */
type SerializableIncidentFilter = IncidentFilter & { toJSON: () => unknown };

function toBackendFilter(
  filters: IncidentFilterState,
): SerializableIncidentFilter {
  const filter: IncidentFilter = {};
  const searchId = filters.searchId.trim();
  if (searchId) filter.searchId = searchId;
  if (filters.status !== "all") filter.status = filters.status;
  if (filters.cameraId !== "all") filter.cameraId = BigInt(filters.cameraId);
  const fromTime = dateToNs(filters.fromDate, false);
  if (fromTime !== undefined) filter.fromTime = fromTime;
  const toTime = dateToNs(filters.toDate, true);
  if (toTime !== undefined) filter.toTime = toTime;
  return {
    ...filter,
    toJSON: () => ({
      ...filter,
      cameraId: filter.cameraId?.toString(),
      fromTime: filter.fromTime?.toString(),
      toTime: filter.toTime?.toString(),
    }),
  };
}

function IncidentTableSkeleton() {
  const ids = Array.from({ length: 6 }, (_, i) => `incident-skeleton-${i}`);
  return (
    <div
      data-ocid="incidents.loading_state"
      className="overflow-hidden rounded-xl border border-border bg-card"
    >
      <div className="border-b border-border bg-secondary/60 px-4 py-3">
        <Skeleton className="h-4 w-40" />
      </div>
      <div className="divide-y divide-border">
        {ids.map((id) => (
          <div key={id} className="flex items-center gap-4 px-4 py-4">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 flex-1" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function IncidentHistoryPage() {
  const [filters, setFilters] =
    useState<IncidentFilterState>(readFiltersFromUrl);
  const [selected, setSelected] = useState<Incident | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const backendFilter = useMemo(() => toBackendFilter(filters), [filters]);
  const incidentsQuery = useIncidents(backendFilter);
  const camerasQuery = useCameras();

  useEffect(() => {
    writeFiltersToUrl(filters);
  }, [filters]);

  const handleSelect = useCallback((incident: Incident) => {
    setSelected(incident);
    setDetailOpen(true);
  }, []);

  const handleReset = useCallback(() => {
    setFilters(EMPTY_INCIDENT_FILTERS);
  }, []);

  const incidents = incidentsQuery.data ?? [];
  const cameras = camerasQuery.data ?? [];
  const hasActiveFilters =
    filters.searchId !== "" ||
    filters.status !== "all" ||
    filters.cameraId !== "all" ||
    filters.fromDate !== "" ||
    filters.toDate !== "";

  return (
    <section data-ocid="incidents.page" className="flex flex-col gap-6">
      <PageHeader
        icon={Activity}
        title="Incident History"
        description="Search incidents by ID and filter by date, camera and status. Open any incident to review its details and event snapshot."
        actions={
          <Button
            type="button"
            variant="outline"
            data-ocid="incidents.refresh_button"
            onClick={() => void incidentsQuery.refetch()}
            disabled={incidentsQuery.isFetching}
          >
            <RefreshCw
              className={
                incidentsQuery.isFetching ? "size-4 animate-spin" : "size-4"
              }
              aria-hidden="true"
            />
            Refresh
          </Button>
        }
      />

      <IncidentFilters
        filters={filters}
        cameras={cameras}
        onChange={setFilters}
        onReset={handleReset}
      />

      {incidentsQuery.isLoading ? (
        <IncidentTableSkeleton />
      ) : incidentsQuery.isError ? (
        <ErrorState
          message={
            incidentsQuery.error instanceof Error
              ? incidentsQuery.error.message
              : "The incident list could not be loaded."
          }
          onRetry={() => void incidentsQuery.refetch()}
        />
      ) : incidents.length === 0 ? (
        <EmptyState
          icon={<SearchX className="size-6" aria-hidden="true" />}
          title={
            hasActiveFilters ? "No matching incidents" : "No incidents recorded"
          }
          description={
            hasActiveFilters
              ? "No incidents match the current search and filters. Try widening the date range or clearing the filters."
              : "Detected incidents will appear here once the accident-analysis pipeline records an event."
          }
          action={
            hasActiveFilters ? (
              <Button
                type="button"
                variant="outline"
                data-ocid="incidents.empty_reset_button"
                onClick={handleReset}
              >
                Clear filters
              </Button>
            ) : undefined
          }
        />
      ) : (
        <>
          <div className="flex items-center justify-between">
            <p
              data-ocid="incidents.result_count"
              className="font-mono text-xs uppercase tracking-wider text-muted-foreground"
            >
              {incidents.length} incident{incidents.length === 1 ? "" : "s"}
            </p>
            {incidentsQuery.isFetching && (
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <RefreshCw className="size-3 animate-spin" aria-hidden="true" />
                Updating…
              </span>
            )}
          </div>
          <IncidentTable incidents={incidents} onSelect={handleSelect} />
        </>
      )}

      <IncidentDetailDialog
        incident={selected}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />
    </section>
  );
}
