import Int "mo:core/Int";
import List "mo:core/List";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Storage "mo:caffeineai-object-storage/Storage";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Types "../types/common";
import Cameras "../cameras";
import Detection "../detection";
import Incidents "../incidents";
import Alerts "../alerts";

// Roadwatch application service layer. Every function is a thin orchestration
// over the stateless domain modules in `src/backend/*.mo`; the actor's stable
// state is injected by the composition root so this module owns no state.
module {
  // The actor's mutable counters record, shared by reference.
  public type Counters = {
    var nextCameraId : Nat;
    var nextIncidentId : Nat;
    var nextAlertId : Nat;
    var nextLogId : Nat;
  };

  // The full set of stable collections the service layer operates on.
  public type State = {
    cameras : Map.Map<Types.CameraId, Types.Camera>;
    incidents : Map.Map<Types.IncidentId, Types.Incident>;
    alerts : Map.Map<Types.AlertId, Types.EmergencyAlert>;
    detectionLogs : List.List<Types.DetectionLog>;
    monitoringSessions : Map.Map<Types.CameraId, Types.MonitoringSession>;
    settings : { var value : Types.Settings };
    counters : Counters;
  };

  // ---- Cameras ----

  public func createCamera(
    state : State,
    name : Text,
    roadName : Text,
    area : Text,
    latitude : Float,
    longitude : Float,
    rtspUrl : Text,
    sourceKind : Types.VideoSourceKind,
    uploadedFileRef : ?Storage.ExternalBlob,
  ) : Types.MutationResult {
    Cameras.createCamera(
      state.cameras,
      state.counters,
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

  public func listCameras(state : State) : [Types.Camera] {
    Cameras.listCameras(state.cameras);
  };

  public func updateCamera(state : State, camera : Types.Camera) : Types.MutationResult {
    Cameras.updateCamera(state.cameras, camera);
  };

  public func deleteCamera(state : State, id : Types.CameraId) : Types.MutationResult {
    Cameras.deleteCamera(state.cameras, id);
  };

  public func startMonitoring(state : State, id : Types.CameraId) : Types.MutationResult {
    Cameras.startMonitoring(state.cameras, id);
  };

  public func stopMonitoring(state : State, id : Types.CameraId) : Types.MutationResult {
    Cameras.stopMonitoring(state.cameras, id);
  };

  public func setCameraSource(
    state : State,
    id : Types.CameraId,
    sourceKind : Types.VideoSourceKind,
    rtspUrl : Text,
    uploadedFileRef : ?Storage.ExternalBlob,
  ) : Types.MutationResult {
    Cameras.setCameraSource(state.cameras, id, sourceKind, rtspUrl, uploadedFileRef);
  };

  // ---- Detection logs ----

  public func recordDetection(
    state : State,
    cameraId : Types.CameraId,
    vehicleClass : Types.VehicleClass,
    confidence : Float,
    box : Types.BoundingBox,
    simulated : Bool,
  ) : Types.MutationResult {
    Detection.recordDetection(
      state.detectionLogs,
      state.counters,
      cameraId,
      vehicleClass,
      confidence,
      box,
      simulated,
    );
  };

  public func listDetections(state : State, cameraId : Types.CameraId) : [Types.DetectionLog] {
    Detection.listDetections(state.detectionLogs, cameraId);
  };

  // ---- Incidents and alerts ----

  // Generate a potential accident event for a camera: create the incident and
  // raise its emergency alert in one step. The camera snapshot is copied onto
  // the incident so history survives a later camera edit or delete.
  public func generateAccidentEvent(
    state : State,
    cameraId : Types.CameraId,
    confidence : ?Float,
    summary : Text,
    snapshotRef : ?Text,
  ) : Types.MutationResult {
    let camera = switch (state.cameras.get(cameraId)) {
      case null { return #err(#notFound("Camera not found")) };
      case (?c) { c };
    };
    let now = Incidents.now();
    let incidentId = Incidents.nextId(state.counters);
    let incident = Incidents.newIncident(
      incidentId,
      camera.id,
      camera.code,
      camera.roadName,
      camera.area,
      camera.latitude,
      camera.longitude,
      now,
      #simulated,
      confidence,
      summary,
      snapshotRef,
    );
    state.incidents.add(incidentId, incident);

    let alertId = Alerts.nextId(state.counters);
    let location = camera.roadName # ", " # camera.area;
    let alert = Alerts.newAlert(alertId, incidentId, camera.id, location, now);
    state.alerts.add(alertId, alert);
    #ok;
  };

  public func listIncidents(state : State, filter : Types.IncidentFilter) : [Types.Incident] {
    Incidents.list(state.incidents, filter);
  };

  public func getIncident(state : State, id : Types.IncidentId) : ?Types.Incident {
    Incidents.get(state.incidents, id);
  };

  public func updateIncidentStatus(
    state : State,
    id : Types.IncidentId,
    verification : Types.VerificationStatus,
    resolution : Types.ResolutionStatus,
  ) : Types.MutationResult {
    switch (state.incidents.get(id)) {
      case null { #err(#notFound("Incident not found")) };
      case (?incident) {
        state.incidents.add(id, Incidents.applyStatus(incident, verification, resolution));
        #ok;
      };
    };
  };

  public func listAlerts(state : State) : [Types.EmergencyAlert] {
    Alerts.list(state.alerts);
  };

  public func updateAlertStatus(
    state : State,
    id : Types.AlertId,
    status : Types.AlertStatus,
  ) : Types.MutationResult {
    switch (state.alerts.get(id)) {
      case null { #err(#notFound("Alert not found")) };
      case (?alert) {
        let note = switch (status) {
          case (#active) { "Alert re-activated" };
          case (#acknowledged) { "Alert acknowledged" };
          case (#resolved) { "Alert resolved" };
        };
        state.alerts.add(id, Alerts.applyStatus(alert, status, Time.now(), note));
        #ok;
      };
    };
  };

  // ---- Settings, stats, analytics ----

  public func getSettings(state : State) : Types.Settings {
    Detection.getSettings(state.settings);
  };

  public func updateSettings(state : State, settings : Types.Settings) : Types.MutationResult {
    Detection.updateSettings(state.settings, settings);
  };

  public func getDashboardStats(state : State) : Types.DashboardStats {
    let cameras = state.cameras.values().toArray();
    var activeCameras = 0;
    for (camera in cameras.values()) {
      if (camera.monitoringState == #monitoring) { activeCameras += 1 };
    };

    let incidents = state.incidents.values().toArray();
    var potentialAccidents = 0;
    var resolvedIncidents = 0;
    for (incident in incidents.values()) {
      if (incident.status == #potential) { potentialAccidents += 1 };
      if (incident.status == #resolved) { resolvedIncidents += 1 };
    };

    let alerts = state.alerts.values().toArray();
    var pendingAlerts = 0;
    for (alert in alerts.values()) {
      if (alert.status == #active) { pendingAlerts += 1 };
    };

    {
      totalCameras = cameras.size();
      activeCameras;
      vehiclesDetected = state.detectionLogs.size();
      potentialAccidents;
      pendingAlerts;
      resolvedIncidents;
    };
  };

  public func getAnalytics(state : State) : Types.Analytics {
    let logs = state.detectionLogs.toArray();
    let incidents = state.incidents.values().toArray();
    let cameras = state.cameras.values().toArray();

    // Daily vehicle detections, keyed by UTC day (nanoseconds / day).
    let dayCounts = Map.empty<Int, Nat>();
    for (log in logs.values()) {
      let day = log.detectedAt / 86_400_000_000_000;
      dayCounts.add(day, (dayCounts.get(day) ?? 0) + 1);
    };
    let dailyDetections = dayCounts.entries().map(
      func ((day, count)) = { date = day.toText(); count }
    ).toArray().sort(func (a, b) = Text.compare(a.date, b.date));

    // Weekly accident alerts, keyed by UTC week (nanoseconds / week).
    let weekCounts = Map.empty<Int, Nat>();
    for (incident in incidents.values()) {
      let week = incident.detectedAt / 604_800_000_000_000;
      weekCounts.add(week, (weekCounts.get(week) ?? 0) + 1);
    };
    let weeklyAlerts = weekCounts.entries().map(
      func ((week, count)) = { week = week.toText(); count }
    ).toArray().sort(func (a, b) = Text.compare(a.week, b.week));

    // Per-camera activity: detections and incidents attributed to each camera.
    let cameraActivity = cameras.map(
      func (camera) {
        var detections = 0;
        for (log in logs.values()) {
          if (log.cameraId == camera.id) { detections += 1 };
        };
        var incidentCount = 0;
        for (incident in incidents.values()) {
          if (incident.cameraId == camera.id) { incidentCount += 1 };
        };
        {
          cameraId = camera.id;
          cameraCode = camera.code;
          detections;
          incidents = incidentCount;
        };
      }
    );

    // Incident distribution by lifecycle status.
    let statusCounts = Map.empty<Text, Nat>();
    for (incident in incidents.values()) {
      let key = switch (incident.status) {
        case (#potential) { "potential" };
        case (#verified) { "verified" };
        case (#falseAlarm) { "falseAlarm" };
        case (#resolved) { "resolved" };
      };
      statusCounts.add(key, (statusCounts.get(key) ?? 0) + 1);
    };
    let incidentDistribution = statusCounts.entries().map(
      func ((status, count)) = { status; count }
    ).toArray().sort(func (a, b) = Text.compare(a.status, b.status));

    // Detection statistics by vehicle class.
    let classCounts = Map.empty<Text, Nat>();
    for (log in logs.values()) {
      let key = switch (log.vehicleClass) {
        case (#car) { "car" };
        case (#motorcycle) { "motorcycle" };
        case (#bus) { "bus" };
        case (#truck) { "truck" };
      };
      classCounts.add(key, (classCounts.get(key) ?? 0) + 1);
    };
    let detectionStats = classCounts.entries().map(
      func ((vehicleClass, count)) = { vehicleClass; count }
    ).toArray().sort(func (a, b) = Text.compare(a.vehicleClass, b.vehicleClass));

    {
      dailyDetections;
      weeklyAlerts;
      cameraActivity;
      incidentDistribution;
      detectionStats;
    };
  };

  public func loadSampleData(state : State) : Types.MutationResult {
    Detection.loadSampleData(
      state.cameras,
      state.detectionLogs,
      state.settings,
      state.counters,
    );
  };

  // ---- Monitoring sessions ----

  // Start a monitoring session for a camera, recording the start time and
  // resetting the client-reported frame count. An offline camera is refused and
  // is never marked as monitoring.
  public func startMonitoringSession(state : State, cameraId : Types.CameraId) : Types.MutationResult {
    let camera = switch (state.cameras.get(cameraId)) {
      case null { return #err(#notFound("Camera not found")) };
      case (?c) { c };
    };
    switch (camera.connectionStatus) {
      case (#offline) {
        return #err(#invalidInput("Camera is offline and cannot be monitored"));
      };
      case (#online) {};
    };
    let now = Time.now();
    state.monitoringSessions.add(cameraId, {
      cameraId;
      active = true;
      startedAt = now;
      frameCount = 0;
      updatedAt = now;
    });
    // Keep the camera's monitoring state consistent with the active session.
    state.cameras.add(cameraId, { camera with monitoringState = #monitoring });
    #ok;
  };

  // Stop a camera's monitoring session, keeping the last reported frame count.
  public func stopMonitoringSession(state : State, cameraId : Types.CameraId) : Types.MutationResult {
    let session = switch (state.monitoringSessions.get(cameraId)) {
      case null { return #err(#notFound("Monitoring session not found")) };
      case (?s) { s };
    };
    state.monitoringSessions.add(cameraId, {
      session with
      active = false;
      updatedAt = Time.now();
    });
    // Keep the camera's monitoring state consistent with the stopped session.
    switch (state.cameras.get(cameraId)) {
      case null {};
      case (?camera) {
        state.cameras.add(cameraId, { camera with monitoringState = #stopped });
      };
    };
    #ok;
  };

  // Read a camera's monitoring session, if one has been started.
  public func getMonitoringSession(state : State, cameraId : Types.CameraId) : ?Types.MonitoringSession {
    state.monitoringSessions.get(cameraId);
  };

  // Record the frame count the client reports for a camera's active session.
  public func reportFrameCount(
    state : State,
    cameraId : Types.CameraId,
    frameCount : Nat,
  ) : Types.MutationResult {
    let session = switch (state.monitoringSessions.get(cameraId)) {
      case null { return #err(#notFound("Monitoring session not found")) };
      case (?s) { s };
    };
    state.monitoringSessions.add(cameraId, {
      session with
      frameCount;
      updatedAt = Time.now();
    });
    #ok;
  };

  // The stored frame count for a camera's session (0 when none exists).
  public func getFrameCount(state : State, cameraId : Types.CameraId) : Nat {
    switch (state.monitoringSessions.get(cameraId)) {
      case null { 0 };
      case (?session) { session.frameCount };
    };
  };

  // The number of stored detection logs for a camera.
  public func getDetectionCount(state : State, cameraId : Types.CameraId) : Nat {
    var count = 0;
    for (log in state.detectionLogs.values()) {
      if (log.cameraId == cameraId) { count += 1 };
    };
    count;
  };
};
