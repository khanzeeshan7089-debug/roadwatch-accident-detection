import Storage "mo:caffeineai-object-storage/Storage";
import Types "../types/common";
import Roadwatch "../lib/roadwatch";

// Public API for the Roadwatch control room. Every endpoint delegates to the
// service layer in `lib/roadwatch.mo`; the actor's stable state is injected by
// the composition root. The app presents camera, detection, incident and alert
// actions as normal user actions and has no sign-in control, so every endpoint
// is callable without an authenticated caller. Reads are open queries so the
// dashboard can render for a visitor.
mixin (state : Roadwatch.State) {
  // ---- Cameras ----

  public shared func createCamera(
    name : Text,
    roadName : Text,
    area : Text,
    latitude : Float,
    longitude : Float,
    rtspUrl : Text,
    sourceKind : Types.VideoSourceKind,
    uploadedFileRef : ?Storage.ExternalBlob,
  ) : async Types.MutationResult {
    Roadwatch.createCamera(
      state,
      name,
      roadName,
      area,
      latitude,
      longitude,
      rtspUrl,
      sourceKind,
      uploadedFileRef,
    );
  };

  public query func listCameras() : async [Types.Camera] {
    Roadwatch.listCameras(state);
  };

  public shared func updateCamera(camera : Types.Camera) : async Types.MutationResult {
    Roadwatch.updateCamera(state, camera);
  };

  public shared func deleteCamera(id : Types.CameraId) : async Types.MutationResult {
    Roadwatch.deleteCamera(state, id);
  };

  public shared func startMonitoring(id : Types.CameraId) : async Types.MutationResult {
    Roadwatch.startMonitoring(state, id);
  };

  public shared func stopMonitoring(id : Types.CameraId) : async Types.MutationResult {
    Roadwatch.stopMonitoring(state, id);
  };

  public shared func setCameraSource(
    id : Types.CameraId,
    sourceKind : Types.VideoSourceKind,
    rtspUrl : Text,
    uploadedFileRef : ?Storage.ExternalBlob,
  ) : async Types.MutationResult {
    Roadwatch.setCameraSource(state, id, sourceKind, rtspUrl, uploadedFileRef);
  };

  // ---- Detection logs ----

  public shared func recordDetection(
    cameraId : Types.CameraId,
    vehicleClass : Types.VehicleClass,
    confidence : Float,
    box : Types.BoundingBox,
    simulated : Bool,
  ) : async Types.MutationResult {
    Roadwatch.recordDetection(state, cameraId, vehicleClass, confidence, box, simulated);
  };

  public query func listDetections(cameraId : Types.CameraId) : async [Types.DetectionLog] {
    Roadwatch.listDetections(state, cameraId);
  };

  // ---- Incidents and alerts ----

  public shared func generateAccidentEvent(
    cameraId : Types.CameraId,
    confidence : ?Float,
    summary : Text,
    snapshotRef : ?Text,
  ) : async Types.MutationResult {
    Roadwatch.generateAccidentEvent(state, cameraId, confidence, summary, snapshotRef);
  };

  public query func listIncidents(filter : Types.IncidentFilter) : async [Types.Incident] {
    Roadwatch.listIncidents(state, filter);
  };

  public query func getIncident(id : Types.IncidentId) : async ?Types.Incident {
    Roadwatch.getIncident(state, id);
  };

  public shared func updateIncidentStatus(
    id : Types.IncidentId,
    verification : Types.VerificationStatus,
    resolution : Types.ResolutionStatus,
  ) : async Types.MutationResult {
    Roadwatch.updateIncidentStatus(state, id, verification, resolution);
  };

  public query func listAlerts() : async [Types.EmergencyAlert] {
    Roadwatch.listAlerts(state);
  };

  public shared func updateAlertStatus(id : Types.AlertId, status : Types.AlertStatus) : async Types.MutationResult {
    Roadwatch.updateAlertStatus(state, id, status);
  };

  // ---- Settings, stats, analytics ----

  public query func getSettings() : async Types.Settings {
    Roadwatch.getSettings(state);
  };

  public shared func updateSettings(settings : Types.Settings) : async Types.MutationResult {
    Roadwatch.updateSettings(state, settings);
  };

  public query func getDashboardStats() : async Types.DashboardStats {
    Roadwatch.getDashboardStats(state);
  };

  public query func getAnalytics() : async Types.Analytics {
    Roadwatch.getAnalytics(state);
  };

  public shared func loadSampleData() : async Types.MutationResult {
    Roadwatch.loadSampleData(state);
  };

  // ---- Monitoring sessions ----

  public shared func startMonitoringSession(cameraId : Types.CameraId) : async Types.MutationResult {
    Roadwatch.startMonitoringSession(state, cameraId);
  };

  public shared func stopMonitoringSession(cameraId : Types.CameraId) : async Types.MutationResult {
    Roadwatch.stopMonitoringSession(state, cameraId);
  };

  public query func getMonitoringSession(cameraId : Types.CameraId) : async ?Types.MonitoringSession {
    Roadwatch.getMonitoringSession(state, cameraId);
  };

  public shared func reportFrameCount(cameraId : Types.CameraId, frameCount : Nat) : async Types.MutationResult {
    Roadwatch.reportFrameCount(state, cameraId, frameCount);
  };

  public query func getFrameCount(cameraId : Types.CameraId) : async Nat {
    Roadwatch.getFrameCount(state, cameraId);
  };

  public query func getDetectionCount(cameraId : Types.CameraId) : async Nat {
    Roadwatch.getDetectionCount(state, cameraId);
  };
};
