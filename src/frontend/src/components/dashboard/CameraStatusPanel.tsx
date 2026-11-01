import type { Camera } from "@/backend";
import { EmptyState } from "@/components/PageState";
import { StatusDot } from "@/components/dashboard/StatusDot";
import { cameraStatusLabel, monitoringLabel } from "@/lib/roadwatch";
import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Camera as CameraIcon } from "lucide-react";

export function CameraStatusPanel({ cameras }: { cameras: Camera[] }) {
  const online = cameras.filter((c) => c.connectionStatus === "online").length;

  return (
    <section
      data-ocid="dashboard.camera_status.panel"
      className="flex h-full flex-col rounded-xl border border-border bg-card"
    >
      <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
        <div className="flex items-center gap-2">
          <CameraIcon className="size-4 text-accent" aria-hidden="true" />
          <h2 className="font-display text-sm font-semibold uppercase tracking-wider text-foreground">
            Camera Connection Status
          </h2>
        </div>
        <span className="font-mono text-[0.65rem] uppercase tracking-wider text-muted-foreground">
          {online}/{cameras.length} online
        </span>
      </div>

      {cameras.length === 0 ? (
        <div className="p-5">
          <EmptyState
            title="No cameras registered"
            description="Add a camera to begin monitoring road segments and detecting vehicles."
            icon={<CameraIcon className="size-6" aria-hidden="true" />}
            action={
              <Link
                to="/cameras"
                data-ocid="dashboard.camera_status.add_link"
                className="inline-flex items-center gap-1 text-sm font-medium text-accent transition-smooth hover:text-accent/80"
              >
                Manage cameras
                <ArrowRight className="size-3.5" aria-hidden="true" />
              </Link>
            }
          />
        </div>
      ) : (
        <ul
          data-ocid="dashboard.camera_status.list"
          className="max-h-[22rem] divide-y divide-border overflow-y-auto"
        >
          {cameras.map((camera, index) => {
            const isOnline = camera.connectionStatus === "online";
            // A camera is only "Monitoring" when it is both online and in an
            // active monitoring session; a disconnected camera shows offline.
            const isMonitoring =
              isOnline && camera.monitoringState === "monitoring";
            return (
              <li
                key={camera.id.toString()}
                data-ocid={`dashboard.camera_status.item.${index + 1}`}
                className="flex items-center gap-3 px-5 py-3"
              >
                <StatusDot
                  tone={isOnline ? "success" : "danger"}
                  pulse={isOnline && isMonitoring}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-mono text-xs text-foreground">
                    {camera.code}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {camera.roadName}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <span
                    className={cn(
                      "font-mono text-[0.6rem] uppercase tracking-wider",
                      isOnline ? "text-success" : "text-destructive",
                    )}
                  >
                    {cameraStatusLabel(camera.connectionStatus)}
                  </span>
                  <span
                    className={cn(
                      "rounded-full border px-2 py-0.5 font-mono text-[0.6rem] uppercase tracking-wider",
                      isMonitoring
                        ? "border-accent/40 bg-accent/10 text-accent"
                        : "border-border bg-muted text-muted-foreground",
                    )}
                  >
                    {isMonitoring
                      ? monitoringLabel(camera.monitoringState)
                      : cameraStatusLabel(camera.connectionStatus)}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
