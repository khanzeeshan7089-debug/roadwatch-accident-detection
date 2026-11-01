import { setActorForTest } from "@/__tests__/setup";
import { renderWithActor } from "@/__tests__/test-utils";
import {
  AlertStatus,
  type Camera,
  ConnectionStatus,
  type DetectionLog,
  type Incident,
  IncidentStatus,
  MonitoringState,
  NotificationStatus,
  ResolutionStatus,
  VehicleClass,
  VerificationStatus,
  VideoSourceKind,
} from "@/backend";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { act, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactElement } from "react";
import { beforeAll, describe, expect, it, vi } from "vitest";

import AccidentDetectionPage from "@/pages/AccidentDetectionPage";
import EmergencyAlertsPage from "@/pages/EmergencyAlertsPage";
import LiveMonitoringPage from "@/pages/LiveMonitoringPage";

/* ------------------------------- Fixtures ------------------------------- */

const NOW = 1_700_000_000_000_000_000n;

function makeCamera(overrides: Partial<Camera> = {}): Camera {
  return {
    id: 1n,
    code: "CAM-001",
    name: "North Gate Junction",
    roadName: "Ring Road",
    area: "Central District",
    latitude: 28.6139,
    longitude: 77.209,
    rtspUrl: "rtsp://camera.example.com:554/stream1",
    sourceKind: VideoSourceKind.rtspStream,
    connectionStatus: ConnectionStatus.online,
    monitoringState: MonitoringState.stopped,
    createdAt: NOW,
    ...overrides,
  };
}

function makeDetection(overrides: Partial<DetectionLog> = {}): DetectionLog {
  return {
    id: 1n,
    cameraId: 1n,
    vehicleClass: VehicleClass.car,
    confidence: 0.87,
    box: { x: 0.1, y: 0.5, width: 0.2, height: 0.2 },
    simulated: true,
    detectedAt: NOW,
    ...overrides,
  };
}

function makeIncident(overrides: Partial<Incident> = {}): Incident {
  return {
    id: 12n,
    cameraId: 1n,
    cameraCode: "CAM-001",
    roadName: "Ring Road",
    area: "Central District",
    latitude: 28.6139,
    longitude: 77.209,
    detectedAt: NOW,
    status: IncidentStatus.potential,
    detectionSource: "simulated" as Incident["detectionSource"],
    confidence: 0.9,
    verificationStatus: VerificationStatus.unverified,
    resolutionStatus: ResolutionStatus.unresolved,
    summary: "Two vehicles collided",
    ...overrides,
  };
}

/* --------------------------- Typed actor seam --------------------------- */

type Actor = {
  listCameras: ReturnType<typeof vi.fn>;
  listDetections: ReturnType<typeof vi.fn>;
  listIncidents: ReturnType<typeof vi.fn>;
  listAlerts: ReturnType<typeof vi.fn>;
  startMonitoring: ReturnType<typeof vi.fn>;
  stopMonitoring: ReturnType<typeof vi.fn>;
  getMonitoringSession: ReturnType<typeof vi.fn>;
  reportFrameCount: ReturnType<typeof vi.fn>;
  generateAccidentEvent: ReturnType<typeof vi.fn>;
  getSettings: ReturnType<typeof vi.fn>;
};

function makeActor(overrides: Partial<Actor> = {}): Actor {
  return {
    listCameras: vi.fn(async () => []),
    listDetections: vi.fn(async () => []),
    listIncidents: vi.fn(async () => []),
    listAlerts: vi.fn(async () => []),
    startMonitoring: vi.fn(async () => ({ __kind__: "ok" as const, ok: null })),
    stopMonitoring: vi.fn(async () => ({ __kind__: "ok" as const, ok: null })),
    getMonitoringSession: vi.fn(async () => null),
    reportFrameCount: vi.fn(async () => ({
      __kind__: "ok" as const,
      ok: null,
    })),
    generateAccidentEvent: vi.fn(async () => ({
      __kind__: "ok" as const,
      ok: null,
    })),
    getSettings: vi.fn(async () => ({
      confidenceThreshold: 0.5,
      sensitivity: 0.5,
      simulationMode: true,
    })),
    ...overrides,
  };
}

/** A camera whose source is a stored MP4/AVI clip, playable in the browser. */
function makeUploadedCamera(overrides: Partial<Camera> = {}): Camera {
  return makeCamera({
    sourceKind: VideoSourceKind.uploadedFile,
    rtspUrl: "",
    uploadedFileRef: {
      getDirectURL: () => "https://blob.example.com/clip.mp4",
    } as unknown as Camera["uploadedFileRef"],
    ...overrides,
  });
}

/* --------------------------- Test environment --------------------------- */

beforeAll(() => {
  // Radix `use-size` (used by the accident page's Select) observes its box.
  class ResizeObserverStub {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  (globalThis as { ResizeObserver?: unknown }).ResizeObserver =
    ResizeObserverStub;

  // jsdom does not implement media playback; the page calls play() on start.
  HTMLMediaElement.prototype.play = vi.fn(async () => {});
  HTMLMediaElement.prototype.pause = vi.fn();
});

/**
 * The live page renders router `Link`s, so it needs a router context. This
 * mounts the page as the root route's component with a memory history.
 */
function renderWithRouter(ui: ReactElement, actor: Actor) {
  const rootRoute = createRootRoute({ component: () => ui });
  const indexRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/",
    component: () => ui,
  });
  const router = createRouter({
    routeTree: rootRoute.addChildren([indexRoute]),
    history: createMemoryHistory({ initialEntries: ["/"] }),
  });
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  });
  setActorForTest(actor);
  return render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  );
}

/* --------------------------- Live monitoring ---------------------------- */

describe("LiveMonitoringPage", () => {
  it("shows the empty state with a link to camera management when no cameras exist", async () => {
    const actor = makeActor({ listCameras: vi.fn(async () => []) });
    renderWithRouter(<LiveMonitoringPage />, actor);

    expect(await screen.findByTestId("page.empty_state")).toBeInTheDocument();
    expect(
      screen.getByTestId("live.empty_manage_cameras_link"),
    ).toBeInTheDocument();
    expect(screen.queryByTestId("live.camera_panel")).not.toBeInTheDocument();
  });

  it("selects the first camera by default and lists every camera", async () => {
    const actor = makeActor({
      listCameras: vi.fn(async () => [
        makeCamera(),
        makeCamera({ id: 2n, code: "CAM-002", name: "South Bridge" }),
      ]),
    });
    renderWithActor(<LiveMonitoringPage />, actor);

    const list = await screen.findByTestId("live.camera_list");
    const items = within(list).getAllByRole("button");
    expect(items).toHaveLength(2);
    expect(items[0]).toHaveAttribute("aria-pressed", "true");
    expect(items[1]).toHaveAttribute("aria-pressed", "false");

    // The default selection drives the detail panel.
    expect(await screen.findByTestId("live.video_panel")).toHaveTextContent(
      "CAM-001",
    );
  });

  it("switches the detail panel when another camera is selected", async () => {
    const user = userEvent.setup();
    const actor = makeActor({
      listCameras: vi.fn(async () => [
        makeCamera(),
        makeCamera({
          id: 2n,
          code: "CAM-002",
          name: "South Bridge",
          roadName: "Outer Ring",
          area: "South Zone",
        }),
      ]),
    });
    renderWithActor(<LiveMonitoringPage />, actor);

    const list = await screen.findByTestId("live.camera_list");
    await user.click(within(list).getAllByRole("button")[1]);

    await waitFor(() =>
      expect(screen.getByTestId("live.video_panel")).toHaveTextContent(
        "CAM-002",
      ),
    );
    expect(screen.getByTestId("live.video_panel")).toHaveTextContent(
      "South Bridge",
    );
  });

  it("starts monitoring through the backend and reflects the monitoring state", async () => {
    const user = userEvent.setup();
    const stopped = makeUploadedCamera({
      monitoringState: MonitoringState.stopped,
    });
    const monitoring = makeUploadedCamera({
      monitoringState: MonitoringState.monitoring,
    });
    const listCameras = vi
      .fn()
      .mockResolvedValueOnce([stopped])
      .mockResolvedValue([monitoring]);
    const startMonitoring = vi.fn(async () => ({
      __kind__: "ok" as const,
      ok: null,
    }));
    const actor = makeActor({ listCameras, startMonitoring });

    renderWithActor(<LiveMonitoringPage />, actor);

    const startButton = await screen.findByTestId("live.start_button");
    expect(startButton).toBeEnabled();
    await user.click(startButton);

    await waitFor(() => expect(startMonitoring).toHaveBeenCalledWith(1n));
    await waitFor(() =>
      expect(screen.getByTestId("live.processing_state")).toHaveTextContent(
        "Monitoring",
      ),
    );
  });

  it("stops monitoring through the backend when a session is running", async () => {
    const user = userEvent.setup();
    const monitoring = makeCamera({
      monitoringState: MonitoringState.monitoring,
    });
    const stopped = makeCamera({ monitoringState: MonitoringState.stopped });
    const listCameras = vi
      .fn()
      .mockResolvedValueOnce([monitoring])
      .mockResolvedValue([stopped]);
    const stopMonitoring = vi.fn(async () => ({
      __kind__: "ok" as const,
      ok: null,
    }));
    const actor = makeActor({ listCameras, stopMonitoring });

    renderWithActor(<LiveMonitoringPage />, actor);

    const stopButton = await screen.findByTestId("live.stop_button");
    expect(stopButton).toBeEnabled();
    await user.click(stopButton);

    await waitFor(() => expect(stopMonitoring).toHaveBeenCalledWith(1n));
    await waitFor(() =>
      expect(screen.getByTestId("live.processing_state")).toHaveTextContent(
        "Stopped",
      ),
    );
  });

  it("shows the no-source state and disables start when a camera has no source", async () => {
    const actor = makeActor({
      listCameras: vi.fn(async () => [
        makeCamera({
          sourceKind: VideoSourceKind.uploadedFile,
          uploadedFileRef: undefined,
        }),
      ]),
    });
    renderWithRouter(<LiveMonitoringPage />, actor);

    expect(
      await screen.findByTestId("live.no_source_state"),
    ).toBeInTheDocument();
    expect(screen.getByTestId("live.start_button")).toBeDisabled();
  });

  it("reports the stored detection count in the status strip", async () => {
    const actor = makeActor({
      listCameras: vi.fn(async () => [makeCamera()]),
      listDetections: vi.fn(async () => [
        makeDetection({ id: 1n }),
        makeDetection({ id: 2n, vehicleClass: VehicleClass.truck }),
        makeDetection({ id: 3n, vehicleClass: VehicleClass.bus }),
      ]),
    });
    renderWithActor(<LiveMonitoringPage />, actor);

    const strip = await screen.findByTestId("live.status_strip");
    expect(strip).toHaveTextContent("Vehicles detected");
    await waitFor(() => expect(strip).toHaveTextContent("3"));
  });

  it("renders the uploaded clip in a video element with playback controls", async () => {
    const actor = makeActor({
      listCameras: vi.fn(async () => [makeUploadedCamera()]),
    });
    renderWithActor(<LiveMonitoringPage />, actor);

    const video = await screen.findByTestId("live.video_element");
    expect(video.tagName).toBe("VIDEO");
    expect(video).toHaveAttribute("src", "https://blob.example.com/clip.mp4");
    // Native controls provide play/pause, seek, volume and fullscreen.
    expect(video).toHaveAttribute("controls");
    expect(
      screen.queryByTestId("live.no_source_state"),
    ).not.toBeInTheDocument();
  });

  it("shows the unsupported state and disables start for an RTSP source", async () => {
    const actor = makeActor({
      listCameras: vi.fn(async () => [
        makeCamera({ sourceKind: VideoSourceKind.rtspStream }),
      ]),
    });
    renderWithActor(<LiveMonitoringPage />, actor);

    expect(await screen.findByTestId("live.no_source_state")).toHaveTextContent(
      "RTSP stream unsupported here",
    );
    expect(screen.getByTestId("live.start_button")).toBeDisabled();
    expect(screen.getByTestId("live.start_blocked_reason")).toHaveTextContent(
      "RTSP streams cannot be decoded",
    );
    expect(screen.queryByTestId("live.video_element")).not.toBeInTheDocument();
  });

  it("disables start with a stated reason for an offline camera", async () => {
    const actor = makeActor({
      listCameras: vi.fn(async () => [
        makeUploadedCamera({ connectionStatus: ConnectionStatus.offline }),
      ]),
    });
    renderWithActor(<LiveMonitoringPage />, actor);

    const startButton = await screen.findByTestId("live.start_button");
    expect(startButton).toBeDisabled();
    expect(screen.getByTestId("live.start_blocked_reason")).toHaveTextContent(
      "offline",
    );
  });

  it("labels simulated detections and shows the no-trained-model notice", async () => {
    const actor = makeActor({
      listCameras: vi.fn(async () => [makeUploadedCamera()]),
      listDetections: vi.fn(async () => [
        makeDetection({ id: 1n, simulated: true }),
      ]),
    });
    renderWithActor(<LiveMonitoringPage />, actor);

    expect(
      await screen.findByTestId("live.simulation_notice"),
    ).toHaveTextContent("No trained detection model is loaded");
    expect(
      screen.getByTestId("vehicles.box_simulated_badge.1"),
    ).toHaveTextContent("Simulated");
    expect(
      screen.getByTestId("vehicles.log_simulated_badge"),
    ).toHaveTextContent("Simulated");
  });

  it("counts real playback frames and stops counting when paused", async () => {
    vi.useFakeTimers({ toFake: ["Date", "setInterval", "clearInterval"] });
    const reportFrameCount = vi.fn(async () => ({
      __kind__: "ok" as const,
      ok: null,
    }));
    const actor = makeActor({
      listCameras: vi.fn(async () => [
        makeUploadedCamera({ monitoringState: MonitoringState.monitoring }),
      ]),
      reportFrameCount,
    });
    renderWithActor(<LiveMonitoringPage />, actor);

    const video = await screen.findByTestId("live.video_element");
    // jsdom does not decode media; drive the element's observable state.
    Object.defineProperty(video, "paused", {
      configurable: true,
      get: () => false,
    });
    Object.defineProperty(video, "ended", {
      configurable: true,
      get: () => false,
    });
    Object.defineProperty(video, "currentTime", {
      configurable: true,
      get: () => 2,
    });

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000);
    });

    // 2s of playback at the assumed 25fps sample rate.
    expect(screen.getByTestId("live.frames_processed")).toHaveTextContent("50");
    expect(reportFrameCount).toHaveBeenCalledWith(1n, 50n);

    // Pausing freezes the counter: no further reports are pushed.
    Object.defineProperty(video, "paused", {
      configurable: true,
      get: () => true,
    });
    reportFrameCount.mockClear();
    await act(async () => {
      await vi.advanceTimersByTimeAsync(2000);
    });
    expect(reportFrameCount).not.toHaveBeenCalled();
    expect(screen.getByTestId("live.frames_processed")).toHaveTextContent("50");
  });
});

/* --------------------------- Accident detection ------------------------- */

describe("AccidentDetectionPage", () => {
  it("renders the analysis pipeline stages and the simulation-mode card", async () => {
    const actor = makeActor();
    renderWithActor(<AccidentDetectionPage />, actor);

    expect(
      await screen.findByTestId("accidents.pipeline_card"),
    ).toBeInTheDocument();
    expect(screen.getAllByTestId(/accidents\.pipeline_stage\./)).toHaveLength(
      4,
    );
    expect(screen.getByTestId("accidents.simulation_card")).toBeInTheDocument();
  });

  it("lists potential accident events with camera, location and simulated label", async () => {
    const actor = makeActor({
      listIncidents: vi.fn(async () => [makeIncident()]),
    });
    renderWithActor(<AccidentDetectionPage />, actor);

    const card = await screen.findByTestId("accidents.event_card.1");
    expect(card).toHaveTextContent("Two vehicles collided");
    expect(card).toHaveTextContent("CAM-001");
    expect(card).toHaveTextContent("Ring Road, Central District");
    expect(card).toHaveTextContent("Potential");
    expect(
      screen.getByTestId("accidents.event_simulated_badge.1"),
    ).toHaveTextContent("Simulated");
  });

  it("shows the empty state when no accident events are stored", async () => {
    const actor = makeActor({ listIncidents: vi.fn(async () => []) });
    renderWithActor(<AccidentDetectionPage />, actor);

    expect(await screen.findByTestId("page.empty_state")).toBeInTheDocument();
    expect(
      screen.queryByTestId("accidents.event_card.1"),
    ).not.toBeInTheDocument();
  });

  it("generates a potential accident event through the backend", async () => {
    const user = userEvent.setup();
    const generateAccidentEvent = vi.fn(async () => ({
      __kind__: "ok" as const,
      ok: null,
    }));
    const actor = makeActor({
      listCameras: vi.fn(async () => [makeCamera()]),
      generateAccidentEvent,
    });
    renderWithActor(<AccidentDetectionPage />, actor);

    const select = await screen.findByTestId(
      "accidents.generate_camera_select",
    );
    await user.click(select);
    await user.click(await screen.findByRole("option", { name: /CAM-001/ }));

    await user.click(screen.getByTestId("accidents.generate_event_button"));

    await waitFor(() =>
      expect(generateAccidentEvent).toHaveBeenCalledWith(
        1n,
        null,
        expect.stringContaining("CAM-001"),
        null,
      ),
    );
    expect(
      await screen.findByTestId("accidents.generate_success_state"),
    ).toHaveTextContent("Potential accident event created");
  });
});

/* --------------------------- Emergency alerts --------------------------- */

describe("EmergencyAlertsPage", () => {
  it("shows a matching alert for a generated accident event", async () => {
    const actor = makeActor({
      listAlerts: vi.fn(async () => [
        {
          id: 5n,
          incidentId: 12n,
          cameraId: 1n,
          location: "Ring Road, Central District",
          status: AlertStatus.active,
          policeStatus: NotificationStatus.pending,
          hospitalStatus: NotificationStatus.pending,
          raisedAt: NOW,
          history: [],
        },
      ]),
    });
    renderWithActor(<EmergencyAlertsPage />, actor);

    const card = await screen.findByTestId("alerts.card.5");
    expect(card).toHaveTextContent("Ring Road, Central District");
    expect(card).toHaveTextContent("#12");
    expect(card).toHaveTextContent("Active");
  });
});
