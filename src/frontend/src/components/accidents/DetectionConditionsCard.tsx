import type { Settings } from "@/backend";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useSettings, useUpdateSettings } from "@/hooks/useRoadwatch";
import { formatConfidence } from "@/lib/roadwatch";
import { Check, Loader2, SlidersHorizontal } from "lucide-react";
import { useEffect, useState } from "react";

interface Draft {
  sensitivity: number;
  confidenceThreshold: number;
}

function toDraft(settings: Settings): Draft {
  return {
    sensitivity: Math.round(settings.sensitivity * 100),
    confidenceThreshold: Math.round(settings.confidenceThreshold * 100),
  };
}

export function DetectionConditionsCard() {
  const { data: settings } = useSettings();
  const updateSettings = useUpdateSettings();
  const [draft, setDraft] = useState<Draft | null>(null);
  const [saved, setSaved] = useState(false);

  // Initialize the editable draft once from the loaded settings.
  useEffect(() => {
    if (settings && draft === null) setDraft(toDraft(settings));
  }, [settings, draft]);

  const current = draft ?? (settings ? toDraft(settings) : null);

  function handleSave() {
    if (!settings || !current) return;
    setSaved(false);
    updateSettings.mutate(
      {
        ...settings,
        sensitivity: current.sensitivity / 100,
        confidenceThreshold: current.confidenceThreshold / 100,
      },
      {
        onSuccess: () => {
          setSaved(true);
          window.setTimeout(() => setSaved(false), 4000);
        },
      },
    );
  }

  return (
    <Card data-ocid="accidents.conditions_card" className="gap-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-display text-base">
          <SlidersHorizontal
            className="size-4 text-accent"
            aria-hidden="true"
          />
          Detection conditions
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Sensitivity and confidence threshold determine when a potential
          accident event is generated. Saved through the shared settings.
        </p>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-4">
            <Label htmlFor="accidents.sensitivity" className="text-sm">
              Sensitivity
            </Label>
            <span className="font-mono-num text-sm font-semibold text-accent">
              {current ? `${current.sensitivity}%` : "—"}
            </span>
          </div>
          <Slider
            id="accidents.sensitivity"
            data-ocid="accidents.sensitivity_input"
            min={0}
            max={100}
            step={1}
            value={current ? [current.sensitivity] : [50]}
            disabled={!current}
            onValueChange={([value]) =>
              setDraft((prev) => ({
                sensitivity: value,
                confidenceThreshold:
                  prev?.confidenceThreshold ??
                  current?.confidenceThreshold ??
                  50,
              }))
            }
            aria-label="Detection sensitivity"
          />
          <p className="text-xs text-muted-foreground">
            Higher sensitivity flags subtler motion changes as potential
            accidents.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-4">
            <Label htmlFor="accidents.confidence" className="text-sm">
              Confidence threshold
            </Label>
            <span className="font-mono-num text-sm font-semibold text-accent">
              {current
                ? formatConfidence(current.confidenceThreshold / 100)
                : "—"}
            </span>
          </div>
          <Slider
            id="accidents.confidence"
            data-ocid="accidents.confidence_input"
            min={0}
            max={100}
            step={1}
            value={current ? [current.confidenceThreshold] : [50]}
            disabled={!current}
            onValueChange={([value]) =>
              setDraft((prev) => ({
                sensitivity: prev?.sensitivity ?? current?.sensitivity ?? 50,
                confidenceThreshold: value,
              }))
            }
            aria-label="Confidence threshold"
          />
          <p className="text-xs text-muted-foreground">
            Events below this confidence are not raised as potential accidents.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="button"
            data-ocid="accidents.save_conditions_button"
            onClick={handleSave}
            disabled={!current || updateSettings.isPending}
          >
            {updateSettings.isPending ? (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : (
              <Check className="size-4" aria-hidden="true" />
            )}
            Save conditions
          </Button>
          {saved && (
            <span
              data-ocid="accidents.conditions_success_state"
              className="text-sm text-success"
            >
              Detection conditions saved.
            </span>
          )}
          {updateSettings.isError && (
            <span
              data-ocid="accidents.conditions_error_state"
              role="alert"
              className="text-sm text-destructive"
            >
              Could not save detection conditions. Please retry.
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
