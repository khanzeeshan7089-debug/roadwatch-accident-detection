import AccessControl "mo:caffeineai-authorization/access-control";
import Map "mo:core/Map";
import List "mo:core/List";

module {
  // ---- Inlined stable types (migrations must be self-contained) ----
  type CameraId = Nat;
  type IncidentId = Nat;
  type AlertId = Nat;
  type LogId = Nat;
  type Timestamp = Int;

  type VideoSourceKind = { #uploadedFile; #rtspStream; #sample };
  type ConnectionStatus = { #online; #offline };
  type MonitoringState = { #monitoring; #stopped };

  type Camera = {
    id : CameraId;
    code : Text;
    name : Text;
    roadName : Text;
    area : Text;
    latitude : Float;
    longitude : Float;
    rtspUrl : Text;
    sourceKind : VideoSourceKind;
    uploadedFileRef : ?Blob;
    connectionStatus : ConnectionStatus;
    monitoringState : MonitoringState;
    createdAt : Timestamp;
  };

  type DetectionSource = { #simulated; #model };
  type IncidentStatus = { #potential; #verified; #falseAlarm; #resolved };
  type VerificationStatus = { #unverified; #verified; #falseAlarm };
  type ResolutionStatus = { #unresolved; #resolved };

  type Incident = {
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

  type NotificationStatus = { #pending; #notified; #failed };
  type AlertStatus = { #active; #acknowledged; #resolved };

  type AlertHistoryEntry = {
    status : AlertStatus;
    at : Timestamp;
    note : Text;
  };

  type EmergencyAlert = {
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

  type VehicleClass = { #car; #motorcycle; #bus; #truck };

  type BoundingBox = {
    x : Float;
    y : Float;
    width : Float;
    height : Float;
  };

  type DetectionLog = {
    id : LogId;
    cameraId : CameraId;
    detectedAt : Timestamp;
    vehicleClass : VehicleClass;
    confidence : Float;
    box : BoundingBox;
    simulated : Bool;
  };

  type Settings = {
    sensitivity : Float;
    confidenceThreshold : Float;
    simulationMode : Bool;
    lastSampleLoadedAt : ?Timestamp;
  };

  public type OldActor = {};

  public type NewActor = {
    accessControlState : AccessControl.AccessControlState;
    cameras : Map.Map<CameraId, Camera>;
    incidents : Map.Map<IncidentId, Incident>;
    alerts : Map.Map<AlertId, EmergencyAlert>;
    detectionLogs : List.List<DetectionLog>;
    settings : { var value : Settings };
    counters : {
      var nextCameraId : Nat;
      var nextIncidentId : Nat;
      var nextAlertId : Nat;
      var nextLogId : Nat;
    };
  };

  public func migration(_ : OldActor) : NewActor {
    {
      accessControlState = AccessControl.initState();
      cameras = Map.empty();
      incidents = Map.empty();
      alerts = Map.empty();
      detectionLogs = List.empty();
      settings = {
        var value = {
          sensitivity = 0.5;
          confidenceThreshold = 0.5;
          simulationMode = true;
          lastSampleLoadedAt = null;
        };
      };
      counters = {
        var nextCameraId = 0;
        var nextIncidentId = 0;
        var nextAlertId = 0;
        var nextLogId = 0;
      };
    };
  };
};
