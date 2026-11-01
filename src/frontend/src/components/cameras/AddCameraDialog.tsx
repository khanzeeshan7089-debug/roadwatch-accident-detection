import { VideoSourceKind } from "@/backend";
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
import { useCreateCamera } from "@/hooks/useRoadwatch";
import { roadwatchErrorMessage } from "@/lib/roadwatch";
import { AlertTriangle, Loader2, Plus } from "lucide-react";
import { type FormEvent, useState } from "react";
import {
  type CameraFormErrors,
  type CameraFormValues,
  EMPTY_CAMERA_FORM,
  hasErrors,
  toNumber,
  validateCameraForm,
} from "./cameraForm";

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="text-xs text-destructive">
      {message}
    </p>
  );
}

export function AddCameraDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const createCamera = useCreateCamera();
  const [values, setValues] = useState<CameraFormValues>(EMPTY_CAMERA_FORM);
  const [errors, setErrors] = useState<CameraFormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  function update<K extends keyof CameraFormValues>(
    key: K,
    value: CameraFormValues[K],
  ) {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  }

  function reset() {
    setValues(EMPTY_CAMERA_FORM);
    setErrors({});
    setSubmitError(null);
  }

  function handleOpenChange(next: boolean) {
    if (!next && createCamera.isPending) return;
    if (!next) reset();
    onOpenChange(next);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitError(null);
    const nextErrors = validateCameraForm(values);
    setErrors(nextErrors);
    if (hasErrors(nextErrors)) return;

    const payload = {
      name: values.name.trim(),
      roadName: values.roadName.trim(),
      area: values.area.trim(),
      latitude: toNumber(values.latitude),
      longitude: toNumber(values.longitude),
      rtspUrl: values.rtspUrl.trim(),
      sourceKind: VideoSourceKind.rtspStream,
      uploadedFileRef: null,
    };

    createCamera.mutate(payload, {
      onSuccess: (result) => {
        if (result.__kind__ === "err") {
          setSubmitError(roadwatchErrorMessage(result.err));
          return;
        }
        reset();
        onOpenChange(false);
      },
      onError: (error) => {
        setSubmitError(
          error instanceof Error
            ? error.message
            : "The camera could not be registered.",
        );
      },
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        data-ocid="cameras.add_modal"
        className="max-h-[90dvh] overflow-y-auto sm:max-w-xl"
      >
        <DialogHeader>
          <DialogTitle className="font-display">Register camera</DialogTitle>
          <DialogDescription>
            Add a surveillance camera to the registry. The camera code is
            assigned automatically by the control room.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          noValidate
          className="grid gap-4 sm:grid-cols-2"
        >
          <div className="grid gap-1.5 sm:col-span-2">
            <Label htmlFor="camera-name">Camera name</Label>
            <Input
              id="camera-name"
              data-ocid="cameras.name_input"
              value={values.name}
              onChange={(e) => update("name", e.target.value)}
              placeholder="North Gate Junction"
              aria-invalid={Boolean(errors.name)}
              aria-describedby={errors.name ? "camera-name-error" : undefined}
            />
            <FieldError id="camera-name-error" message={errors.name} />
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="camera-road">Road name</Label>
            <Input
              id="camera-road"
              data-ocid="cameras.road_input"
              value={values.roadName}
              onChange={(e) => update("roadName", e.target.value)}
              placeholder="Ring Road"
              aria-invalid={Boolean(errors.roadName)}
              aria-describedby={
                errors.roadName ? "camera-road-error" : undefined
              }
            />
            <FieldError id="camera-road-error" message={errors.roadName} />
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="camera-area">Area</Label>
            <Input
              id="camera-area"
              data-ocid="cameras.area_input"
              value={values.area}
              onChange={(e) => update("area", e.target.value)}
              placeholder="Central District"
              aria-invalid={Boolean(errors.area)}
              aria-describedby={errors.area ? "camera-area-error" : undefined}
            />
            <FieldError id="camera-area-error" message={errors.area} />
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="camera-latitude">Latitude</Label>
            <Input
              id="camera-latitude"
              data-ocid="cameras.latitude_input"
              inputMode="decimal"
              value={values.latitude}
              onChange={(e) => update("latitude", e.target.value)}
              placeholder="28.61390"
              aria-invalid={Boolean(errors.latitude)}
              aria-describedby={
                errors.latitude ? "camera-latitude-error" : undefined
              }
            />
            <FieldError id="camera-latitude-error" message={errors.latitude} />
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="camera-longitude">Longitude</Label>
            <Input
              id="camera-longitude"
              data-ocid="cameras.longitude_input"
              inputMode="decimal"
              value={values.longitude}
              onChange={(e) => update("longitude", e.target.value)}
              placeholder="77.20900"
              aria-invalid={Boolean(errors.longitude)}
              aria-describedby={
                errors.longitude ? "camera-longitude-error" : undefined
              }
            />
            <FieldError
              id="camera-longitude-error"
              message={errors.longitude}
            />
          </div>

          <div className="grid gap-1.5 sm:col-span-2">
            <Label htmlFor="camera-rtsp">RTSP stream URL</Label>
            <Input
              id="camera-rtsp"
              data-ocid="cameras.rtsp_input"
              value={values.rtspUrl}
              onChange={(e) => update("rtspUrl", e.target.value)}
              placeholder="rtsp://camera.example.com:554/stream1"
              aria-invalid={Boolean(errors.rtspUrl)}
              aria-describedby={
                errors.rtspUrl ? "camera-rtsp-error" : undefined
              }
            />
            <FieldError id="camera-rtsp-error" message={errors.rtspUrl} />
          </div>

          {submitError && (
            <div
              data-ocid="cameras.add_error_state"
              role="alert"
              className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive sm:col-span-2"
            >
              <AlertTriangle
                className="mt-0.5 size-4 shrink-0"
                aria-hidden="true"
              />
              <span>{submitError}</span>
            </div>
          )}

          <DialogFooter className="sm:col-span-2">
            <Button
              type="button"
              variant="outline"
              data-ocid="cameras.cancel_button"
              onClick={() => handleOpenChange(false)}
              disabled={createCamera.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              data-ocid="cameras.submit_button"
              disabled={createCamera.isPending}
            >
              {createCamera.isPending ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : (
                <Plus className="size-4" aria-hidden="true" />
              )}
              Register camera
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
