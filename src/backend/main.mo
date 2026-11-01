import AccessControl "mo:caffeineai-authorization/access-control";
import MixinAuthorization "mo:caffeineai-authorization/MixinAuthorization";
import MixinObjectStorage "mo:caffeineai-object-storage/Mixin";
import Expose "mo:caffeineai-oql/Expose";
import Entity "mo:caffeineai-oql/Entity";
import MapEntity "mo:caffeineai-oql/MapEntity";
import ListEntity "mo:caffeineai-oql/ListEntity";
import RecordValue "mo:caffeineai-oql/RecordValue";
import NatValue "mo:caffeineai-oql/NatValue";
import IntValue "mo:caffeineai-oql/IntValue";
import FloatValue "mo:caffeineai-oql/FloatValue";
import TextValue "mo:caffeineai-oql/TextValue";
import BoolValue "mo:caffeineai-oql/BoolValue";
import BlobValue "mo:caffeineai-oql/BlobValue";
import VideoSourceKindValue "VideoSourceKindValue";
import ConnectionStatusValue "ConnectionStatusValue";
import MonitoringStateValue "MonitoringStateValue";
import IncidentStatusValue "IncidentStatusValue";
import DetectionSourceValue "DetectionSourceValue";
import VerificationStatusValue "VerificationStatusValue";
import ResolutionStatusValue "ResolutionStatusValue";
import AlertStatusValue "AlertStatusValue";
import NotificationStatusValue "NotificationStatusValue";
import VehicleClassValue "VehicleClassValue";
import Map "mo:core/Map";
import List "mo:core/List";
import Types "types/common";
import Roadwatch "lib/roadwatch";
import RoadwatchApi "mixins/roadwatch-api";
import ApiDocMixin "mixins/api-doc";

actor {
  // ---- Stable state (initialized by the migration chain) ----
  let accessControlState : AccessControl.AccessControlState;
  let cameras : Map.Map<Types.CameraId, Types.Camera>;
  let incidents : Map.Map<Types.IncidentId, Types.Incident>;
  let alerts : Map.Map<Types.AlertId, Types.EmergencyAlert>;
  let detectionLogs : List.List<Types.DetectionLog>;
  let monitoringSessions : Map.Map<Types.CameraId, Types.MonitoringSession>;
  let settings : { var value : Types.Settings };
  let counters : {
    var nextCameraId : Nat;
    var nextIncidentId : Nat;
    var nextAlertId : Nat;
    var nextLogId : Nat;
  };

  // The service layer's view of the same stable state, shared by reference.
  // Derived from the stable fields, so it is transient and rebuilt on restart.
  transient let serviceState : Roadwatch.State = {
    cameras;
    incidents;
    alerts;
    detectionLogs;
    monitoringSessions;
    settings;
    counters;
  };

  include MixinAuthorization(accessControlState, null);
  include MixinObjectStorage();
  include RoadwatchApi(serviceState);
  include ApiDocMixin();

  include Expose({
    entities = [
      // Cameras: control-room infrastructure, readable by the Data Intelligence
      // agent only (controller).
      cameras.toEntity("camera", "Camera", "id")
        .sample({
          id = 0;
          code = "";
          name = "";
          roadName = "";
          area = "";
          latitude = 0.0;
          longitude = 0.0;
          rtspUrl = "";
          sourceKind = #sample;
          uploadedFileRef = null;
          connectionStatus = #online;
          monitoringState = #stopped;
          createdAt = 0;
        })
        .controllerOnly()
        .build(),
      // Incidents: potential accidents, controller-readable.
      incidents.toEntity("incident", "Incident", "id")
        .sample({
          id = 0;
          cameraId = 0;
          cameraCode = "";
          roadName = "";
          area = "";
          latitude = 0.0;
          longitude = 0.0;
          detectedAt = 0;
          status = #potential;
          detectionSource = #simulated;
          confidence = ?0.0;
          verificationStatus = #unverified;
          resolutionStatus = #unresolved;
          summary = "";
          snapshotRef = ?"";
        })
        .controllerOnly()
        .build(),
      // Alerts carry an array history field, so they are declared manually.
      alerts.toEntityManual("alert", "EmergencyAlert", "id")
        .sample({
          id = 0;
          incidentId = 0;
          cameraId = 0;
          location = "";
          raisedAt = 0;
          policeStatus = #pending;
          hospitalStatus = #pending;
          status = #active;
          history = [];
        })
        .payload("id", func a = a.id)
        .payload("incidentId", func a = a.incidentId)
        .payload("cameraId", func a = a.cameraId)
        .payload("location", func a = a.location)
        .payload("raisedAt", func a = a.raisedAt)
        .payload("policeStatus", func a = a.policeStatus)
        .payload("hospitalStatus", func a = a.hospitalStatus)
        .payload("status", func a = a.status)
        .payload("historyCount", func a = a.history.size())
        .controllerOnly()
        .build(),
      // Detection logs carry a nested bounding box, so they are declared
      // manually and the box is flattened into columns.
      detectionLogs.toEntityManual("detectionLog", "DetectionLog", "id")
        .sample({
          id = 0;
          cameraId = 0;
          detectedAt = 0;
          vehicleClass = #car;
          confidence = 0.0;
          box = { x = 0.0; y = 0.0; width = 0.0; height = 0.0 };
          simulated = true;
        })
        .payload("id", func l = l.id)
        .payload("cameraId", func l = l.cameraId)
        .payload("detectedAt", func l = l.detectedAt)
        .payload("vehicleClass", func l = l.vehicleClass)
        .payload("confidence", func l = l.confidence)
        .flatten(func l = l.box)
        .payload("simulated", func l = l.simulated)
        .controllerOnly()
        .build(),
      // Monitoring sessions: per-camera client-reported frame counts, readable
      // by the Data Intelligence agent only (controller).
      monitoringSessions.toEntity("monitoringSession", "MonitoringSession", "cameraId")
        .sample({
          cameraId = 0;
          active = false;
          startedAt = 0;
          frameCount = 0;
          updatedAt = 0;
        })
        .controllerOnly()
        .build(),
    ];
  });
};
