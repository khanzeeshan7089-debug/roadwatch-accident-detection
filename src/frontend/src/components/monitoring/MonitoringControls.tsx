import type { Camera } from "@/backend";
import { ConnectionStatus, MonitoringState } from "@/backend";
import { Button } from "@/components/ui/button";
import { sourceUnavailableReason } from "@/lib/roadwatch";
import { cn } from "@/lib/utils";
import { AlertTriangle, Loader2, Play, Square } from "lucide-react";

export function MonitoringControls({
  camera,
  sourceReady,
  isStarting,
  isStopping,
  onStart,
  onStop,
}: {
  camera: Camera;
  sourceReady: boolean;
  isStarting: boolean;
  isStopping: boolean;
  onStart: () => void;
  onStop: () => void;
}) {
  const monitoring = camera.monitoringState === MonitoringState.monitoring;
  const online = camera.connectionStatus === ConnectionStatus.online;
  const busy = isStarting || isStopping;
  const canStart = sourceReady && online && !monitoring && !busy;

  const blockedReason = !online
    ? "This camera is offline. Reconnect it before starting a monitoring session."
    : !sourceReady
      ? (sourceUnavailableReason(camera) ??
        "Add a video source before starting the pipeline.")
      : null;

  return (
    <div
      data-ocid="live.controls"
      className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="min-w-0">
        <p className="font-display text-sm font-semibold text-foreground">
          Detection pipeline
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {monitoring
            ? "Processing frames for this camera. Stop to end the current session."
            : canStart
              ? "Start processing to run the detection pipeline on this camera."
              : (blockedReason ??
                "Start processing to run the detection pipeline.")}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <Button
          type="button"
          data-ocid="live.start_button"
          onClick={onStart}
          disabled={!canStart}
          className={cn(!monitoring && canStart && "gradient-primary")}
        >
          {isStarting ? (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          ) : (
            <Play className="size-4" aria-hidden="true" />
          )}
          Start processing
        </Button>
        <Button
          type="button"
          variant="outline"
          data-ocid="live.stop_button"
          onClick={onStop}
          disabled={!monitoring || busy}
          className="border-destructive/50 text-destructive hover:bg-destructive/10 hover:text-destructive"
        >
          {isStopping ? (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          ) : (
            <Square className="size-4" aria-hidden="true" />
          )}
          Stop processing
        </Button>
      </div>

      {blockedReason && !monitoring && (
        <p
          data-ocid="live.start_blocked_reason"
          className="flex items-start gap-2 text-xs text-warning sm:order-last sm:w-full"
        >
          <AlertTriangle
            className="mt-0.5 size-3.5 shrink-0"
            aria-hidden="true"
          />
          {blockedReason}
        </p>
      )}
    </div>
  );
}
