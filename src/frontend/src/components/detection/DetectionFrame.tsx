import type { Camera, DetectionLog } from "@/backend";
import { cameraLabel } from "@/lib/roadwatch";
import { cn } from "@/lib/utils";
import { ScanLine } from "lucide-react";
import { DetectionOverlay } from "./DetectionOverlay";

/**
 * Bounding-box overlay for vehicle detections. Coordinates are normalised
 * (0–1), so the boxes scale with the rendered frame at any viewport size.
 *
 * Two modes:
 * - Standalone (`camera` supplied): renders a stylised control-room viewport
 *   with the boxes layered over it.
 * - Overlay (`camera` omitted): renders only the box layer, for use as the
 *   overlay child of a real video surface.
 */
export function DetectionFrame({
  camera,
  detections,
  modelAvailable,
  monitoring = false,
}: {
  camera?: Camera;
  detections: DetectionLog[];
  modelAvailable: boolean;
  monitoring?: boolean;
}) {
  const boxes = (
    <>
      {modelAvailable &&
        detections.map((detection, index) => (
          <DetectionOverlay
            key={detection.id.toString()}
            detection={detection}
            index={index}
          />
        ))}

      {modelAvailable && detections.length === 0 && monitoring && (
        <div className="absolute bottom-3 left-3 flex items-center gap-2 rounded-md border border-border bg-background/85 px-2 py-1 backdrop-blur-sm">
          <ScanLine className="size-3.5 text-accent" aria-hidden="true" />
          <span className="font-mono text-[0.65rem] uppercase tracking-wider text-muted-foreground">
            Scanning for vehicles…
          </span>
        </div>
      )}

      {!modelAvailable && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-background/70 text-center backdrop-blur-[2px]">
          <p className="font-display text-sm font-semibold text-foreground">
            No detections rendered
          </p>
          <p className="max-w-xs text-xs text-muted-foreground">
            The detection model is unavailable, so no bounding boxes are drawn.
          </p>
        </div>
      )}

      <div
        className={cn(
          "absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-accent/10 to-transparent",
          modelAvailable && monitoring && "animate-[scan_4s_linear_infinite]",
        )}
        aria-hidden="true"
      />
    </>
  );

  if (!camera) {
    return (
      <div
        data-ocid="vehicles.frame"
        className="pointer-events-none absolute inset-0"
      >
        {boxes}
      </div>
    );
  }

  return (
    <div
      data-ocid="vehicles.frame"
      className="relative aspect-video w-full overflow-hidden rounded-xl border border-border bg-background"
    >
      <div className="absolute inset-0 bg-grid opacity-60" aria-hidden="true" />
      <div
        className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-secondary/70 to-transparent"
        aria-hidden="true"
      />
      <div
        className="absolute inset-x-0 top-1/2 h-px bg-border"
        aria-hidden="true"
      />

      <div className="absolute left-3 top-3 flex items-center gap-2 rounded-md border border-border bg-background/80 px-2 py-1 backdrop-blur-sm">
        <ScanLine className="size-3.5 text-accent" aria-hidden="true" />
        <span className="font-mono-num text-[11px] uppercase tracking-wider text-muted-foreground">
          {cameraLabel(camera)}
        </span>
      </div>

      {boxes}
    </div>
  );
}
