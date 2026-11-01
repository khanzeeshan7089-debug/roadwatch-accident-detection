import type { DetectionLog } from "@/backend";
import { formatConfidence, vehicleClassLabel } from "@/lib/roadwatch";
import { cn } from "@/lib/utils";

/** Per-class accent used for the bounding-box stroke and label chip. */
const CLASS_ACCENT: Record<string, string> = {
  car: "border-accent text-accent",
  motorcycle: "border-primary text-primary",
  bus: "border-warning text-warning",
  truck: "border-success text-success",
};

/**
 * A single detection rendered as an absolutely-positioned bounding box over the
 * video frame. Coordinates are normalised (0–1) so the overlay scales with the
 * frame at any viewport size.
 */
export function DetectionOverlay({
  detection,
  index,
}: {
  detection: DetectionLog;
  index: number;
}) {
  const { box } = detection;
  const accent =
    CLASS_ACCENT[detection.vehicleClass] ?? "border-accent text-accent";

  return (
    <div
      data-ocid={`vehicles.box.${index + 1}`}
      className={cn(
        "pointer-events-none absolute rounded-sm border-2 transition-smooth",
        accent,
        detection.simulated && "border-dashed",
      )}
      style={{
        left: `${box.x * 100}%`,
        top: `${box.y * 100}%`,
        width: `${box.width * 100}%`,
        height: `${box.height * 100}%`,
      }}
    >
      <span
        className={cn(
          "absolute -top-6 left-0 flex items-center gap-1.5 whitespace-nowrap rounded-sm border bg-background/90 px-1.5 py-0.5 font-mono-num text-[11px] font-medium backdrop-blur-sm",
          accent,
        )}
      >
        {vehicleClassLabel(detection.vehicleClass)}
        <span className="text-muted-foreground">·</span>
        {formatConfidence(detection.confidence)}
        {detection.simulated && (
          <span
            data-ocid={`vehicles.box_simulated_badge.${index + 1}`}
            className="rounded-sm border border-warning/60 bg-warning/15 px-1 font-mono text-[9px] uppercase tracking-wider text-warning"
          >
            Simulated
          </span>
        )}
      </span>
    </div>
  );
}
