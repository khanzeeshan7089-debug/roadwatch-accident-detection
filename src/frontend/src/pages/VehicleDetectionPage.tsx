import { type BoundingBox, type CameraId, VehicleClass } from "@/backend";
import { PageHeader } from "@/components/PageHeader";
import { QueryState } from "@/components/PageState";
import { ClassCounts } from "@/components/detection/ClassCounts";
import { DetectionFrame } from "@/components/detection/DetectionFrame";
import { DetectionLogList } from "@/components/detection/DetectionLogList";
import { ModelUnavailableState } from "@/components/detection/ModelUnavailableState";
import { SimulationControls } from "@/components/detection/SimulationControls";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useCameras,
  useDetections,
  useRecordDetection,
  useSettings,
  useUpdateSettings,
} from "@/hooks/useRoadwatch";
import {
  cameraLabel,
  detectionCountByClass,
  formatCount,
} from "@/lib/roadwatch";
import { cn } from "@/lib/utils";
import { AlertTriangle, Car, CheckCircle2, RefreshCw } from "lucide-react";
import { useMemo, useState } from "react";

/** Representative simulated boxes (normalised 0–1) for the demo pipeline. */
const SIMULATED_BOXES: Array<{ vehicleClass: VehicleClass; box: BoundingBox }> =
  [
    {
      vehicleClass: VehicleClass.car,
      box: { x: 0.08, y: 0.52, width: 0.22, height: 0.24 },
    },
    {
      vehicleClass: VehicleClass.car,
      box: { x: 0.62, y: 0.46, width: 0.2, height: 0.22 },
    },
    {
      vehicleClass: VehicleClass.motorcycle,
      box: { x: 0.38, y: 0.6, width: 0.1, height: 0.16 },
    },
    {
      vehicleClass: VehicleClass.bus,
      box: { x: 0.3, y: 0.3, width: 0.3, height: 0.34 },
    },
    {
      vehicleClass: VehicleClass.truck,
      box: { x: 0.72, y: 0.34, width: 0.24, height: 0.3 },
    },
  ];

function randomConfidence(): number {
  return Math.round((0.72 + Math.random() * 0.26) * 100) / 100;
}

type Feedback = { kind: "success" | "error"; message: string } | null;

export default function VehicleDetectionPage() {
  const camerasQuery = useCameras();
  const settingsQuery = useSettings();
  const updateSettings = useUpdateSettings();
  const recordDetection = useRecordDetection();

  const cameras = camerasQuery.data ?? [];
  const [selectedCameraId, setSelectedCameraId] = useState<
    CameraId | undefined
  >(undefined);
  const [feedback, setFeedback] = useState<Feedback>(null);

  const activeCameraId =
    selectedCameraId ?? (cameras.length > 0 ? cameras[0].id : undefined);

  const detectionsQuery = useDetections(activeCameraId);
  const detections = detectionsQuery.data ?? [];

  const simulationMode = settingsQuery.data?.simulationMode ?? false;
  // No trained model is loaded in this build: the model is only "available"
  // through the clearly-labelled simulation pipeline.
  const modelAvailable = simulationMode;

  const activeCamera = cameras.find((camera) => camera.id === activeCameraId);

  const counts = useMemo(() => detectionCountByClass(detections), [detections]);
  const total = detections.length;

  const sortedLogs = useMemo(
    () =>
      [...detections].sort((a, b) =>
        a.detectedAt === b.detectedAt
          ? Number(b.id - a.id)
          : Number(b.detectedAt - a.detectedAt),
      ),
    [detections],
  );

  function handleToggleSimulation() {
    const current = settingsQuery.data;
    if (!current) return;
    const next = !current.simulationMode;
    updateSettings.mutate(
      { ...current, simulationMode: next },
      {
        onSuccess: () => {
          setFeedback({
            kind: "success",
            message: next
              ? "Simulation mode turned on. Generated detections are marked as simulated."
              : "Simulation mode turned off. The detection model is unavailable, so no detections are shown.",
          });
        },
        onError: (error) => {
          setFeedback({
            kind: "error",
            message:
              error instanceof Error
                ? error.message
                : "Could not update simulation mode.",
          });
        },
      },
    );
  }

  function handleGenerate() {
    if (activeCameraId === undefined) return;
    const batch = SIMULATED_BOXES.map((entry) => ({
      cameraId: activeCameraId,
      vehicleClass: entry.vehicleClass,
      confidence: randomConfidence(),
      box: entry.box,
      simulated: true,
    }));

    let completed = 0;
    for (const input of batch) {
      recordDetection.mutate(input, {
        onSuccess: () => {
          completed += 1;
          if (completed === batch.length) {
            setFeedback({
              kind: "success",
              message: `Recorded ${batch.length} simulated detections for ${activeCamera ? cameraLabel(activeCamera) : "the selected camera"}.`,
            });
          }
        },
        onError: (error) => {
          setFeedback({
            kind: "error",
            message:
              error instanceof Error
                ? error.message
                : "Could not record simulated detections.",
          });
        },
      });
    }
  }

  const isGenerating = recordDetection.isPending;

  return (
    <section data-ocid="vehicles.page" className="space-y-6">
      <PageHeader
        icon={Car}
        title="Vehicle Detection"
        description="Inspect detected vehicles with bounding boxes, class labels and confidence scores, plus per-class counts for cars, motorcycles, buses and trucks."
        actions={
          <Button
            type="button"
            variant="outline"
            data-ocid="vehicles.refresh_button"
            onClick={() => {
              void camerasQuery.refetch();
              void detectionsQuery.refetch();
            }}
          >
            <RefreshCw className="size-4" aria-hidden="true" />
            Refresh
          </Button>
        }
      />

      <QueryState
        isLoading={camerasQuery.isLoading || settingsQuery.isLoading}
        isError={camerasQuery.isError || settingsQuery.isError}
        error={camerasQuery.error ?? settingsQuery.error}
        onRetry={() => {
          void camerasQuery.refetch();
          void settingsQuery.refetch();
        }}
        isEmpty={cameras.length === 0}
        emptyTitle="No cameras configured"
        emptyDescription="Add a camera in Camera Management to start inspecting vehicle detections."
      >
        <div className="space-y-6">
          {/* Camera selector */}
          <div className="flex flex-wrap items-center gap-3">
            <label
              htmlFor="vehicles-camera-select"
              className="text-sm font-medium text-foreground"
            >
              Camera
            </label>
            <Select
              value={activeCameraId?.toString() ?? ""}
              onValueChange={(value) => {
                setSelectedCameraId(BigInt(value));
                setFeedback(null);
              }}
            >
              <SelectTrigger
                id="vehicles-camera-select"
                data-ocid="vehicles.camera_select"
                className="w-full sm:w-80"
              >
                <SelectValue placeholder="Select a camera" />
              </SelectTrigger>
              <SelectContent>
                {cameras.map((camera) => (
                  <SelectItem
                    key={camera.id.toString()}
                    value={camera.id.toString()}
                  >
                    {cameraLabel(camera)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="font-mono-num text-xs text-muted-foreground">
              {formatCount(total)} detections this session
            </span>
          </div>

          {feedback && (
            <div
              data-ocid={
                feedback.kind === "success"
                  ? "vehicles.success_state"
                  : "vehicles.error_state"
              }
              role={feedback.kind === "error" ? "alert" : "status"}
              className={cn(
                "flex items-start gap-2 rounded-lg border px-3 py-2 text-sm",
                feedback.kind === "success"
                  ? "border-success/40 bg-success/10 text-success"
                  : "border-destructive/40 bg-destructive/10 text-destructive",
              )}
            >
              {feedback.kind === "success" ? (
                <CheckCircle2
                  className="mt-0.5 size-4 shrink-0"
                  aria-hidden="true"
                />
              ) : (
                <AlertTriangle
                  className="mt-0.5 size-4 shrink-0"
                  aria-hidden="true"
                />
              )}
              <span>{feedback.message}</span>
            </div>
          )}

          <SimulationControls
            simulationMode={simulationMode}
            onToggleSimulation={handleToggleSimulation}
            onGenerate={handleGenerate}
            isGenerating={isGenerating}
            canGenerate={modelAvailable && activeCameraId !== undefined}
            disabledReason={
              activeCameraId === undefined
                ? "Select a camera to generate detections."
                : "Enable simulation mode to generate detections."
            }
          />

          {!modelAvailable ? (
            <ModelUnavailableState
              onRetry={() => {
                void settingsQuery.refetch();
                void detectionsQuery.refetch();
              }}
              onEnableSimulation={handleToggleSimulation}
            />
          ) : (
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
              <div className="space-y-6">
                {activeCamera && (
                  <DetectionFrame
                    camera={activeCamera}
                    detections={detections}
                    modelAvailable={modelAvailable}
                  />
                )}
                <ClassCounts counts={counts} total={total} />
              </div>

              <QueryState
                isLoading={detectionsQuery.isLoading}
                isError={detectionsQuery.isError}
                error={detectionsQuery.error}
                onRetry={() => void detectionsQuery.refetch()}
              >
                <DetectionLogList logs={sortedLogs} />
              </QueryState>
            </div>
          )}
        </div>
      </QueryState>
    </section>
  );
}
