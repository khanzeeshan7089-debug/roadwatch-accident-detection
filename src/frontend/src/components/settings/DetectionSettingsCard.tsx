import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import {
  Check,
  Gauge,
  Loader2,
  Radio,
  Save,
  TriangleAlert,
} from "lucide-react";

export interface DetectionSettingsDraft {
  sensitivity: number;
  confidenceThreshold: number;
  simulationMode: boolean;
}

const SENSITIVITY_HINT = [
  "Low — only strong, sustained motion is flagged.",
  "Balanced — typical urban traffic conditions.",
  "High — subtle multi-frame changes are flagged.",
];

function sensitivityHint(value: number): string {
  if (value < 34) return SENSITIVITY_HINT[0];
  if (value < 67) return SENSITIVITY_HINT[1];
  return SENSITIVITY_HINT[2];
}

function confidenceHint(value: number): string {
  if (value < 40)
    return "Permissive — more potential events, more false alarms.";
  if (value < 70) return "Balanced — recommended for seminar demonstrations.";
  return "Strict — only high-confidence potential accidents are raised.";
}

export function DetectionSettingsCard({
  draft,
  onChange,
  onSave,
  isSaving,
  isDirty,
  savedAt,
  errorMessage,
}: {
  draft: DetectionSettingsDraft;
  onChange: (next: Partial<DetectionSettingsDraft>) => void;
  onSave: () => void;
  isSaving: boolean;
  isDirty: boolean;
  savedAt: string | null;
  errorMessage: string | null;
}) {
  return (
    <section
      data-ocid="settings.detection_card"
      className="animate-fade-in rounded-xl border border-border bg-card p-5 shadow-subtle sm:p-6"
    >
      <header className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-secondary text-accent">
          <Gauge className="size-5" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <h2 className="font-display text-lg font-semibold text-foreground">
            Detection pipeline
          </h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Tune how the accident-analysis pipeline reads consecutive frames.
          </p>
        </div>
      </header>

      <div className="mt-6 space-y-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-4">
            <Label
              htmlFor="settings-sensitivity"
              className="text-sm font-medium"
            >
              Detection sensitivity
            </Label>
            <span className="font-mono-num rounded-md border border-border bg-secondary px-2 py-0.5 text-sm font-semibold text-accent">
              {draft.sensitivity}
            </span>
          </div>
          <Slider
            id="settings-sensitivity"
            data-ocid="settings.sensitivity_input"
            min={0}
            max={100}
            step={1}
            value={[draft.sensitivity]}
            onValueChange={([value]) => onChange({ sensitivity: value })}
            aria-label="Detection sensitivity"
          />
          <p className="text-xs text-muted-foreground">
            {sensitivityHint(draft.sensitivity)}
          </p>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between gap-4">
            <Label
              htmlFor="settings-confidence"
              className="text-sm font-medium"
            >
              Confidence threshold
            </Label>
            <span className="font-mono-num rounded-md border border-border bg-secondary px-2 py-0.5 text-sm font-semibold text-accent">
              {draft.confidenceThreshold}%
            </span>
          </div>
          <Slider
            id="settings-confidence"
            data-ocid="settings.confidence_input"
            min={0}
            max={100}
            step={1}
            value={[draft.confidenceThreshold]}
            onValueChange={([value]) =>
              onChange({ confidenceThreshold: value })
            }
            aria-label="Confidence threshold"
          />
          <p className="text-xs text-muted-foreground">
            {confidenceHint(draft.confidenceThreshold)}
          </p>
        </div>

        <div className="flex items-start justify-between gap-4 rounded-lg border border-border bg-secondary/40 p-4">
          <div className="flex min-w-0 items-start gap-3">
            <Radio
              className={cn(
                "mt-0.5 size-4 shrink-0",
                draft.simulationMode ? "text-warning" : "text-success",
              )}
              aria-hidden="true"
            />
            <div className="min-w-0">
              <Label
                htmlFor="settings-simulation"
                className="text-sm font-medium"
              >
                Simulation mode
              </Label>
              <p className="mt-1 text-xs text-muted-foreground">
                {draft.simulationMode
                  ? "Detection results are generated by the simulation pipeline and every event is labelled as simulated. No trained model is running."
                  : "The pipeline reports live model output. Enable this only when a trained accident-classification model is connected."}
              </p>
            </div>
          </div>
          <Switch
            id="settings-simulation"
            data-ocid="settings.simulation_toggle"
            checked={draft.simulationMode}
            onCheckedChange={(checked) => onChange({ simulationMode: checked })}
            aria-label="Simulation mode"
          />
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-border pt-5">
        <Button
          type="button"
          data-ocid="settings.save_button"
          onClick={onSave}
          disabled={isSaving || !isDirty}
        >
          {isSaving ? (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          ) : (
            <Save className="size-4" aria-hidden="true" />
          )}
          {isSaving ? "Saving…" : "Save settings"}
        </Button>

        {!isDirty && savedAt && (
          <span
            data-ocid="settings.saved_state"
            className="inline-flex items-center gap-1.5 text-xs text-success"
          >
            <Check className="size-3.5" aria-hidden="true" />
            Saved {savedAt}
          </span>
        )}
        {isDirty && (
          <span className="text-xs text-muted-foreground">Unsaved changes</span>
        )}
        {errorMessage && (
          <span
            data-ocid="settings.save_error"
            role="alert"
            className="inline-flex items-center gap-1.5 text-xs text-destructive"
          >
            <TriangleAlert className="size-3.5" aria-hidden="true" />
            {errorMessage}
          </span>
        )}
      </div>
    </section>
  );
}
