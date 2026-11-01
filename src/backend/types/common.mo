import Storage "mo:caffeineai-object-storage/Storage";

module {
  // Cross-cutting identifiers and timestamps.
  public type CameraId = Nat;
  public type IncidentId = Nat;
  public type AlertId = Nat;
  public type LogId = Nat;
  public type Timestamp = Int;

  // How a camera receives its video.
  public type VideoSourceKind = {
    #uploadedFile;
    #rtspStream;
    #sample;
  };

  // Whether the camera is reachable.
  public type ConnectionStatus = {
    #online;
    #offline;
  };

  // Whether the camera is actively being monitored.
  public type MonitoringState = {
    #monitoring;
    #stopped;
  };

  // A CCTV camera registered in the system.
  public type Camera = {
    id : CameraId;
    code : Text;
    name : Text;
    roadName : Text;
    area : Text;
    latitude : Float;
    longitude : Float;
    rtspUrl : Text;
    sourceKind : VideoSourceKind;
    uploadedFileRef : ?Storage.ExternalBlob;
    connectionStatus : ConnectionStatus;
    monitoringState : MonitoringState;
    createdAt : Timestamp;
  };

  // A per-camera monitoring session. The client reports the frame count it has
  // processed; the backend only stores it. No server-side video processing or
  // model inference happens here.
  public type MonitoringSession = {
    cameraId : CameraId;
    active : Bool;
    startedAt : Timestamp;
    frameCount : Nat;
    updatedAt : Timestamp;
  };

  // Whether an incident came from the simulation pipeline or a real model.
  public type DetectionSource = {
    #simulated;
    #model;
  };

  // Lifecycle of a potential accident incident.
  public type IncidentStatus = {
    #potential;
    #verified;
    #falseAlarm;
    #resolved;
  };

  // Verification state of an incident.
  public type VerificationStatus = {
    #unverified;
    #verified;
    #falseAlarm;
  };

  // Resolution state of an incident.
  public type ResolutionStatus = {
    #unresolved;
    #resolved;
  };

  // A potential accident event derived from camera analysis.
  public type Incident = {
    id : IncidentId;
    cameraId : CameraId;
    cameraCode : Text;
    roadName : Text;
    area : Text;
    latitude : Float;
    longitude : Float;
    detectedAt : Timestamp;
    status : IncidentStatus;
    detectionSource : DetectionSource;
    confidence : ?Float;
    verificationStatus : VerificationStatus;
    resolutionStatus : ResolutionStatus;
    summary : Text;
    snapshotRef : ?Text;
  };

  // Notification state for one responder channel.
  public type NotificationStatus = {
    #pending;
    #notified;
    #failed;
  };

  // Lifecycle of an emergency alert.
  public type AlertStatus = {
    #active;
    #acknowledged;
    #resolved;
  };

  // One entry in an alert's status-change history.
  public type AlertHistoryEntry = {
    status : AlertStatus;
    at : Timestamp;
    note : Text;
  };

  // An emergency alert raised for an incident.
  public type EmergencyAlert = {
    id : AlertId;
    incidentId : IncidentId;
    cameraId : CameraId;
    location : Text;
    raisedAt : Timestamp;
    policeStatus : NotificationStatus;
    hospitalStatus : NotificationStatus;
    status : AlertStatus;
    history : [AlertHistoryEntry];
  };

  // Vehicle classes the detector reports.
  public type VehicleClass = {
    #car;
    #motorcycle;
    #bus;
    #truck;
  };

  // Normalized bounding box (0.0 - 1.0) for a detected vehicle.
  public type BoundingBox = {
    x : Float;
    y : Float;
    width : Float;
    height : Float;
  };

  // One vehicle-detection log entry.
  public type DetectionLog = {
    id : LogId;
    cameraId : CameraId;
    detectedAt : Timestamp;
    vehicleClass : VehicleClass;
    confidence : Float;
    box : BoundingBox;
    simulated : Bool;
  };

  // Accident-detection configuration.
  public type Settings = {
    sensitivity : Float;
    confidenceThreshold : Float;
    simulationMode : Bool;
    lastSampleLoadedAt : ?Timestamp;
  };

  // Dashboard headline statistics, all derived from stored records.
  public type DashboardStats = {
    totalCameras : Nat;
    activeCameras : Nat;
    vehiclesDetected : Nat;
    potentialAccidents : Nat;
    pendingAlerts : Nat;
    resolvedIncidents : Nat;
  };

  // One point in a daily vehicle-detection series.
  public type DailyDetectionPoint = {
    date : Text;
    count : Nat;
  };

  // One point in a weekly accident-alert series.
  public type WeeklyAlertPoint = {
    week : Text;
    count : Nat;
  };

  // One point in a per-camera activity series.
  public type CameraActivityPoint = {
    cameraId : CameraId;
    cameraCode : Text;
    detections : Nat;
    incidents : Nat;
  };

  // One slice of the incident distribution by status.
  public type IncidentDistributionPoint = {
    status : Text;
    count : Nat;
  };

  // One point in the per-vehicle-class detection statistics.
  public type DetectionStatPoint = {
    vehicleClass : Text;
    count : Nat;
  };

  // Aggregated analytics result.
  public type Analytics = {
    dailyDetections : [DailyDetectionPoint];
    weeklyAlerts : [WeeklyAlertPoint];
    cameraActivity : [CameraActivityPoint];
    incidentDistribution : [IncidentDistributionPoint];
    detectionStats : [DetectionStatPoint];
  };

  // Filters accepted by the incident listing.
  public type IncidentFilter = {
    searchId : ?Text;
    cameraId : ?CameraId;
    status : ?IncidentStatus;
    fromTime : ?Timestamp;
    toTime : ?Timestamp;
  };

  // Failure reasons returned by mutations.
  public type RoadwatchError = {
    #notFound : Text;
    #invalidInput : Text;
    #notAuthorized;
  };

  // Result alias used by every mutation.
  public type MutationResult = {
    #ok;
    #err : RoadwatchError;
  };
};
