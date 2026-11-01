import { Button } from "@/components/ui/button";
import { Cpu, RefreshCw } from "lucide-react";

/**
 * Explicit model-unavailable state. Shown when the detection model cannot be
 * loaded; no detections are rendered while it is active.
 */
export function ModelUnavailableState({
  onRetry,
  onEnableSimulation,
}: {
  onRetry: () => void;
  onEnableSimulation: () => void;
}) {
  return (
    <output
      data-ocid="vehicles.model_unavailable"
      className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-warning/50 bg-warning/5 px-6 py-12 text-center"
    >
      <div className="flex size-12 items-center justify-center rounded-full bg-warning/15 text-warning">
        <Cpu className="size-6" aria-hidden="true" />
      </div>
      <h3 className="font-display text-lg font-semibold text-foreground">
        Detection model unavailable
      </h3>
      <p className="max-w-md text-sm text-muted-foreground">
        The vehicle detection model could not be loaded, so no detections are
        shown. Enable simulation mode to preview representative detections, or
        retry loading the model.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <Button
          type="button"
          variant="outline"
          data-ocid="vehicles.model_retry_button"
          onClick={onRetry}
        >
          <RefreshCw className="size-4" aria-hidden="true" />
          Retry
        </Button>
        <Button
          type="button"
          data-ocid="vehicles.enable_simulation_button"
          onClick={onEnableSimulation}
        >
          Enable simulation mode
        </Button>
      </div>
    </output>
  );
}
