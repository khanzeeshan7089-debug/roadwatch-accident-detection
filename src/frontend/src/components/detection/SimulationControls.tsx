import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FlaskConical, Loader2, Sparkles } from "lucide-react";

/**
 * Simulation-mode controls. Real model inference is not available in this
 * build, so the simulation pipeline is the only source of detections and every
 * result it produces is labelled as simulated.
 */
export function SimulationControls({
  simulationMode,
  onToggleSimulation,
  onGenerate,
  isGenerating,
  canGenerate,
  disabledReason,
}: {
  simulationMode: boolean;
  onToggleSimulation: () => void;
  onGenerate: () => void;
  isGenerating: boolean;
  canGenerate: boolean;
  disabledReason?: string;
}) {
  return (
    <div
      data-ocid="vehicles.simulation_panel"
      className="rounded-xl border border-warning/40 bg-warning/5 p-4"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-warning/15 text-warning">
            <FlaskConical className="size-4" aria-hidden="true" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display text-sm font-semibold text-foreground">
                Simulation mode
              </h2>
              <Badge
                variant="outline"
                className={
                  simulationMode
                    ? "border-warning/60 text-warning"
                    : "border-border text-muted-foreground"
                }
              >
                {simulationMode ? "Active" : "Off"}
              </Badge>
            </div>
            <p className="mt-1 max-w-md text-xs text-muted-foreground">
              No trained detection model is loaded in this build. Simulation
              mode produces representative detections that are clearly marked as
              simulated and never presented as real model output.
            </p>
          </div>
        </div>

        <Button
          type="button"
          variant={simulationMode ? "outline" : "default"}
          data-ocid="vehicles.simulation_toggle"
          onClick={onToggleSimulation}
        >
          {simulationMode ? "Turn off simulation" : "Turn on simulation"}
        </Button>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-warning/20 pt-4">
        <Button
          type="button"
          data-ocid="vehicles.generate_button"
          onClick={onGenerate}
          disabled={!canGenerate || isGenerating}
        >
          {isGenerating ? (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          ) : (
            <Sparkles className="size-4" aria-hidden="true" />
          )}
          {isGenerating ? "Generating…" : "Generate simulated detections"}
        </Button>
        {!canGenerate && disabledReason && (
          <p className="text-xs text-muted-foreground">{disabledReason}</p>
        )}
      </div>
    </div>
  );
}
