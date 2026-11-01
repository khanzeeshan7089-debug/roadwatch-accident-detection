import { type Camera, ConnectionStatus, MonitoringState } from "@/backend";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  useDeleteCamera,
  useStartMonitoring,
  useStopMonitoring,
} from "@/hooks/useRoadwatch";
import {
  cameraStatusLabel,
  formatCoordinates,
  monitoringLabel,
  roadwatchErrorMessage,
  sourceKindLabel,
} from "@/lib/roadwatch";
import { cn } from "@/lib/utils";
import {
  Loader2,
  MapPin,
  Pause,
  Play,
  Radio,
  Trash2,
  Video,
} from "lucide-react";
import { useState } from "react";

function StatusDot({ online }: { online: boolean }) {
  return (
    <span
      className={cn(
        "size-2 rounded-full",
        online ? "bg-success status-pulse" : "bg-muted-foreground",
      )}
      aria-hidden="true"
    />
  );
}

export function CameraCard({
  camera,
  index,
  onConfigureSource,
}: {
  camera: Camera;
  index: number;
  onConfigureSource: (camera: Camera) => void;
}) {
  const startMonitoring = useStartMonitoring();
  const stopMonitoring = useStopMonitoring();
  const deleteCamera = useDeleteCamera();
  const [actionError, setActionError] = useState<string | null>(null);

  const online = camera.connectionStatus === ConnectionStatus.online;
  const monitoring = camera.monitoringState === MonitoringState.monitoring;
  const busy =
    startMonitoring.isPending ||
    stopMonitoring.isPending ||
    deleteCamera.isPending;

  function toggleMonitoring() {
    setActionError(null);
    const mutation = monitoring ? stopMonitoring : startMonitoring;
    mutation.mutate(camera.id, {
      onSuccess: (result) => {
        if (result.__kind__ === "err") {
          setActionError(roadwatchErrorMessage(result.err));
        }
      },
      onError: (error) => {
        setActionError(
          error instanceof Error
            ? error.message
            : "The monitoring state could not be changed.",
        );
      },
    });
  }

  function handleDelete() {
    setActionError(null);
    deleteCamera.mutate(camera.id, {
      onSuccess: (result) => {
        if (result.__kind__ === "err") {
          setActionError(roadwatchErrorMessage(result.err));
        }
      },
      onError: (error) => {
        setActionError(
          error instanceof Error
            ? error.message
            : "The camera could not be deleted.",
        );
      },
    });
  }

  return (
    <Card
      data-ocid={`cameras.item.${index}`}
      className="gap-4 rounded-lg border-border bg-card p-5 shadow-none transition-smooth hover:border-accent/50"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs uppercase tracking-wider text-accent">
              {camera.code}
            </span>
            <Badge
              variant="outline"
              className={cn(
                "gap-1.5 border-transparent",
                online
                  ? "bg-success/15 text-success"
                  : "bg-muted text-muted-foreground",
              )}
            >
              <StatusDot online={online} />
              {cameraStatusLabel(camera.connectionStatus)}
            </Badge>
          </div>
          <h3 className="mt-1.5 truncate font-display text-base font-semibold text-foreground">
            {camera.name}
          </h3>
        </div>
        <Badge
          variant="outline"
          className={cn(
            "shrink-0 border-transparent",
            monitoring
              ? "bg-accent/15 text-accent"
              : "bg-secondary text-muted-foreground",
          )}
        >
          {monitoringLabel(camera.monitoringState)}
        </Badge>
      </div>

      <dl className="grid gap-2 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <MapPin className="size-4 shrink-0 text-accent" aria-hidden="true" />
          <dt className="sr-only">Road location</dt>
          <dd className="min-w-0 truncate">
            {camera.roadName}
            {camera.area ? `, ${camera.area}` : ""}
          </dd>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Radio className="size-4 shrink-0 text-accent" aria-hidden="true" />
          <dt className="sr-only">Coordinates</dt>
          <dd className="font-mono-num text-xs">
            {formatCoordinates(camera.latitude, camera.longitude)}
          </dd>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Video className="size-4 shrink-0 text-accent" aria-hidden="true" />
          <dt className="sr-only">Video source</dt>
          <dd className="min-w-0 truncate">
            {sourceKindLabel(camera.sourceKind)}
            {camera.sourceKind === "rtspStream" && camera.rtspUrl
              ? ` · ${camera.rtspUrl}`
              : ""}
            {camera.sourceKind === "uploadedFile" && camera.uploadedFileRef
              ? ` · ${camera.uploadedFileRef.filename ?? "Uploaded video"}`
              : ""}
          </dd>
        </div>
      </dl>

      {actionError && (
        <p
          data-ocid={`cameras.item_error.${index}`}
          role="alert"
          className="rounded-md border border-destructive/40 bg-destructive/10 px-2.5 py-1.5 text-xs text-destructive"
        >
          {actionError}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-2 border-t border-border pt-4">
        <Button
          type="button"
          size="sm"
          variant={monitoring ? "outline" : "default"}
          data-ocid={`cameras.monitor_toggle.${index}`}
          onClick={toggleMonitoring}
          disabled={busy}
        >
          {startMonitoring.isPending || stopMonitoring.isPending ? (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          ) : monitoring ? (
            <Pause className="size-4" aria-hidden="true" />
          ) : (
            <Play className="size-4" aria-hidden="true" />
          )}
          {monitoring ? "Stop monitoring" : "Start monitoring"}
        </Button>

        <Button
          type="button"
          size="sm"
          variant="outline"
          data-ocid={`cameras.source_button.${index}`}
          onClick={() => onConfigureSource(camera)}
          disabled={busy}
        >
          <Video className="size-4" aria-hidden="true" />
          Video source
        </Button>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="ml-auto text-destructive hover:bg-destructive/10 hover:text-destructive"
              data-ocid={`cameras.delete_button.${index}`}
              disabled={busy}
            >
              <Trash2 className="size-4" aria-hidden="true" />
              Delete
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent data-ocid={`cameras.delete_modal.${index}`}>
            <AlertDialogHeader>
              <AlertDialogTitle className="font-display">
                Delete {camera.code}?
              </AlertDialogTitle>
              <AlertDialogDescription>
                This removes {camera.name} from the registry. Existing incidents
                and alerts keep their recorded snapshot of this camera.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel data-ocid={`cameras.delete_cancel.${index}`}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                data-ocid={`cameras.delete_confirm.${index}`}
                onClick={handleDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete camera
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Card>
  );
}
