import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Order "mo:core/Order";
import Types "types/common";

// Emergency-alert domain logic. Pure functions over the actor's stable state,
// which is passed in by the composition root so the module owns no state.
module {
  // Shared mutable counters record (same shape as the actor's `counters` field).
  public type Counters = {
    var nextCameraId : Nat;
    var nextIncidentId : Nat;
    var nextAlertId : Nat;
    var nextLogId : Nat;
  };

  // Build the alert raised for a newly detected incident. Notifications start
  // pending; the MVP records simulated delivery separately.
  public func newAlert(
    id : Types.AlertId,
    incidentId : Types.IncidentId,
    cameraId : Types.CameraId,
    location : Text,
    raisedAt : Types.Timestamp,
  ) : Types.EmergencyAlert {
    {
      id;
      incidentId;
      cameraId;
      location;
      raisedAt;
      policeStatus = #pending;
      hospitalStatus = #pending;
      status = #active;
      history = [{
        status = #active;
        at = raisedAt;
        note = "Alert raised for potential accident";
      }];
    };
  };

  // Newest-first ordering by raise time, then by id as a tie-breaker.
  public func compareNewestFirst(a : Types.EmergencyAlert, b : Types.EmergencyAlert) : Order.Order {
    if (a.raisedAt > b.raisedAt) { #less }
    else if (a.raisedAt < b.raisedAt) { #greater }
    else if (a.id > b.id) { #less }
    else if (a.id < b.id) { #greater }
    else { #equal };
  };

  // List every alert, newest first.
  public func list(alerts : Map.Map<Types.AlertId, Types.EmergencyAlert>) : [Types.EmergencyAlert] {
    let all = alerts.values().toArray();
    all.sort(compareNewestFirst);
  };

  // Read a single alert by id.
  public func get(
    alerts : Map.Map<Types.AlertId, Types.EmergencyAlert>,
    id : Types.AlertId,
  ) : ?Types.EmergencyAlert {
    alerts.get(id);
  };

  // Change an alert's status and append a history entry recording the change.
  public func applyStatus(
    alert : Types.EmergencyAlert,
    status : Types.AlertStatus,
    at : Types.Timestamp,
    note : Text,
  ) : Types.EmergencyAlert {
    let entry : Types.AlertHistoryEntry = { status; at; note };
    {
      alert with
      status;
      history = alert.history.concat([entry]);
    };
  };

  // Record the simulated police/hospital notification outcome for an alert.
  public func applyNotifications(
    alert : Types.EmergencyAlert,
    police : Types.NotificationStatus,
    hospital : Types.NotificationStatus,
  ) : Types.EmergencyAlert {
    {
      alert with
      policeStatus = police;
      hospitalStatus = hospital;
    };
  };

  // Allocate the next alert id and advance the counter.
  public func nextId(counters : Counters) : Types.AlertId {
    let id = counters.nextAlertId;
    counters.nextAlertId := id + 1;
    id;
  };
};
