import type { Camera, CameraId } from "@/backend";
import { ConnectionStatus, MonitoringState } from "@/backend";
import { PageHeader } from "@/components/PageHeader";
import { EmptyState, ErrorState, LoadingState } from "@/components/PageState";
import { DetectionFrame } from "@/components/detection/DetectionFrame";
import { DetectionLogList } from "@/components/detection/DetectionLogList";
import { CameraSelector } from "@/components/monitoring/CameraSelector";
import { MonitoringControls } from "@/components/monitoring/MonitoringControls";
import { StatusStrip } from "@/components/monitoring/StatusStrip";
import { VideoSourcePanel } from "@/components/monitoring/VideoSourcePanel";
import {
  useCameras,
  useDetections,
  useMonitoringSession,
  useReportFrameCount,
  useStartMonitoring,
  useStopMonitoring,
} from "@/hooks/useRoadwatch";
import {
  SAMPLE_FRAME_RATE,
  framesFromPlayback,
  hasConfiguredSource,
  isSourcePlayable,
  roadwatchErrorMessage,
  sourceUnavailableReason,
} from "@/lib/roadwatch";
import { Link } from "@tanstack/react-router";
import { Camera as CameraIcon, Info, Settings2, Video } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

/** How often the client-reported frame count is pushed to the backend. */
const FRAME_REPORT_INTERVAL_MS = 1000;

export default function LiveMonitoringPage() {
  const camerasQuery = useCameras();
  const cameras = camerasQuery.data ?? [];
  const [selectedId, setSelectedId] = useState<CameraId | undefined>(undefined);

  // Keep a valid selection as the camera list loads or changes.
  useEffect(() => {
    if (cameras.length === 0) {
      if (selectedId !== undefined) setSelectedId(undefined);
      return;
    }
    const stillPresent = cameras.some((camera) => camera.id === selectedId);
    if (!stillPresent) setSelectedId(cameras[0].id);
  }, [cameras, selectedId]);

  const selectedCamera = useMemo(
    () => cameras.find((camera) => camera.id === selectedId),
    [cameras, selectedId],
  );

  const detectionsQuery = useDetections(selectedCamera?.id);
  const detections = detectionsQuery.data ?? [];
  const sessionQuery = useMonitoringSession(selectedCamera?.id);

  const startSession = useStartMonitoring();
  const stopSession = useStopMonitoring();
  const reportFrameCount = useReportFrameCount();

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [framesProcessed, setFramesProcessed] = useState(0);
  const [actionError, setActionError] = useState<string | null>(null);

  const monitoring =
    selectedCamera?.monitoringState === MonitoringState.monitoring;
  const sourceReady = selectedCamera
    ? hasConfiguredSource(selectedCamera)
    : false;

  // Reset the local frame counter whenever the selected camera changes.
  useEffect(() => {
    if (selectedId === undefined) return;
    setFramesProcessed(0);
    setActionError(null);
  }, [selectedId]);

  // Count real elapsed video frames while a session is active, and push the
  // count to the backend at a bounded cadence. Pausing playback freezes it.
  const reportFrames = reportFrameCount.mutate;
  useEffect(() => {
    if (!monitoring || !selectedCamera) return;
    const cameraId = selectedCamera.id;
    const timer = window.setInterval(() => {
      const video = videoRef.current;
      if (!video || video.paused || video.ended) return;
      const frames = framesFromPlayback(video.currentTime, SAMPLE_FRAME_RATE);
      setFramesProcessed(frames);
      reportFrames({ cameraId, frameCount: BigInt(frames) });
    }, FRAME_REPORT_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [monitoring, selectedCamera, reportFrames]);

  const handleStart = useCallback(() => {
    if (!selectedCamera) return;
    setActionError(null);
    if (selectedCamera.connectionStatus !== ConnectionStatus.online) {
      setActionError(
        "This camera is offline and cannot be monitored. Reconnect it first.",
      );
      return;
    }
    if (!hasConfiguredSource(selectedCamera)) {
      setActionError(
        sourceUnavailableReason(selectedCamera) ??
          "This camera has no configured video source.",
      );
      return;
    }
    setFramesProcessed(0);
    startSession.mutate(selectedCamera.id, {
      onSuccess: (result) => {
        if (result.__kind__ === "err") {
          setActionError(roadwatchErrorMessage(result.err));
          return;
        }
        // Playback only starts when the source is decodable in this browser;
        // an RTSP source still records a monitoring session without playback.
        if (isSourcePlayable(selectedCamera)) {
          void videoRef.current?.play().catch(() => {
            // Autoplay may be blocked; the native controls remain available.
          });
        }
      },
      onError: (error) => {
        setActionError(
          error instanceof Error
            ? error.message
            : "The monitoring session could not be started.",
        );
      },
    });
  }, [selectedCamera, startSession]);

  const handleStop = useCallback(() => {
    if (!selectedCamera) return;
    setActionError(null);
    videoRef.current?.pause();
    stopSession.mutate(selectedCamera.id, {
      onSuccess: (result) => {
        if (result.__kind__ === "err") {
          setActionError(roadwatchErrorMessage(result.err));
        }
      },
      onError: (error) => {
        setActionError(
          error instanceof Error
            ? error.message
            : "The monitoring session could not be stopped.",
        );
      },
    });
  }, [selectedCamera, stopSession]);

  const handleLoadedMetadata = useCallback(() => {
    // Nothing to do until playback begins; the counter is time-driven.
  }, []);

  const handleTimeUpdate = useCallback(() => {
    if (!monitoring) return;
    const video = videoRef.current;
    if (!video) return;
    setFramesProcessed(
      framesFromPlayback(video.currentTime, SAMPLE_FRAME_RATE),
    );
  }, [monitoring]);

  const handlePlay = useCallback(() => {
    // Playback resumed; the interval effect resumes counting.
  }, []);

  const handlePause = useCallback(() => {
    // Playback paused; the counter freezes at its current value.
  }, []);

  const handleEnded = useCallback(() => {
    // The clip finished; the counter freezes at its final value.
  }, []);

  // Vehicles detected counts the detection-log entries stored for the camera.
  const vehiclesDetected = detections.length;

  return (
    <section data-ocid="live.page" className="flex flex-col gap-6">
      <PageHeader
        icon={Video}
        title="Live CCTV Monitoring"
        description="Select a camera, play its stored clip and drive the detection pipeline. Detection runs in clearly labelled simulation mode."
      />

      <ProcessingEnvironmentNotice />

      {camerasQuery.isLoading ? (
        <LoadingState label="Loading cameras…" />
      ) : camerasQuery.isError ? (
        <ErrorState
          message={
            camerasQuery.error instanceof Error
              ? camerasQuery.error.message
              : "The camera list could not be loaded."
          }
          onRetry={() => void camerasQuery.refetch()}
        />
      ) : cameras.length === 0 ? (
        <EmptyState
          icon={<CameraIcon className="size-6" aria-hidden="true" />}
          title="No cameras registered"
          description="Register a camera and configure its video source before monitoring live feeds."
          action={
            <Link
              to="/cameras"
              data-ocid="live.empty_manage_cameras_link"
              className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-smooth hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Settings2 className="size-4" aria-hidden="true" />
              Go to Camera Management
            </Link>
          }
        />
      ) : (
        <div className="grid gap-6 lg:grid-cols-[20rem_minmax(0,1fr)]">
          <aside
            data-ocid="live.camera_panel"
            className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4"
          >
            <div className="flex items-center justify-between">
              <h2 className="font-display text-sm font-semibold text-foreground">
                Cameras
              </h2>
              <span className="font-mono text-[0.6rem] uppercase tracking-wider text-muted-foreground">
                {cameras.length} total
              </span>
            </div>
            <CameraSelector
              cameras={cameras}
              selectedId={selectedId}
              onSelect={setSelectedId}
            />
          </aside>

          <div className="flex min-w-0 flex-col gap-4">
            {selectedCamera ? (
              <>
                <VideoSourcePanel
                  camera={selectedCamera}
                  videoRef={videoRef}
                  onLoadedMetadata={handleLoadedMetadata}
                  onTimeUpdate={handleTimeUpdate}
                  onPlay={handlePlay}
                  onPause={handlePause}
                  onEnded={handleEnded}
                  overlay={
                    <DetectionFrame
                      detections={detections}
                      modelAvailable
                      monitoring={Boolean(monitoring)}
                    />
                  }
                />

                <MonitoringControls
                  camera={selectedCamera}
                  sourceReady={sourceReady}
                  isStarting={startSession.isPending}
                  isStopping={stopSession.isPending}
                  onStart={handleStart}
                  onStop={handleStop}
                />

                {actionError && (
                  <p
                    data-ocid="live.action_error"
                    role="alert"
                    className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
                  >
                    {actionError}
                  </p>
                )}

                <StatusStrip
                  monitoringState={selectedCamera.monitoringState}
                  framesProcessed={framesProcessed}
                  vehiclesDetected={vehiclesDetected}
                />

                <SimulationNotice />

                {detectionsQuery.isError && (
                  <ErrorState
                    message={
                      detectionsQuery.error instanceof Error
                        ? detectionsQuery.error.message
                        : "Detection data could not be loaded."
                    }
                    onRetry={() => void detectionsQuery.refetch()}
                  />
                )}

                <DetectionLogList logs={detections} />

                {sessionQuery.data && !sessionQuery.data.active && (
                  <p className="text-xs text-muted-foreground">
                    Last session ended with{" "}
                    <span className="font-mono-num text-foreground">
                      {Number(sessionQuery.data.frameCount).toLocaleString()}
                    </span>{" "}
                    frames processed.
                  </p>
                )}
              </>
            ) : (
              <LoadingState label="Preparing camera view…" />
            )}
          </div>
        </div>
      )}
    </section>
  );
}

function ProcessingEnvironmentNotice() {
  return (
    <div
      data-ocid="live.environment_notice"
      className="flex items-start gap-3 rounded-xl border border-border bg-secondary/40 px-4 py-3"
    >
      <Info className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden="true" />
      <p className="text-xs text-muted-foreground">
        <span className="font-medium text-foreground">
          Processing environment:
        </span>{" "}
        this app runs on the Internet Computer with a Motoko backend and a React
        frontend. The browser decodes the stored clip and reports its frame
        count; the backend stores that count and the detection log. This
        environment cannot host the Python FastAPI/OpenCV video-processing
        service or server-side YOLOv8 inference, and it cannot ingest RTSP
        streams — so detection output is simulated and clearly labelled.
      </p>
    </div>
  );
}

function SimulationNotice() {
  return (
    <p
      data-ocid="live.simulation_notice"
      className="rounded-lg border border-warning/40 bg-warning/5 px-3 py-2 text-xs text-warning"
    >
      No trained detection model is loaded. Bounding boxes and log entries are
      simulated and are never presented as real model output.
    </p>
  );
}
