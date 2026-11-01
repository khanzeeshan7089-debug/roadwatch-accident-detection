import { PocketIc, createIdentity } from "@dfinity/pic";
import type { Actor, CanisterFixture } from "@dfinity/pic";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { idlFactory } from "../../src/frontend/src/declarations/backend.did.js";
import type { _SERVICE } from "../../src/frontend/src/declarations/backend.did";

const PIC_URL = process.env.POCKET_IC_URL ?? "";
const BACKEND_WASM = process.env.BACKEND_WASM ?? "";

let pic: PocketIc | undefined;
let actor: Actor<_SERVICE>;
let canisterId: CanisterFixture<_SERVICE>["canisterId"];

// Mutations reject anonymous callers, so every test calls as a signed-in identity.
const operator = createIdentity("roadwatch-operator");

// Candid records require every field, so an "empty" filter still names all keys.
const EMPTY_FILTER = {
  status: [],
  toTime: [],
  fromTime: [],
  searchId: [],
  cameraId: [],
} as const;

beforeAll(async () => {
  pic = await PocketIc.create(PIC_URL);
  ({ actor, canisterId } = await pic.setupCanister<_SERVICE>({
    idlFactory,
    wasm: BACKEND_WASM,
  }));
  actor.setIdentity(operator);
});

afterAll(async () => {
  await pic?.tearDown();
});

describe("Roadwatch backend", () => {
  it("answers empty-state reads instead of trapping", async () => {
    await expect(actor.listCameras()).resolves.toEqual([]);
    await expect(actor.listAlerts()).resolves.toEqual([]);
    await expect(actor.listIncidents(EMPTY_FILTER)).resolves.toEqual([]);
    await expect(actor.listDetections(0n)).resolves.toEqual([]);
    await expect(actor.getIncident(0n)).resolves.toEqual([]);
  });

  it("round-trips a camera through create then list", async () => {
    const result = await actor.createCamera(
      "North Gate Junction",
      "Ring Road",
      "Central District",
      28.6139,
      77.209,
      "rtsp://camera.example.com:554/stream1",
      { rtspStream: null },
      [],
    );
    expect(result).toEqual({ ok: null });

    const cameras = await actor.listCameras();
    expect(cameras).toHaveLength(1);
    expect(cameras[0]).toMatchObject({
      name: "North Gate Junction",
      roadName: "Ring Road",
      area: "Central District",
      monitoringState: { stopped: null },
      connectionStatus: { online: null },
    });
    expect(cameras[0].code).toMatch(/^CAM-/);
  });

  it("rejects an out-of-range latitude without saving", async () => {
    const before = (await actor.listCameras()).length;
    const result = await actor.createCamera(
      "Bad Coords",
      "Ring Road",
      "Central",
      120,
      77.2,
      "rtsp://camera.example.com:554/x",
      { rtspStream: null },
      [],
    );
    expect(result).toMatchObject({ err: { invalidInput: expect.any(String) } });
    expect(await actor.listCameras()).toHaveLength(before);
  });

  it("starts and stops monitoring on a camera", async () => {
    const [camera] = await actor.listCameras();
    expect(camera).toBeDefined();

    await expect(actor.startMonitoring(camera.id)).resolves.toEqual({ ok: null });
    let cameras = await actor.listCameras();
    expect(cameras[0].monitoringState).toEqual({ monitoring: null });

    await expect(actor.stopMonitoring(camera.id)).resolves.toEqual({ ok: null });
    cameras = await actor.listCameras();
    expect(cameras[0].monitoringState).toEqual({ stopped: null });
  });

  it("runs a monitoring session and stores the reported frame count", async () => {
    const [camera] = await actor.listCameras();
    expect(camera).toBeDefined();

    // No session exists before one is started.
    await expect(actor.getMonitoringSession(camera.id)).resolves.toEqual([]);
    await expect(actor.getFrameCount(camera.id)).resolves.toBe(0n);

    await expect(actor.startMonitoringSession(camera.id)).resolves.toEqual({
      ok: null,
    });
    const session = await actor.getMonitoringSession(camera.id);
    expect(session).toHaveLength(1);
    expect(session[0]).toMatchObject({ cameraId: camera.id, active: true });

    await expect(actor.reportFrameCount(camera.id, 250n)).resolves.toEqual({
      ok: null,
    });
    await expect(actor.getFrameCount(camera.id)).resolves.toBe(250n);

    await expect(actor.stopMonitoringSession(camera.id)).resolves.toEqual({
      ok: null,
    });
    const stopped = await actor.getMonitoringSession(camera.id);
    expect(stopped[0]).toMatchObject({ active: false, frameCount: 250n });
  });

  it("reports the stored detection count for a camera", async () => {
    const [camera] = await actor.listCameras();
    expect(camera).toBeDefined();

    // The count is derived from the stored detection log for that camera.
    const detections = await actor.listDetections(camera.id);
    await expect(actor.getDetectionCount(camera.id)).resolves.toBe(
      BigInt(detections.length),
    );
  });

  it("records a detection and reads it back for the camera", async () => {
    const [camera] = await actor.listCameras();
    const result = await actor.recordDetection(
      camera.id,
      { car: null },
      0.87,
      { x: 0.1, y: 0.5, width: 0.2, height: 0.2 },
      true,
    );
    expect(result).toEqual({ ok: null });

    const detections = await actor.listDetections(camera.id);
    expect(detections).toHaveLength(1);
    expect(detections[0]).toMatchObject({
      cameraId: camera.id,
      vehicleClass: { car: null },
      confidence: 0.87,
      simulated: true,
    });
  });

  it("generates a potential accident that creates an incident and an alert", async () => {
    const [camera] = await actor.listCameras();
    const result = await actor.generateAccidentEvent(
      camera.id,
      [0.91],
      "Two vehicles collided",
      [],
    );
    expect(result).toEqual({ ok: null });

    const incidents = await actor.listIncidents(EMPTY_FILTER);
    expect(incidents).toHaveLength(1);
    expect(incidents[0]).toMatchObject({
      cameraId: camera.id,
      status: { potential: null },
      verificationStatus: { unverified: null },
      resolutionStatus: { unresolved: null },
      summary: "Two vehicles collided",
    });

    const alerts = await actor.listAlerts();
    expect(alerts).toHaveLength(1);
    expect(alerts[0]).toMatchObject({
      incidentId: incidents[0].id,
      cameraId: camera.id,
      status: { active: null },
      policeStatus: { pending: null },
      hospitalStatus: { pending: null },
    });
  });

  it("persists an alert status change with a history entry", async () => {
    const [alert] = await actor.listAlerts();
    const result = await actor.updateAlertStatus(alert.id, { resolved: null });
    expect(result).toEqual({ ok: null });

    const alerts = await actor.listAlerts();
    expect(alerts[0].status).toEqual({ resolved: null });
    expect(alerts[0].history.length).toBeGreaterThan(alert.history.length);
  });

  it("filters incidents by id, camera and status", async () => {
    const [incident] = await actor.listIncidents(EMPTY_FILTER);
    const [camera] = await actor.listCameras();

    const byId = await actor.listIncidents({
      ...EMPTY_FILTER,
      searchId: [incident.id.toString()],
    });
    expect(byId.map((i) => i.id)).toContain(incident.id);

    const byCamera = await actor.listIncidents({
      ...EMPTY_FILTER,
      cameraId: [camera.id],
    });
    expect(byCamera).toHaveLength(1);

    const byStatus = await actor.listIncidents({
      ...EMPTY_FILTER,
      status: [{ potential: null }],
    });
    expect(byStatus).toHaveLength(1);

    const noMatch = await actor.listIncidents({
      ...EMPTY_FILTER,
      searchId: ["999999"],
    });
    expect(noMatch).toEqual([]);
  });

  it("updates incident status and derives the lifecycle status", async () => {
    const [incident] = await actor.listIncidents(EMPTY_FILTER);
    const result = await actor.updateIncidentStatus(
      incident.id,
      { verified: null },
      { unresolved: null },
    );
    expect(result).toEqual({ ok: null });

    const updated = await actor.getIncident(incident.id);
    expect(updated).toHaveLength(1);
    expect(updated[0]).toMatchObject({
      verificationStatus: { verified: null },
      status: { verified: null },
    });
  });

  it("computes dashboard stats and analytics from stored data", async () => {
    const stats = await actor.getDashboardStats();
    expect(stats.totalCameras).toBe(1n);
    expect(stats.vehiclesDetected).toBe(1n);
    // Earlier tests may have moved the incident out of `potential`, so derive
    // the expected count from the current incident list instead of hardcoding.
    const incidents = await actor.listIncidents(EMPTY_FILTER);
    const potential = incidents.filter(
      (i) => i.status.potential !== undefined,
    ).length;
    expect(stats.potentialAccidents).toBe(BigInt(potential));

    const analytics = await actor.getAnalytics();
    expect(analytics.dailyDetections.length).toBeGreaterThan(0);
    expect(analytics.detectionStats.length).toBeGreaterThan(0);
    expect(analytics.cameraActivity).toHaveLength(1);
  });

  it("loads sample demonstration data", async () => {
    const result = await actor.loadSampleData();
    expect(result).toEqual({ ok: null });

    const cameras = await actor.listCameras();
    expect(cameras.length).toBeGreaterThanOrEqual(4);
    const stats = await actor.getDashboardStats();
    expect(stats.totalCameras).toBeGreaterThanOrEqual(4n);
  });

  it("accepts an anonymous caller on a mutation and shares the data", async () => {
    // The app has no sign-in control, so every endpoint is callable by any
    // caller, including anonymous visitors. A guest write must succeed and be
    // visible to the operator, because the control room shares one dataset.
    const guest = pic!.createActor<_SERVICE>(idlFactory, canisterId);
    const before = (await actor.listCameras()).length;

    await expect(
      guest.createCamera(
        "Guest Camera",
        "Road",
        "Area",
        1,
        1,
        "rtsp://x/y",
        { rtspStream: null },
        [],
      ),
    ).resolves.toEqual({ ok: null });

    const cameras = await actor.listCameras();
    expect(cameras).toHaveLength(before + 1);
    expect(cameras.some((c) => c.name === "Guest Camera")).toBe(true);
  });
});
