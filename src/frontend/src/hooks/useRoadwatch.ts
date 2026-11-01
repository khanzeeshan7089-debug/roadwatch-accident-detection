import { createActor } from "@/backend";
import type {
  AlertId,
  AlertStatus,
  BoundingBox,
  Camera,
  CameraId,
  ExternalBlob,
  IncidentFilter,
  IncidentId,
  ResolutionStatus,
  Settings,
  VehicleClass,
  VerificationStatus,
  VideoSourceKind,
} from "@/backend";
import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const roadwatchKeys = {
  cameras: ["roadwatch", "cameras"] as const,
  detections: (cameraId: CameraId) =>
    ["roadwatch", "detections", cameraId.toString()] as const,
  incidents: (filter: IncidentFilter) =>
    ["roadwatch", "incidents", filter] as const,
  incident: (id: IncidentId) =>
    ["roadwatch", "incident", id.toString()] as const,
  alerts: ["roadwatch", "alerts"] as const,
  settings: ["roadwatch", "settings"] as const,
  dashboard: ["roadwatch", "dashboard"] as const,
  analytics: ["roadwatch", "analytics"] as const,
  session: (cameraId: CameraId) =>
    ["roadwatch", "session", cameraId.toString()] as const,
  frameCount: (cameraId: CameraId) =>
    ["roadwatch", "frameCount", cameraId.toString()] as const,
  detectionCount: (cameraId: CameraId) =>
    ["roadwatch", "detectionCount", cameraId.toString()] as const,
};

/* ------------------------------- Queries ------------------------------- */

export function useCameras() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: roadwatchKeys.cameras,
    queryFn: async (): Promise<Camera[]> => {
      if (!actor) return [];
      return actor.listCameras();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useDetections(cameraId: CameraId | undefined) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: roadwatchKeys.detections(cameraId ?? 0n),
    queryFn: async () => {
      if (!actor || cameraId === undefined) return [];
      return actor.listDetections(cameraId);
    },
    enabled: !!actor && !isFetching && cameraId !== undefined,
  });
}

/** The stored monitoring session for a camera, or null when none exists. */
export function useMonitoringSession(cameraId: CameraId | undefined) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: roadwatchKeys.session(cameraId ?? 0n),
    queryFn: async () => {
      if (!actor || cameraId === undefined) return null;
      return actor.getMonitoringSession(cameraId);
    },
    enabled: !!actor && !isFetching && cameraId !== undefined,
  });
}

/** The client-reported frame count stored for a camera's session. */
export function useFrameCount(cameraId: CameraId | undefined) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: roadwatchKeys.frameCount(cameraId ?? 0n),
    queryFn: async () => {
      if (!actor || cameraId === undefined) return 0n;
      return actor.getFrameCount(cameraId);
    },
    enabled: !!actor && !isFetching && cameraId !== undefined,
  });
}

/** The number of stored detection-log entries for a camera. */
export function useDetectionCount(cameraId: CameraId | undefined) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: roadwatchKeys.detectionCount(cameraId ?? 0n),
    queryFn: async () => {
      if (!actor || cameraId === undefined) return 0n;
      return actor.getDetectionCount(cameraId);
    },
    enabled: !!actor && !isFetching && cameraId !== undefined,
  });
}

export function useIncidents(filter: IncidentFilter = {}) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: roadwatchKeys.incidents(filter),
    queryFn: async () => {
      if (!actor) return [];
      return actor.listIncidents(filter);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useIncident(id: IncidentId | undefined) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: roadwatchKeys.incident(id ?? 0n),
    queryFn: async () => {
      if (!actor || id === undefined) return null;
      return actor.getIncident(id);
    },
    enabled: !!actor && !isFetching && id !== undefined,
  });
}

export function useAlerts() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: roadwatchKeys.alerts,
    queryFn: async () => {
      if (!actor) return [];
      return actor.listAlerts();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSettings() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: roadwatchKeys.settings,
    queryFn: async (): Promise<Settings | null> => {
      if (!actor) return null;
      return actor.getSettings();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useDashboardStats() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: roadwatchKeys.dashboard,
    queryFn: async () => {
      if (!actor) return null;
      return actor.getDashboardStats();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAnalytics() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: roadwatchKeys.analytics,
    queryFn: async () => {
      if (!actor) return null;
      return actor.getAnalytics();
    },
    enabled: !!actor && !isFetching,
  });
}

/* ------------------------------ Mutations ------------------------------ */

function useInvalidateRoadwatch() {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: ["roadwatch"] });
  };
}

export function useCreateCamera() {
  const { actor } = useActor(createActor);
  const invalidate = useInvalidateRoadwatch();
  return useMutation({
    mutationFn: async (input: {
      name: string;
      roadName: string;
      area: string;
      latitude: number;
      longitude: number;
      rtspUrl: string;
      sourceKind: VideoSourceKind;
      uploadedFileRef: ExternalBlob | null;
    }) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.createCamera(
        input.name,
        input.roadName,
        input.area,
        input.latitude,
        input.longitude,
        input.rtspUrl,
        input.sourceKind,
        input.uploadedFileRef,
      );
    },
    onSuccess: () => {
      invalidate();
    },
  });
}

export function useUpdateCamera() {
  const { actor } = useActor(createActor);
  const invalidate = useInvalidateRoadwatch();
  return useMutation({
    mutationFn: async (camera: Camera) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.updateCamera(camera);
    },
    onSuccess: () => {
      invalidate();
    },
  });
}

export function useDeleteCamera() {
  const { actor } = useActor(createActor);
  const invalidate = useInvalidateRoadwatch();
  return useMutation({
    mutationFn: async (id: CameraId) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.deleteCamera(id);
    },
    onSuccess: () => {
      invalidate();
    },
  });
}

export function useStartMonitoring() {
  const { actor } = useActor(createActor);
  const invalidate = useInvalidateRoadwatch();
  return useMutation({
    mutationFn: async (id: CameraId) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.startMonitoring(id);
    },
    onSuccess: () => {
      invalidate();
    },
  });
}

export function useStopMonitoring() {
  const { actor } = useActor(createActor);
  const invalidate = useInvalidateRoadwatch();
  return useMutation({
    mutationFn: async (id: CameraId) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.stopMonitoring(id);
    },
    onSuccess: () => {
      invalidate();
    },
  });
}

/** Begins a monitoring session for a camera (resets the stored frame count). */
export function useStartMonitoringSession() {
  const { actor } = useActor(createActor);
  const invalidate = useInvalidateRoadwatch();
  return useMutation({
    mutationFn: async (id: CameraId) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.startMonitoringSession(id);
    },
    onSuccess: () => {
      invalidate();
    },
  });
}

/** Ends the active monitoring session, keeping the final frame count. */
export function useStopMonitoringSession() {
  const { actor } = useActor(createActor);
  const invalidate = useInvalidateRoadwatch();
  return useMutation({
    mutationFn: async (id: CameraId) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.stopMonitoringSession(id);
    },
    onSuccess: () => {
      invalidate();
    },
  });
}

/** Reports the client-decoded frame count for an active session. */
export function useReportFrameCount() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { cameraId: CameraId; frameCount: bigint }) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.reportFrameCount(input.cameraId, input.frameCount);
    },
    onSuccess: (_result, variables) => {
      void queryClient.invalidateQueries({
        queryKey: roadwatchKeys.frameCount(variables.cameraId),
      });
    },
  });
}

export function useSetCameraSource() {
  const { actor } = useActor(createActor);
  const invalidate = useInvalidateRoadwatch();
  return useMutation({
    mutationFn: async (input: {
      id: CameraId;
      sourceKind: VideoSourceKind;
      rtspUrl: string;
      uploadedFileRef: ExternalBlob | null;
    }) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.setCameraSource(
        input.id,
        input.sourceKind,
        input.rtspUrl,
        input.uploadedFileRef,
      );
    },
    onSuccess: () => {
      invalidate();
    },
  });
}

export function useRecordDetection() {
  const { actor } = useActor(createActor);
  const invalidate = useInvalidateRoadwatch();
  return useMutation({
    mutationFn: async (input: {
      cameraId: CameraId;
      vehicleClass: VehicleClass;
      confidence: number;
      box: BoundingBox;
      simulated: boolean;
    }) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.recordDetection(
        input.cameraId,
        input.vehicleClass,
        input.confidence,
        input.box,
        input.simulated,
      );
    },
    onSuccess: () => {
      invalidate();
    },
  });
}

export function useGenerateAccidentEvent() {
  const { actor } = useActor(createActor);
  const invalidate = useInvalidateRoadwatch();
  return useMutation({
    mutationFn: async (input: {
      cameraId: CameraId;
      confidence: number | null;
      summary: string;
      snapshotRef: string | null;
    }) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.generateAccidentEvent(
        input.cameraId,
        input.confidence,
        input.summary,
        input.snapshotRef,
      );
    },
    onSuccess: () => {
      invalidate();
    },
  });
}

export function useUpdateIncidentStatus() {
  const { actor } = useActor(createActor);
  const invalidate = useInvalidateRoadwatch();
  return useMutation({
    mutationFn: async (input: {
      id: IncidentId;
      verification: VerificationStatus;
      resolution: ResolutionStatus;
    }) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.updateIncidentStatus(
        input.id,
        input.verification,
        input.resolution,
      );
    },
    onSuccess: () => {
      invalidate();
    },
  });
}

export function useUpdateAlertStatus() {
  const { actor } = useActor(createActor);
  const invalidate = useInvalidateRoadwatch();
  return useMutation({
    mutationFn: async (input: { id: AlertId; status: AlertStatus }) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.updateAlertStatus(input.id, input.status);
    },
    onSuccess: () => {
      invalidate();
    },
  });
}

export function useUpdateSettings() {
  const { actor } = useActor(createActor);
  const invalidate = useInvalidateRoadwatch();
  return useMutation({
    mutationFn: async (settings: Settings) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.updateSettings(settings);
    },
    onSuccess: () => {
      invalidate();
    },
  });
}

export function useLoadSampleData() {
  const { actor } = useActor(createActor);
  const invalidate = useInvalidateRoadwatch();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.loadSampleData();
    },
    onSuccess: () => {
      invalidate();
    },
  });
}
