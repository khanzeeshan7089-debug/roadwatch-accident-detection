import type { Camera, CameraId } from "@/backend";
import { ConnectionStatus, MonitoringState } from "@/backend";
import { cameraStatusLabel } from "@/lib/roadwatch";
import { cn } from "@/lib/utils";
import { Camera as CameraIcon, MapPin, Radio } from "lucide-react";

function StatusDot({ status }: { status: ConnectionStatus }) {
  const online = status === ConnectionStatus.online;
  return (
    <span
      className={cn(
        "size-2 shrink-0 rounded-full",
        online ? "bg-success status-pulse" : "bg-destructive",
      )}
      aria-hidden="true"
    />
  );
}

export function CameraSelector({
  cameras,
  selectedId,
  onSelect,
}: {
  cameras: Camera[];
  selectedId: CameraId | undefined;
  onSelect: (id: CameraId) => void;
}) {
  return (
    <ul
      data-ocid="live.camera_list"
      className="flex flex-col gap-2"
      aria-label="Select a camera"
    >
      {cameras.map((camera, index) => {
        const selected = camera.id === selectedId;
        const online = camera.connectionStatus === ConnectionStatus.online;
        const monitoring =
          online && camera.monitoringState === MonitoringState.monitoring;
        return (
          <li key={camera.id.toString()}>
            <button
              type="button"
              aria-pressed={selected}
              data-ocid={`live.camera_item.${index + 1}`}
              onClick={() => onSelect(camera.id)}
              className={cn(
                "group flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                selected
                  ? "border-accent/60 bg-accent/10"
                  : "border-border bg-card hover:border-accent/40 hover:bg-secondary/60",
              )}
            >
              <span
                className={cn(
                  "flex size-9 shrink-0 items-center justify-center rounded-md",
                  selected
                    ? "bg-accent/20 text-accent"
                    : "bg-secondary text-muted-foreground group-hover:text-accent",
                )}
              >
                <CameraIcon className="size-4" aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2">
                  <span className="truncate font-mono text-xs font-semibold uppercase tracking-wider text-foreground">
                    {camera.code}
                  </span>
                  <StatusDot status={camera.connectionStatus} />
                </span>
                <span className="mt-0.5 block truncate text-sm text-foreground">
                  {camera.name}
                </span>
                <span className="mt-0.5 flex items-center gap-1 truncate text-xs text-muted-foreground">
                  <MapPin className="size-3 shrink-0" aria-hidden="true" />
                  {camera.roadName} · {camera.area}
                </span>
              </span>
              <span className="flex shrink-0 flex-col items-end gap-1">
                <span
                  className={cn(
                    "font-mono text-[0.6rem] uppercase tracking-wider",
                    online ? "text-success" : "text-destructive",
                  )}
                >
                  {cameraStatusLabel(camera.connectionStatus)}
                </span>
                {monitoring && (
                  <span
                    data-ocid={`live.camera_monitoring.${index + 1}`}
                    className="inline-flex items-center gap-1 font-mono text-[0.6rem] uppercase tracking-wider text-accent"
                  >
                    <Radio className="size-3" aria-hidden="true" />
                    Monitoring
                  </span>
                )}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
