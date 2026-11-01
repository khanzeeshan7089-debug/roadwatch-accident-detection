import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Storage "mo:caffeineai-object-storage/Storage";
import Time "mo:core/Time";
import Types "types/common";

// Camera domain logic: registration, validation, monitoring and video source
// management. State is injected by the composition root so this module stays
// stateless and reusable.
module {
  // Mutable counters shared with the actor.
  public type Counters = {
    var nextCameraId : Nat;
    var nextIncidentId : Nat;
    var nextAlertId : Nat;
    var nextLogId : Nat;
  };

  // ---- Validation ----

  // Returns null when the input is valid, otherwise a human-readable reason.
  public func validateCameraInput(
    name : Text,
    roadName : Text,
    area : Text,
    latitude : Float,
    longitude : Float,
    rtspUrl : Text,
    sourceKind : Types.VideoSourceKind,
  ) : ?Text {
    if (name.trim(#char ' ') == "") {
      return ?"Camera name is required";
    };
    if (roadName.trim(#char ' ') == "") {
      return ?"Road name is required";
    };
    if (area.trim(#char ' ') == "") {
      return ?"Area is required";
    };
    if (latitude < -90.0 or latitude > 90.0) {
      return ?"Latitude must be between -90 and 90";
    };
    if (longitude < -180.0 or longitude > 180.0) {
      return ?"Longitude must be between -180 and 180";
    };
    switch (sourceKind) {
      case (#rtspStream) {
        if (rtspUrl.trim(#char ' ') == "") {
          return ?"RTSP stream URL is required for an RTSP source";
        };
      };
      case (_) {};
    };
    null;
  };

  // ---- Camera operations ----

  public func createCamera(
    cameras : Map.Map<Types.CameraId, Types.Camera>,
    counters : Counters,
    name : Text,
    roadName : Text,
    area : Text,
    latitude : Float,
    longitude : Float,
    rtspUrl : Text,
    sourceKind : Types.VideoSourceKind,
    uploadedFileRef : ?Storage.ExternalBlob,
  ) : Types.MutationResult {
    switch (validateCameraInput(name, roadName, area, latitude, longitude, rtspUrl, sourceKind)) {
      case (?reason) { return #err(#invalidInput(reason)) };
      case null {};
    };
    let id = counters.nextCameraId;
    counters.nextCameraId := id + 1;
    let camera : Types.Camera = {
      id;
      code = "CAM-" # id.toText();
      name;
      roadName;
      area;
      latitude;
      longitude;
      rtspUrl;
      sourceKind;
      uploadedFileRef;
      connectionStatus = #online;
      monitoringState = #stopped;
      createdAt = Time.now();
    };
    cameras.add(id, camera);
    #ok;
  };

  public func listCameras(cameras : Map.Map<Types.CameraId, Types.Camera>) : [Types.Camera] {
    cameras.values().toArray();
  };

  public func updateCamera(
    cameras : Map.Map<Types.CameraId, Types.Camera>,
    camera : Types.Camera,
  ) : Types.MutationResult {
    switch (cameras.get(camera.id)) {
      case null { return #err(#notFound("Camera not found")) };
      case (?existing) {
        switch (validateCameraInput(camera.name, camera.roadName, camera.area, camera.latitude, camera.longitude, camera.rtspUrl, camera.sourceKind)) {
          case (?reason) { return #err(#invalidInput(reason)) };
          case null {};
        };
        // Preserve server-owned fields; only caller-editable details change.
        let updated : Types.Camera = {
          camera with
          code = existing.code;
          connectionStatus = existing.connectionStatus;
          monitoringState = existing.monitoringState;
          createdAt = existing.createdAt;
        };
        cameras.add(camera.id, updated);
        #ok;
      };
    };
  };

  public func deleteCamera(
    cameras : Map.Map<Types.CameraId, Types.Camera>,
    id : Types.CameraId,
  ) : Types.MutationResult {
    switch (cameras.get(id)) {
      case null { #err(#notFound("Camera not found")) };
      case (?_) {
        cameras.remove(id);
        #ok;
      };
    };
  };

  public func startMonitoring(
    cameras : Map.Map<Types.CameraId, Types.Camera>,
    id : Types.CameraId,
  ) : Types.MutationResult {
    switch (cameras.get(id)) {
      case null { #err(#notFound("Camera not found")) };
      case (?camera) {
        cameras.add(id, { camera with monitoringState = #monitoring; connectionStatus = #online });
        #ok;
      };
    };
  };

  public func stopMonitoring(
    cameras : Map.Map<Types.CameraId, Types.Camera>,
    id : Types.CameraId,
  ) : Types.MutationResult {
    switch (cameras.get(id)) {
      case null { #err(#notFound("Camera not found")) };
      case (?camera) {
        cameras.add(id, { camera with monitoringState = #stopped });
        #ok;
      };
    };
  };

  public func setCameraSource(
    cameras : Map.Map<Types.CameraId, Types.Camera>,
    id : Types.CameraId,
    sourceKind : Types.VideoSourceKind,
    rtspUrl : Text,
    uploadedFileRef : ?Storage.ExternalBlob,
  ) : Types.MutationResult {
    switch (cameras.get(id)) {
      case null { return #err(#notFound("Camera not found")) };
      case (?camera) {
        switch (sourceKind) {
          case (#rtspStream) {
            if (rtspUrl.trim(#char ' ') == "") {
              return #err(#invalidInput("RTSP stream URL is required for an RTSP source"));
            };
          };
          case (_) {};
        };
        cameras.add(id, { camera with sourceKind; rtspUrl; uploadedFileRef });
        #ok;
      };
    };
  };
};
