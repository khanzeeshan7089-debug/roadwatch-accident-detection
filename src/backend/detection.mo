import Int "mo:core/Int";
import List "mo:core/List";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Time "mo:core/Time";
import Types "types/common";

// Detection-log and settings domain logic. The accident-analysis pipeline runs
// in clearly labelled simulation mode: this module records the entries the
// pipeline produces and stores the configuration that drives it. State is
// injected by the composition root.
module {
  // Mutable counters shared with the actor.
  public type Counters = {
    var nextCameraId : Nat;
    var nextIncidentId : Nat;
    var nextAlertId : Nat;
    var nextLogId : Nat;
  };

  // ---- Detection logs ----

  public func recordDetection(
    detectionLogs : List.List<Types.DetectionLog>,
    counters : Counters,
    cameraId : Types.CameraId,
    vehicleClass : Types.VehicleClass,
    confidence : Float,
    box : Types.BoundingBox,
    simulated : Bool,
  ) : Types.MutationResult {
    if (confidence < 0.0 or confidence > 1.0) {
      return #err(#invalidInput("Confidence must be between 0 and 1"));
    };
    let id = counters.nextLogId;
    counters.nextLogId := id + 1;
    detectionLogs.add({
      id;
      cameraId;
      detectedAt = Time.now();
      vehicleClass;
      confidence;
      box;
      simulated;
    });
    #ok;
  };

  // Newest first.
  public func listDetections(
    detectionLogs : List.List<Types.DetectionLog>,
    cameraId : Types.CameraId,
  ) : [Types.DetectionLog] {
    let matching = detectionLogs.filter(func log = log.cameraId == cameraId).toArray();
    matching.sort(func (a, b) = Int.compare(b.detectedAt, a.detectedAt));
  };

  // ---- Settings ----

  public func getSettings(settings : { var value : Types.Settings }) : Types.Settings {
    settings.value;
  };

  public func updateSettings(
    settings : { var value : Types.Settings },
    next : Types.Settings,
  ) : Types.MutationResult {
    if (next.sensitivity < 0.0 or next.sensitivity > 1.0) {
      return #err(#invalidInput("Sensitivity must be between 0 and 1"));
    };
    if (next.confidenceThreshold < 0.0 or next.confidenceThreshold > 1.0) {
      return #err(#invalidInput("Confidence threshold must be between 0 and 1"));
    };
    settings.value := next;
    #ok;
  };

  // ---- Sample demonstration data ----

  // Seeds a small set of cameras, detection logs and one potential incident so
  // the dashboard has data to display. Idempotent per call: it appends a fresh
  // sample set and stamps the settings with the load time.
  public func loadSampleData(
    cameras : Map.Map<Types.CameraId, Types.Camera>,
    detectionLogs : List.List<Types.DetectionLog>,
    settings : { var value : Types.Settings },
    counters : Counters,
  ) : Types.MutationResult {
    let now = Time.now();

    let samples : [(Text, Text, Text, Float, Float)] = [
      ("MG Road Junction", "MG Road", "Central", 12.9716, 77.5946),
      ("Ring Road Flyover", "Outer Ring Road", "North", 13.0358, 77.5970),
      ("Airport Approach", "Airport Road", "East", 13.1986, 77.7066),
    ];

    let createdIds = List.empty<Types.CameraId>();
    for ((name, roadName, area, latitude, longitude) in samples.values()) {
      let id = counters.nextCameraId;
      counters.nextCameraId := id + 1;
      cameras.add(id, {
        id;
        code = "CAM-" # id.toText();
        name;
        roadName;
        area;
        latitude;
        longitude;
        rtspUrl = "";
        sourceKind = #sample;
        uploadedFileRef = null;
        connectionStatus = #online;
        monitoringState = #monitoring;
        createdAt = now;
      });
      createdIds.add(id);
    };

    let classes : [Types.VehicleClass] = [#car, #motorcycle, #bus, #truck];
    var i = 0;
    for (cameraId in createdIds.values()) {
      let vehicleClass = classes[i % classes.size()];
      let logId = counters.nextLogId;
      counters.nextLogId := logId + 1;
      detectionLogs.add({
        id = logId;
        cameraId;
        detectedAt = now;
        vehicleClass;
        confidence = 0.82;
        box = { x = 0.25; y = 0.30; width = 0.20; height = 0.25 };
        simulated = true;
      });
      i += 1;
    };

    settings.value := { settings.value with lastSampleLoadedAt = ?now };
    #ok;
  };
};
