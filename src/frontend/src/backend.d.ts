import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
import type { ExternalBlob } from "@caffeineai/object-storage";
export type { ExternalBlob } from "@caffeineai/object-storage";
export interface AlertHistoryEntry {
    at: Timestamp;
    status: AlertStatus;
    note: string;
}
export type AlertId = bigint;
export interface Analytics {
    dailyDetections: Array<DailyDetectionPoint>;
    incidentDistribution: Array<IncidentDistributionPoint>;
    weeklyAlerts: Array<WeeklyAlertPoint>;
    detectionStats: Array<DetectionStatPoint>;
    cameraActivity: Array<CameraActivityPoint>;
}
export interface BoundingBox {
    x: number;
    y: number;
    height: number;
    width: number;
}
export interface Camera {
    id: CameraId;
    latitude: number;
    roadName: string;
    monitoringState: MonitoringState;
    area: string;
    code: string;
    name: string;
    createdAt: Timestamp;
    rtspUrl: string;
    sourceKind: VideoSourceKind;
    uploadedFileRef?: ExternalBlob;
    connectionStatus: ConnectionStatus;
    longitude: number;
}
export interface CameraActivityPoint {
    incidents: bigint;
    detections: bigint;
    cameraCode: string;
    cameraId: CameraId;
}
export type CameraId = bigint;
export interface Cell {
    value: Value;
    name: string;
}
export interface DailyDetectionPoint {
    date: string;
    count: bigint;
}
export interface DashboardStats {
    vehiclesDetected: bigint;
    pendingAlerts: bigint;
    totalCameras: bigint;
    resolvedIncidents: bigint;
    activeCameras: bigint;
    potentialAccidents: bigint;
}
export interface DetectionLog {
    id: LogId;
    box: BoundingBox;
    simulated: boolean;
    detectedAt: Timestamp;
    vehicleClass: VehicleClass;
    confidence: number;
    cameraId: CameraId;
}
export interface DetectionStatPoint {
    count: bigint;
    vehicleClass: string;
}
export interface EmergencyAlert {
    id: AlertId;
    status: AlertStatus;
    policeStatus: NotificationStatus;
    incidentId: IncidentId;
    hospitalStatus: NotificationStatus;
    history: Array<AlertHistoryEntry>;
    raisedAt: Timestamp;
    location: string;
    cameraId: CameraId;
}
export type Error_ = {
    __kind__: "FrontendOriginsNotConfigured";
    FrontendOriginsNotConfigured: null;
} | {
    __kind__: "MixedSsoSources";
    MixedSsoSources: {
        otherKeys: Array<string>;
        ssoKeys: Array<string>;
    };
} | {
    __kind__: "Stale";
    Stale: {
        ageNs: bigint;
    };
} | {
    __kind__: "MalformedCandid";
    MalformedCandid: null;
} | {
    __kind__: "AmbiguousAttribute";
    AmbiguousAttribute: {
        field: string;
        sources: Array<string>;
    };
} | {
    __kind__: "NoAttributes";
    NoAttributes: null;
} | {
    __kind__: "UnknownNonce";
    UnknownNonce: null;
} | {
    __kind__: "UntrustedSsoSource";
    UntrustedSsoSource: {
        domain: string;
    };
} | {
    __kind__: "MissingField";
    MissingField: string;
} | {
    __kind__: "FrontendOriginMismatch";
    FrontendOriginMismatch: {
        got: string;
        expected: Array<string>;
    };
};
export interface Incident {
    id: IncidentId;
    status: IncidentStatus;
    latitude: number;
    roadName: string;
    detectionSource: DetectionSource;
    area: string;
    detectedAt: Timestamp;
    resolutionStatus: ResolutionStatus;
    summary: string;
    longitude: number;
    cameraCode: string;
    confidence?: number;
    cameraId: CameraId;
    verificationStatus: VerificationStatus;
    snapshotRef?: string;
}
export interface IncidentDistributionPoint {
    status: string;
    count: bigint;
}
export interface IncidentFilter {
    status?: IncidentStatus;
    toTime?: Timestamp;
    fromTime?: Timestamp;
    searchId?: string;
    cameraId?: CameraId;
}
export type IncidentId = bigint;
export type LogId = bigint;
export interface MonitoringSession {
    startedAt: Timestamp;
    active: boolean;
    frameCount: bigint;
    updatedAt: Timestamp;
    cameraId: CameraId;
}
export type MutationResult = {
    __kind__: "ok";
    ok: null;
} | {
    __kind__: "err";
    err: RoadwatchError;
};
export interface Result {
    hasMore: boolean;
    rows: Array<Array<Cell>>;
}
export type Result__1 = {
    __kind__: "ok";
    ok: null;
} | {
    __kind__: "err";
    err: Error_;
};
export type RoadwatchError = {
    __kind__: "notAuthorized";
    notAuthorized: null;
} | {
    __kind__: "invalidInput";
    invalidInput: string;
} | {
    __kind__: "notFound";
    notFound: string;
};
export interface Settings {
    confidenceThreshold: number;
    lastSampleLoadedAt?: Timestamp;
    sensitivity: number;
    simulationMode: boolean;
}
export type Timestamp = bigint;
export type Value = {
    __kind__: "int";
    int: bigint;
} | {
    __kind__: "nat";
    nat: bigint;
} | {
    __kind__: "float";
    float: number;
} | {
    __kind__: "bool";
    bool: boolean;
} | {
    __kind__: "null";
    null: null;
} | {
    __kind__: "text";
    text: string;
};
export interface WeeklyAlertPoint {
    count: bigint;
    week: string;
}
export enum AlertStatus {
    resolved = "resolved",
    active = "active",
    acknowledged = "acknowledged"
}
export enum ConnectionStatus {
    offline = "offline",
    online = "online"
}
export enum DetectionSource {
    model = "model",
    simulated = "simulated"
}
export enum IncidentStatus {
    resolved = "resolved",
    verified = "verified",
    falseAlarm = "falseAlarm",
    potential = "potential"
}
export enum MonitoringState {
    stopped = "stopped",
    monitoring = "monitoring"
}
export enum NotificationStatus {
    pending = "pending",
    notified = "notified",
    failed = "failed"
}
export enum ResolutionStatus {
    resolved = "resolved",
    unresolved = "unresolved"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export enum VehicleClass {
    bus = "bus",
    car = "car",
    truck = "truck",
    motorcycle = "motorcycle"
}
export enum VerificationStatus {
    verified = "verified",
    falseAlarm = "falseAlarm",
    unverified = "unverified"
}
export enum VideoSourceKind {
    uploadedFile = "uploadedFile",
    sample = "sample",
    rtspStream = "rtspStream"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createCamera(name: string, roadName: string, area: string, latitude: number, longitude: number, rtspUrl: string, sourceKind: VideoSourceKind, uploadedFileRef: ExternalBlob | null): Promise<MutationResult>;
    deleteCamera(id: CameraId): Promise<MutationResult>;
    execute(qJson: string): Promise<Result>;
    generateAccidentEvent(cameraId: CameraId, confidence: number | null, summary: string, snapshotRef: string | null): Promise<MutationResult>;
    getAnalytics(): Promise<Analytics>;
    getApiDoc(): Promise<string>;
    getCallerUserRole(): Promise<UserRole>;
    getDashboardStats(): Promise<DashboardStats>;
    getDetectionCount(cameraId: CameraId): Promise<bigint>;
    getFrameCount(cameraId: CameraId): Promise<bigint>;
    getIncident(id: IncidentId): Promise<Incident | null>;
    getMonitoringSession(cameraId: CameraId): Promise<MonitoringSession | null>;
    getSettings(): Promise<Settings>;
    isCallerAdmin(): Promise<boolean>;
    listAlerts(): Promise<Array<EmergencyAlert>>;
    listCameras(): Promise<Array<Camera>>;
    listDetections(cameraId: CameraId): Promise<Array<DetectionLog>>;
    listIncidents(filter: IncidentFilter): Promise<Array<Incident>>;
    loadSampleData(): Promise<MutationResult>;
    recordDetection(cameraId: CameraId, vehicleClass: VehicleClass, confidence: number, box: BoundingBox, simulated: boolean): Promise<MutationResult>;
    reportFrameCount(cameraId: CameraId, frameCount: bigint): Promise<MutationResult>;
    schema(): Promise<string>;
    setCameraSource(id: CameraId, sourceKind: VideoSourceKind, rtspUrl: string, uploadedFileRef: ExternalBlob | null): Promise<MutationResult>;
    startMonitoring(id: CameraId): Promise<MutationResult>;
    startMonitoringSession(cameraId: CameraId): Promise<MutationResult>;
    stopMonitoring(id: CameraId): Promise<MutationResult>;
    stopMonitoringSession(cameraId: CameraId): Promise<MutationResult>;
    updateAlertStatus(id: AlertId, status: AlertStatus): Promise<MutationResult>;
    updateCamera(camera: Camera): Promise<MutationResult>;
    updateIncidentStatus(id: IncidentId, verification: VerificationStatus, resolution: ResolutionStatus): Promise<MutationResult>;
    updateSettings(settings: Settings): Promise<MutationResult>;
}
