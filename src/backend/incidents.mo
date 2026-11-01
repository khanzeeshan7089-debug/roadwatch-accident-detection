import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Order "mo:core/Order";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Types "types/common";

// Incident domain logic. Pure functions over the actor's stable state, which is
// passed in by the composition root so the module owns no state of its own.
module {
  // Shared mutable counters record (same shape as the actor's `counters` field).
  public type Counters = {
    var nextCameraId : Nat;
    var nextIncidentId : Nat;
    var nextAlertId : Nat;
    var nextLogId : Nat;
  };

  // Build a fresh incident record for a camera. The caller supplies the camera
  // snapshot fields so this module does not depend on the camera domain.
  public func newIncident(
    id : Types.IncidentId,
    cameraId : Types.CameraId,
    cameraCode : Text,
    roadName : Text,
    area : Text,
    latitude : Float,
    longitude : Float,
    detectedAt : Types.Timestamp,
    detectionSource : Types.DetectionSource,
    confidence : ?Float,
    summary : Text,
    snapshotRef : ?Text,
  ) : Types.Incident {
    {
      id;
      cameraId;
      cameraCode;
      roadName;
      area;
      latitude;
      longitude;
      detectedAt;
      status = #potential;
      detectionSource;
      confidence;
      verificationStatus = #unverified;
      resolutionStatus = #unresolved;
      summary;
      snapshotRef;
    };
  };

  // Derive the incident lifecycle status from its verification and resolution
  // states so the two never disagree.
  public func deriveStatus(
    verification : Types.VerificationStatus,
    resolution : Types.ResolutionStatus,
  ) : Types.IncidentStatus {
    switch (resolution) {
      case (#resolved) { #resolved };
      case (#unresolved) {
        switch (verification) {
          case (#verified) { #verified };
          case (#falseAlarm) { #falseAlarm };
          case (#unverified) { #potential };
        };
      };
    };
  };

  // Apply a verification/resolution change, keeping `status` consistent.
  public func applyStatus(
    incident : Types.Incident,
    verification : Types.VerificationStatus,
    resolution : Types.ResolutionStatus,
  ) : Types.Incident {
    {
      incident with
      verificationStatus = verification;
      resolutionStatus = resolution;
      status = deriveStatus(verification, resolution);
    };
  };

  // Newest-first ordering by detection time, then by id as a tie-breaker.
  public func compareNewestFirst(a : Types.Incident, b : Types.Incident) : Order.Order {
    if (a.detectedAt > b.detectedAt) { #less }
    else if (a.detectedAt < b.detectedAt) { #greater }
    else if (a.id > b.id) { #less }
    else if (a.id < b.id) { #greater }
    else { #equal };
  };

  // Whether an incident matches the supplied filter.
  public func matchesFilter(incident : Types.Incident, filter : Types.IncidentFilter) : Bool {
    let searchOk = switch (filter.searchId) {
      case null { true };
      case (?term) {
        let needle = term.toLower();
        if (needle == "") { true }
        else { incident.id.toText().toLower().contains(#text needle) };
      };
    };
    let cameraOk = switch (filter.cameraId) {
      case null { true };
      case (?cid) { incident.cameraId == cid };
    };
    let statusOk = switch (filter.status) {
      case null { true };
      case (?s) { incident.status == s };
    };
    let fromOk = switch (filter.fromTime) {
      case null { true };
      case (?t) { incident.detectedAt >= t };
    };
    let toOk = switch (filter.toTime) {
      case null { true };
      case (?t) { incident.detectedAt <= t };
    };
    searchOk and cameraOk and statusOk and fromOk and toOk;
  };

  // List incidents matching the filter, newest first.
  public func list(
    incidents : Map.Map<Types.IncidentId, Types.Incident>,
    filter : Types.IncidentFilter,
  ) : [Types.Incident] {
    let matched = incidents.values().filter(func i = matchesFilter(i, filter)).toArray();
    matched.sort(compareNewestFirst);
  };

  // Read a single incident by id.
  public func get(
    incidents : Map.Map<Types.IncidentId, Types.Incident>,
    id : Types.IncidentId,
  ) : ?Types.Incident {
    incidents.get(id);
  };

  // Allocate the next incident id and advance the counter.
  public func nextId(counters : Counters) : Types.IncidentId {
    let id = counters.nextIncidentId;
    counters.nextIncidentId := id + 1;
    id;
  };

  // Current wall-clock timestamp in nanoseconds.
  public func now() : Types.Timestamp {
    Time.now();
  };
};
