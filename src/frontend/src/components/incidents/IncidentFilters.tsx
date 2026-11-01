import { type Camera, IncidentStatus } from "@/backend";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cameraLabel, incidentStatusLabel } from "@/lib/roadwatch";
import { Search, X } from "lucide-react";

export interface IncidentFilterState {
  searchId: string;
  status: IncidentStatus | "all";
  cameraId: string;
  fromDate: string;
  toDate: string;
}

export const EMPTY_INCIDENT_FILTERS: IncidentFilterState = {
  searchId: "",
  status: "all",
  cameraId: "all",
  fromDate: "",
  toDate: "",
};

const STATUS_OPTIONS: IncidentStatus[] = [
  IncidentStatus.potential,
  IncidentStatus.verified,
  IncidentStatus.falseAlarm,
  IncidentStatus.resolved,
];

export function IncidentFilters({
  filters,
  cameras,
  onChange,
  onReset,
}: {
  filters: IncidentFilterState;
  cameras: Camera[];
  onChange: (next: IncidentFilterState) => void;
  onReset: () => void;
}) {
  const hasActiveFilters =
    filters.searchId !== "" ||
    filters.status !== "all" ||
    filters.cameraId !== "all" ||
    filters.fromDate !== "" ||
    filters.toDate !== "";

  return (
    <div
      data-ocid="incidents.filters"
      className="rounded-xl border border-border bg-card p-4 shadow-sm"
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <div className="flex flex-col gap-1.5 xl:col-span-2">
          <Label
            htmlFor="incident-search"
            className="text-xs text-muted-foreground"
          >
            Search by incident ID
          </Label>
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              id="incident-search"
              data-ocid="incidents.search_input"
              value={filters.searchId}
              onChange={(event) =>
                onChange({ ...filters, searchId: event.target.value })
              }
              placeholder="e.g. 12"
              inputMode="numeric"
              className="pl-9"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label
            htmlFor="incident-status"
            className="text-xs text-muted-foreground"
          >
            Status
          </Label>
          <Select
            value={filters.status}
            onValueChange={(value) =>
              onChange({
                ...filters,
                status: value as IncidentStatus | "all",
              })
            }
          >
            <SelectTrigger
              id="incident-status"
              data-ocid="incidents.status_select"
              className="w-full"
            >
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {STATUS_OPTIONS.map((status) => (
                <SelectItem key={status} value={status}>
                  {incidentStatusLabel(status)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label
            htmlFor="incident-camera"
            className="text-xs text-muted-foreground"
          >
            Camera
          </Label>
          <Select
            value={filters.cameraId}
            onValueChange={(value) => onChange({ ...filters, cameraId: value })}
          >
            <SelectTrigger
              id="incident-camera"
              data-ocid="incidents.camera_select"
              className="w-full"
            >
              <SelectValue placeholder="All cameras" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All cameras</SelectItem>
              {cameras.map((camera) => (
                <SelectItem
                  key={camera.id.toString()}
                  value={camera.id.toString()}
                >
                  {cameraLabel(camera)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label
            htmlFor="incident-from"
            className="text-xs text-muted-foreground"
          >
            From date
          </Label>
          <Input
            id="incident-from"
            data-ocid="incidents.from_date_input"
            type="date"
            value={filters.fromDate}
            max={filters.toDate || undefined}
            onChange={(event) =>
              onChange({ ...filters, fromDate: event.target.value })
            }
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label
            htmlFor="incident-to"
            className="text-xs text-muted-foreground"
          >
            To date
          </Label>
          <Input
            id="incident-to"
            data-ocid="incidents.to_date_input"
            type="date"
            value={filters.toDate}
            min={filters.fromDate || undefined}
            onChange={(event) =>
              onChange({ ...filters, toDate: event.target.value })
            }
          />
        </div>
      </div>

      {hasActiveFilters && (
        <div className="mt-4 flex justify-end">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            data-ocid="incidents.reset_filters_button"
            onClick={onReset}
          >
            <X className="size-4" aria-hidden="true" />
            Clear filters
          </Button>
        </div>
      )}
    </div>
  );
}
