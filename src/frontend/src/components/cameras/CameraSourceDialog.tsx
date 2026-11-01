import { type Camera, ExternalBlob, VideoSourceKind } from "@/backend";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useSetCameraSource } from "@/hooks/useRoadwatch";
import { roadwatchErrorMessage } from "@/lib/roadwatch";
import { cn } from "@/lib/utils";
import {
  AlertTriangle,
  CheckCircle2,
  FileVideo,
  Loader2,
  Radio,
  Upload,
} from "lucide-react";
import { type ChangeEvent, useEffect, useState } from "react";
import { ACCEPTED_VIDEO_TYPES, isValidStreamUrl } from "./cameraForm";

type UploadState = "idle" | "uploading" | "done" | "error";

const SOURCE_OPTIONS: Array<{
  value: VideoSourceKind;
  label: string;
  description: string;
  icon: typeof Radio;
}> = [
  {
    value: VideoSourceKind.rtspStream,
    label: "RTSP stream",
    description: "Pull a live feed from a network camera.",
    icon: Radio,
  },
  {
    value: VideoSourceKind.uploadedFile,
    label: "Uploaded file",
    description: "Store an MP4 or AVI recording with this camera.",
    icon: FileVideo,
  },
  {
    value: VideoSourceKind.sample,
    label: "Sample video",
    description: "Use the built-in sample clip for testing.",
    icon: CheckCircle2,
  },
];

export function CameraSourceDialog({
  camera,
  open,
  onOpenChange,
}: {
  camera: Camera | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const setSource = useSetCameraSource();
  const [kind, setKind] = useState<VideoSourceKind>(
    camera?.sourceKind ?? VideoSourceKind.rtspStream,
  );
  const [rtspUrl, setRtspUrl] = useState(camera?.rtspUrl ?? "");
  const [fileName, setFileName] = useState<string | null>(
    camera?.uploadedFileRef?.filename ?? null,
  );
  const [uploadedBlob, setUploadedBlob] = useState<ExternalBlob | null>(
    camera?.uploadedFileRef ?? null,
  );
  const [uploadState, setUploadState] = useState<UploadState>("idle");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !camera) return;
    setKind(camera.sourceKind);
    setRtspUrl(camera.rtspUrl);
    setFileName(camera.uploadedFileRef?.filename ?? null);
    setUploadedBlob(camera.uploadedFileRef ?? null);
    setUploadState(camera.uploadedFileRef ? "done" : "idle");
    setProgress(camera.uploadedFileRef ? 100 : 0);
    setError(null);
  }, [open, camera]);

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setError(null);
    setFileName(file.name);
    setUploadedBlob(null);
    setUploadState("uploading");
    setProgress(0);

    try {
      const bytes = new Uint8Array(await file.arrayBuffer());
      const blob = ExternalBlob.fromBytes(
        bytes,
        file.type,
        file.name,
      ).withUploadProgress((percentage) => {
        setProgress(Math.round(percentage));
      });
      setUploadedBlob(blob);
      setProgress(100);
      setUploadState("done");
    } catch (uploadError) {
      setUploadedBlob(null);
      setUploadState("error");
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "The video file could not be prepared for upload.",
      );
    }
  }

  function handleOpenChange(next: boolean) {
    if (!next && setSource.isPending) return;
    onOpenChange(next);
  }

  function handleSubmit() {
    if (!camera) return;
    setError(null);

    if (kind === VideoSourceKind.rtspStream && !isValidStreamUrl(rtspUrl)) {
      setError("Enter a valid RTSP URL (rtsp:// or rtsps://).");
      return;
    }
    if (kind === VideoSourceKind.uploadedFile && !uploadedBlob) {
      setError("Choose an MP4 or AVI file to upload.");
      return;
    }
    if (kind === VideoSourceKind.uploadedFile && uploadState === "uploading") {
      setError("Wait for the upload to finish before saving.");
      return;
    }

    setSource.mutate(
      {
        id: camera.id,
        sourceKind: kind,
        rtspUrl: kind === VideoSourceKind.rtspStream ? rtspUrl.trim() : "",
        uploadedFileRef:
          kind === VideoSourceKind.uploadedFile ? uploadedBlob : null,
      },
      {
        onSuccess: (result) => {
          if (result.__kind__ === "err") {
            setError(roadwatchErrorMessage(result.err));
            return;
          }
          onOpenChange(false);
        },
        onError: (err) => {
          setError(
            err instanceof Error
              ? err.message
              : "The video source could not be updated.",
          );
        },
      },
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        data-ocid="cameras.source_modal"
        className="max-h-[90dvh] overflow-y-auto sm:max-w-lg"
      >
        <DialogHeader>
          <DialogTitle className="font-display">Video source</DialogTitle>
          <DialogDescription>
            {camera
              ? `Choose how ${camera.code} receives its video feed.`
              : "Choose how this camera receives its video feed."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-2">
          {SOURCE_OPTIONS.map((option) => {
            const Icon = option.icon;
            const active = kind === option.value;
            return (
              <button
                key={option.value}
                type="button"
                data-ocid={`cameras.source_option.${option.value}`}
                onClick={() => {
                  setKind(option.value);
                  setError(null);
                }}
                aria-pressed={active}
                className={cn(
                  "flex items-start gap-3 rounded-lg border px-3 py-3 text-left transition-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  active
                    ? "border-accent bg-accent/10"
                    : "border-border bg-card hover:border-accent/50",
                )}
              >
                <span
                  className={cn(
                    "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md",
                    active
                      ? "bg-accent text-accent-foreground"
                      : "bg-secondary text-muted-foreground",
                  )}
                >
                  <Icon className="size-4" aria-hidden="true" />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-medium text-foreground">
                    {option.label}
                  </span>
                  <span className="block text-xs text-muted-foreground">
                    {option.description}
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        {kind === VideoSourceKind.rtspStream && (
          <div className="grid gap-1.5">
            <Label htmlFor="source-rtsp">RTSP stream URL</Label>
            <Input
              id="source-rtsp"
              data-ocid="cameras.source_rtsp_input"
              value={rtspUrl}
              onChange={(e) => setRtspUrl(e.target.value)}
              placeholder="rtsp://camera.example.com:554/stream1"
            />
          </div>
        )}

        {kind === VideoSourceKind.uploadedFile && (
          <div className="grid gap-2">
            <Label htmlFor="source-file">Video file (MP4 or AVI)</Label>
            <label
              htmlFor="source-file"
              data-ocid="cameras.source_dropzone"
              className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-card/50 px-4 py-6 text-center transition-smooth hover:border-accent/60"
            >
              <Upload className="size-5 text-accent" aria-hidden="true" />
              <span className="text-sm text-foreground">
                {fileName ?? "Choose a file to upload"}
              </span>
              <span className="text-xs text-muted-foreground">
                MP4 or AVI, stored with the camera record
              </span>
            </label>
            <input
              id="source-file"
              data-ocid="cameras.source_file_input"
              type="file"
              accept={ACCEPTED_VIDEO_TYPES}
              className="sr-only"
              onChange={handleFileChange}
            />
            {uploadState !== "idle" && (
              <div className="grid gap-1.5">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                    {uploadState === "uploading"
                      ? "Uploading…"
                      : uploadState === "done"
                        ? "Upload complete"
                        : "Upload failed"}
                  </span>
                  <span className="font-mono-num">{progress}%</span>
                </div>
                <Progress
                  value={progress}
                  data-ocid="cameras.source_upload_progress"
                />
              </div>
            )}
          </div>
        )}

        {kind === VideoSourceKind.sample && (
          <p className="rounded-lg border border-border bg-card/50 px-3 py-2 text-xs text-muted-foreground">
            The built-in sample clip is used for pipeline testing. Detection
            results from it are labelled as simulated.
          </p>
        )}

        {error && (
          <div
            data-ocid="cameras.source_error_state"
            role="alert"
            className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
          >
            <AlertTriangle
              className="mt-0.5 size-4 shrink-0"
              aria-hidden="true"
            />
            <span>{error}</span>
          </div>
        )}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            data-ocid="cameras.source_cancel_button"
            onClick={() => handleOpenChange(false)}
            disabled={setSource.isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            data-ocid="cameras.source_save_button"
            onClick={handleSubmit}
            disabled={setSource.isPending || uploadState === "uploading"}
          >
            {setSource.isPending && (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            )}
            Save source
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
