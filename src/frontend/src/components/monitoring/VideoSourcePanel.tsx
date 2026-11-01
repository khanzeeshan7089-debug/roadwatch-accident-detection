import type { Camera } from "@/backend";
import { VideoSourceKind } from "@/backend";
import {
  isSampleSource,
  sourceKindLabel,
  sourceUnavailableReason,
  videoSourceUrl,
} from "@/lib/roadwatch";
import { cn } from "@/lib/utils";
import { FileVideo, Film, Radio, Settings2, VideoOff } from "lucide-react";
import type { ReactNode, RefObject } from "react";

const SOURCE_ICONS = {
  [VideoSourceKind.rtspStream]: Radio,
  [VideoSourceKind.uploadedFile]: FileVideo,
  [VideoSourceKind.sample]: Film,
} as const;

/**
 * The monitoring video surface. Plays the camera's actual stored clip through a
 * native HTML5 video element, or shows an explicit state when the source cannot
 * be played in this environment. Detection overlays are layered on top of the
 * video so their normalised boxes scale with the rendered frame.
 */
export function VideoSourcePanel({
  camera,
  videoRef,
  onLoadedMetadata,
  onTimeUpdate,
  onPlay,
  onPause,
  onEnded,
  overlay,
}: {
  camera: Camera;
  videoRef: RefObject<HTMLVideoElement | null>;
  onLoadedMetadata: () => void;
  onTimeUpdate: () => void;
  onPlay: () => void;
  onPause: () => void;
  onEnded: () => void;
  overlay?: ReactNode;
}) {
  const url = videoSourceUrl(camera);
  const reason = sourceUnavailableReason(camera);
  const sample = isSampleSource(camera);
  const Icon = SOURCE_ICONS[camera.sourceKind] ?? VideoOff;

  return (
    <div
      data-ocid="live.video_panel"
      className="overflow-hidden rounded-xl border border-border bg-card"
    >
      <div className="relative aspect-video w-full bg-black">
        {url ? (
          <>
            {/* biome-ignore lint/a11y/useMediaCaption: the clip is a silent traffic recording with no speech track */}
            <video
              ref={videoRef}
              data-ocid="live.video_element"
              src={url}
              controls
              playsInline
              preload="metadata"
              onLoadedMetadata={onLoadedMetadata}
              onTimeUpdate={onTimeUpdate}
              onPlay={onPlay}
              onPause={onPause}
              onEnded={onEnded}
              className="absolute inset-0 size-full bg-black object-contain"
            />
            <div className="pointer-events-none absolute left-3 top-3 flex flex-wrap items-center gap-2">
              <span className="rounded-md border border-border bg-background/85 px-2 py-1 font-mono text-[0.65rem] uppercase tracking-wider text-foreground backdrop-blur-sm">
                {camera.code}
              </span>
              <span
                className={cn(
                  "rounded-md border px-2 py-1 font-mono text-[0.65rem] uppercase tracking-wider backdrop-blur-sm",
                  sample
                    ? "border-warning/50 bg-warning/15 text-warning"
                    : "border-accent/50 bg-accent/15 text-accent",
                )}
              >
                {sample
                  ? "Sample clip · not live CCTV"
                  : sourceKindLabel(camera.sourceKind)}
              </span>
            </div>
            {overlay}
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-background bg-grid">
            <div
              data-ocid="live.no_source_state"
              className="flex flex-col items-center gap-3 px-6 text-center"
            >
              <span className="flex size-14 items-center justify-center rounded-full border border-dashed border-border bg-secondary text-muted-foreground">
                <Icon className="size-6" aria-hidden="true" />
              </span>
              <div>
                <p className="font-display text-sm font-semibold text-foreground">
                  {camera.sourceKind === VideoSourceKind.rtspStream
                    ? "RTSP stream unsupported here"
                    : "No video source configured"}
                </p>
                <p className="mt-1 max-w-md text-xs text-muted-foreground">
                  {reason}
                </p>
              </div>
              <a
                href="/cameras"
                data-ocid="live.manage_cameras_link"
                className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-smooth hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Settings2 className="size-4" aria-hidden="true" />
                Configure in Camera Management
              </a>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-border px-4 py-3">
        <Meta label="Camera" value={camera.code} mono />
        <Meta label="Name" value={camera.name} />
        <Meta label="Road" value={camera.roadName} />
        <Meta label="Area" value={camera.area} />
        <span
          className={cn(
            "ml-auto inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[0.6rem] uppercase tracking-wider",
            url
              ? "border-success/40 bg-success/10 text-success"
              : "border-destructive/40 bg-destructive/10 text-destructive",
          )}
        >
          {url ? "Source ready" : "Source unavailable"}
        </span>
      </div>
    </div>
  );
}

function Meta({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <span className="flex min-w-0 flex-col">
      <span className="font-mono text-[0.6rem] uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <span
        className={cn(
          "truncate text-sm text-foreground",
          mono && "font-mono text-xs",
        )}
      >
        {value}
      </span>
    </span>
  );
}
