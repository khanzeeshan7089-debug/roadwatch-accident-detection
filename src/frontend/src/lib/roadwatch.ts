import {
  AlertStatus,
  type Camera,
  type CameraId,
  ConnectionStatus,
  type DetectionLog,
  DetectionSource,
  type EmergencyAlert,
  type Incident,
  IncidentStatus,
  type MonitoringState,
  MonitoringState as MonitoringStateEnum,
  NotificationStatus,
  type ResolutionStatus,
  ResolutionStatus as ResolutionStatusEnum,
  type Settings,
  type Timestamp,
  type VehicleClass,
  VerificationStatus,
  VideoSourceKind,
} from "@/backend";

/** Motoko `Time.now()` values are nanosecond bigints. Convert before any Date use. */
export function timestampToDate(
  timestamp: Timestamp | undefined | null,
): Date | null {
  if (timestamp === undefined || timestamp === null) return null;
  const date = new Date(Number(timestamp / 1_000_000n));
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatTimestamp(
  timestamp: Timestamp | undefined | null,
): string {
  const date = timestampToDate(timestamp);
  if (!date) return "—";
  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export function formatDate(timestamp: Timestamp | undefined | null): string {
  const date = timestampToDate(timestamp);
  if (!date) return "—";
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

export function formatRelativeTime(
  timestamp: Timestamp | undefined | null,
): string {
  const date = timestampToDate(timestamp);
  if (!date) return "—";
  const diffMs = Date.now() - date.getTime();
  const seconds = Math.round(diffMs / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days}d ago`;
  return formatDate(timestamp);
}

export function formatCoordinates(latitude: number, longitude: number): string {
  const lat = `${Math.abs(latitude).toFixed(5)}° ${latitude >= 0 ? "N" : "S"}`;
  const lng = `${Math.abs(longitude).toFixed(5)}° ${longitude >= 0 ? "E" : "W"}`;
  return `${lat}, ${lng}`;
}

export function formatConfidence(
  confidence: number | undefined | null,
): string {
  if (confidence === undefined || confidence === null) return "—";
  return `${Math.round(confidence * 100)}%`;
}

export function formatCount(value: bigint | number | undefined | null): string {
  if (value === undefined || value === null) return "0";
  return Number(value).toLocaleString();
}

const CAMERA_STATUS_LABELS: Record<ConnectionStatus, string> = {
  [ConnectionStatus.online]: "Online",
  [ConnectionStatus.offline]: "Offline",
};

export function cameraStatusLabel(status: ConnectionStatus): string {
  return CAMERA_STATUS_LABELS[status] ?? "Unknown";
}

const MONITORING_LABELS: Record<MonitoringState, string> = {
  [MonitoringStateEnum.monitoring]: "Monitoring",
  [MonitoringStateEnum.stopped]: "Stopped",
};

export function monitoringLabel(state: MonitoringState): string {
  return MONITORING_LABELS[state] ?? "Unknown";
}

const INCIDENT_STATUS_LABELS: Record<IncidentStatus, string> = {
  [IncidentStatus.potential]: "Potential",
  [IncidentStatus.verified]: "Verified",
  [IncidentStatus.falseAlarm]: "False alarm",
  [IncidentStatus.resolved]: "Resolved",
};

export function incidentStatusLabel(status: IncidentStatus): string {
  return INCIDENT_STATUS_LABELS[status] ?? "Unknown";
}

const ALERT_STATUS_LABELS: Record<AlertStatus, string> = {
  [AlertStatus.active]: "Active",
  [AlertStatus.acknowledged]: "Acknowledged",
  [AlertStatus.resolved]: "Resolved",
};

export function alertStatusLabel(status: AlertStatus): string {
  return ALERT_STATUS_LABELS[status] ?? "Unknown";
}

const NOTIFICATION_LABELS: Record<NotificationStatus, string> = {
  [NotificationStatus.pending]: "Pending",
  [NotificationStatus.notified]: "Notified",
  [NotificationStatus.failed]: "Failed",
};

export function notificationStatusLabel(status: NotificationStatus): string {
  return NOTIFICATION_LABELS[status] ?? "Unknown";
}

const VERIFICATION_LABELS: Record<VerificationStatus, string> = {
  [VerificationStatus.unverified]: "Unverified",
  [VerificationStatus.verified]: "Verified",
  [VerificationStatus.falseAlarm]: "False alarm",
};

export function verificationLabel(status: VerificationStatus): string {
  return VERIFICATION_LABELS[status] ?? "Unknown";
}

const RESOLUTION_LABELS: Record<ResolutionStatus, string> = {
  [ResolutionStatusEnum.unresolved]: "Unresolved",
  [ResolutionStatusEnum.resolved]: "Resolved",
};

export function resolutionLabel(status: ResolutionStatus): string {
  return RESOLUTION_LABELS[status] ?? "Unknown";
}

const DETECTION_SOURCE_LABELS: Record<DetectionSource, string> = {
  [DetectionSource.model]: "Model",
  [DetectionSource.simulated]: "Simulated",
};

export function detectionSourceLabel(source: DetectionSource): string {
  return DETECTION_SOURCE_LABELS[source] ?? "Unknown";
}

const VEHICLE_CLASS_LABELS: Record<VehicleClass, string> = {
  car: "Car",
  motorcycle: "Motorcycle",
  bus: "Bus",
  truck: "Truck",
};

export function vehicleClassLabel(vehicleClass: VehicleClass): string {
  return VEHICLE_CLASS_LABELS[vehicleClass] ?? "Unknown";
}

const SOURCE_KIND_LABELS: Record<VideoSourceKind, string> = {
  rtspStream: "RTSP stream",
  uploadedFile: "Uploaded file",
  sample: "Sample video",
};

export function sourceKindLabel(kind: VideoSourceKind): string {
  return SOURCE_KIND_LABELS[kind] ?? "Unknown";
}

/** Path of the bundled sample clip used for pipeline testing. */
export const SAMPLE_CLIP_URL = "/assets/videos/sample-traffic-clip.mp4";

/** Assumed frame rate for the client-side frame counter. */
export const SAMPLE_FRAME_RATE = 25;

/**
 * The playable URL for a camera's video source, or null when the source cannot
 * be played in the browser (no file stored, or an RTSP stream that this
 * environment cannot decode).
 */
export function videoSourceUrl(camera: Camera): string | null {
  if (camera.sourceKind === VideoSourceKind.uploadedFile) {
    return camera.uploadedFileRef?.getDirectURL() ?? null;
  }
  if (camera.sourceKind === VideoSourceKind.sample) {
    return SAMPLE_CLIP_URL;
  }
  return null;
}

/** True when the camera's source can actually be played in this environment. */
export function isSourcePlayable(camera: Camera): boolean {
  return videoSourceUrl(camera) !== null;
}

/**
 * True when the camera has a source that can actually be monitored in this
 * environment. An RTSP stream is not startable here: this browser-only build
 * cannot ingest or decode RTSP, so no monitoring session may begin for it. An
 * uploaded-file camera with no stored file likewise has no usable source.
 */
export function hasConfiguredSource(camera: Camera): boolean {
  if (camera.sourceKind === VideoSourceKind.uploadedFile) {
    return camera.uploadedFileRef !== undefined;
  }
  if (camera.sourceKind === VideoSourceKind.rtspStream) {
    return false;
  }
  return true;
}

/**
 * Why a camera's source cannot be played, or null when it can. RTSP streams are
 * explicitly unsupported in this browser-only environment.
 */
export function sourceUnavailableReason(camera: Camera): string | null {
  if (camera.sourceKind === VideoSourceKind.rtspStream) {
    return "RTSP streams cannot be decoded in this browser environment. Upload an MP4 or AVI clip, or use the sample clip.";
  }
  if (
    camera.sourceKind === VideoSourceKind.uploadedFile &&
    !camera.uploadedFileRef
  ) {
    return "No video file is stored for this camera. Upload an MP4 or AVI clip in Camera Management.";
  }
  return null;
}

/** A camera is a sample clip rather than a live CCTV feed. */
export function isSampleSource(camera: Camera): boolean {
  return camera.sourceKind === VideoSourceKind.sample;
}

/** Formats a playback position or duration in seconds as m:ss. */
export function formatDuration(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const total = Math.floor(seconds);
  const minutes = Math.floor(total / 60);
  const secs = total % 60;
  return `${minutes}:${secs.toString().padStart(2, "0")}`;
}

/** Frames decoded so far, derived from elapsed playback time and frame rate. */
export function framesFromPlayback(
  currentTime: number,
  frameRate: number,
): number {
  if (!Number.isFinite(currentTime) || currentTime <= 0) return 0;
  return Math.floor(currentTime * frameRate);
}

/** Human-readable message for a backend RoadwatchError variant. */
export function roadwatchErrorMessage(error: {
  __kind__: "notAuthorized" | "invalidInput" | "notFound";
  invalidInput?: string;
  notFound?: string;
}): string {
  switch (error.__kind__) {
    case "notAuthorized":
      return "You are not authorized to perform this action.";
    case "invalidInput":
      return error.invalidInput ?? "The submitted values are invalid.";
    case "notFound":
      return error.notFound ?? "The requested record was not found.";
    default:
      return "The operation could not be completed.";
  }
}

export function cameraLabel(camera: Pick<Camera, "code" | "name">): string {
  return `${camera.code} · ${camera.name}`;
}

export function cameraById(
  cameras: Camera[],
  id: CameraId,
): Camera | undefined {
  return cameras.find((camera) => camera.id === id);
}

export function detectionCountByClass(
  logs: DetectionLog[],
): Record<VehicleClass, number> {
  const counts: Record<VehicleClass, number> = {
    car: 0,
    motorcycle: 0,
    bus: 0,
    truck: 0,
  };
  for (const log of logs) {
    counts[log.vehicleClass] += 1;
  }
  return counts;
}

export function incidentLocation(
  incident: Pick<Incident, "roadName" | "area">,
): string {
  return [incident.roadName, incident.area].filter(Boolean).join(", ");
}

export function alertLocation(alert: Pick<EmergencyAlert, "location">): string {
  return alert.location || "Unknown location";
}

export function settingsSummary(settings: Settings): string {
  return settings.simulationMode ? "Simulation mode" : "Live model mode";
}
