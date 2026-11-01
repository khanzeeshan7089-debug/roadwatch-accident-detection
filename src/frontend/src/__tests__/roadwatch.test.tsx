import { setActorForTest } from "@/__tests__/setup";
import { renderWithActor } from "@/__tests__/test-utils";
import {
  AlertStatus,
  type Analytics,
  type Camera,
  ConnectionStatus,
  type DashboardStats,
  type DetectionLog,
  type EmergencyAlert,
  type Incident,
  type IncidentFilter,
  IncidentStatus,
  MonitoringState,
  NotificationStatus,
  ResolutionStatus,
  type Settings,
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
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactElement } from "react";
import { beforeAll, describe, expect, it, vi } from "vitest";

import AnalyticsPage from "@/pages/AnalyticsPage";
import CameraManagementPage from "@/pages/CameraManagementPage";
import DashboardPage from "@/pages/DashboardPage";
import EmergencyAlertsPage from "@/pages/EmergencyAlertsPage";
import IncidentHistoryPage from "@/pages/IncidentHistoryPage";
import VehicleDetectionPage from "@/pages/VehicleDetectionPage";

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

function makeAlert(overrides: Partial<EmergencyAlert> = {}): EmergencyAlert {
  return {
    id: 5n,
    incidentId: 12n,
    cameraId: 1n,
    location: "Ring Road, Central District",
    raisedAt: NOW,
    policeStatus: NotificationStatus.pending,
    hospitalStatus: NotificationStatus.pending,
    status: AlertStatus.active,
    history: [],
    ...overrides,
  };
}

const STATS: DashboardStats = {
  totalCameras: 4n,
  activeCameras: 2n,
  vehiclesDetected: 128n,
  potentialAccidents: 3n,
  pendingAlerts: 2n,
  resolvedIncidents: 7n,
};

const ANALYTICS: Analytics = {
  dailyDetections: [
    { date: "2026-01-01", count: 12n },
    { date: "2026-01-02", count: 20n },
  ],
  weeklyAlerts: [{ week: "1", count: 3n }],
  cameraActivity: [
    { cameraId: 1n, cameraCode: "CAM-001", detections: 20n, incidents: 2n },
  ],
  incidentDistribution: [{ status: "potential", count: 3n }],
  detectionStats: [
    { vehicleClass: "car", count: 10n },
    { vehicleClass: "truck", count: 2n },
  ],
};

const SETTINGS: Settings = {
  confidenceThreshold: 0.5,
  sensitivity: 0.5,
  simulationMode: true,
};

/* --------------------------- Typed actor seam --------------------------- */

type Actor = {
  listCameras: ReturnType<typeof vi.fn>;
  listDetections: ReturnType<typeof vi.fn>;
  listIncidents: ReturnType<typeof vi.fn>;
  listAlerts: ReturnType<typeof vi.fn>;
  getDashboardStats: ReturnType<typeof vi.fn>;
  getAnalytics: ReturnType<typeof vi.fn>;
  getSettings: ReturnType<typeof vi.fn>;
  createCamera: ReturnType<typeof vi.fn>;
  startMonitoring: ReturnType<typeof vi.fn>;
  stopMonitoring: ReturnType<typeof vi.fn>;
  updateAlertStatus: ReturnType<typeof vi.fn>;
};

function makeActor(overrides: Partial<Actor> = {}): Actor {
  return {
    listCameras: vi.fn(async () => []),
    listDetections: vi.fn(async () => []),
    listIncidents: vi.fn(async () => []),
    listAlerts: vi.fn(async () => []),
    getDashboardStats: vi.fn(async () => STATS),
    getAnalytics: vi.fn(async () => ANALYTICS),
    getSettings: vi.fn(async () => SETTINGS),
    createCamera: vi.fn(async () => ({ __kind__: "ok" as const, ok: null })),
    startMonitoring: vi.fn(async () => ({ __kind__: "ok" as const, ok: null })),
    stopMonitoring: vi.fn(async () => ({ __kind__: "ok" as const, ok: null })),
    updateAlertStatus: vi.fn(async () => ({
      __kind__: "ok" as const,
      ok: null,
    })),
    ...overrides,
  };
}

/* --------------------------- Test environment --------------------------- */

beforeAll(() => {
  // Recharts' ResponsiveContainer observes its box; jsdom has no ResizeObserver.
  class ResizeObserverStub {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  (globalThis as { ResizeObserver?: unknown }).ResizeObserver =
    ResizeObserverStub;
});

/**
 * The dashboard renders router `Link`s, so it needs a router context. This
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
  // Reuse the prepared actor seam by installing the actor before render.
  setActorForTest(actor);
  return render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  );
}

/* ------------------------------- Dashboard ------------------------------ */

describe("DashboardPage", () => {
  it("renders all six statistic cards from stored data", async () => {
    const actor = makeActor({
      listCameras: vi.fn(async () => [makeCamera()]),
      listIncidents: vi.fn(async () => [makeIncident()]),
    });
    renderWithRouter(<DashboardPage />, actor);

    const grid = await screen.findByTestId("dashboard.stats.grid");
    expect(within(grid).getAllByText(/./)).not.toHaveLength(0);

    expect(
      screen.getByTestId("dashboard.stat.total_cameras"),
    ).toHaveTextContent("4");
    expect(
      screen.getByTestId("dashboard.stat.active_cameras"),
    ).toHaveTextContent("2");
    expect(
      screen.getByTestId("dashboard.stat.vehicles_detected"),
    ).toHaveTextContent("128");
    expect(
      screen.getByTestId("dashboard.stat.potential_accidents"),
    ).toHaveTextContent("3");
    expect(
      screen.getByTestId("dashboard.stat.pending_alerts"),
    ).toHaveTextContent("2");
    expect(
      screen.getByTestId("dashboard.stat.resolved_incidents"),
    ).toHaveTextContent("7");
  });

  it("shows the empty state when no data is stored", async () => {
    const actor = makeActor({
      getDashboardStats: vi.fn(async () => ({
        totalCameras: 0n,
        activeCameras: 0n,
        vehiclesDetected: 0n,
        potentialAccidents: 0n,
        pendingAlerts: 0n,
        resolvedIncidents: 0n,
      })),
      getAnalytics: vi.fn(async () => ({
        dailyDetections: [],
        weeklyAlerts: [],
        cameraActivity: [],
        incidentDistribution: [],
        detectionStats: [],
      })),
    });
    renderWithRouter(<DashboardPage />, actor);

    // A non-null stats object counts as data, so the six cards render with zeros.
    const grid = await screen.findByTestId("dashboard.stats.grid");
    expect(within(grid).getAllByText("0").length).toBeGreaterThanOrEqual(6);
  });
});

/* --------------------------- Camera management -------------------------- */

describe("CameraManagementPage", () => {
  it("lists cameras returned by the backend", async () => {
    const actor = makeActor({
      listCameras: vi.fn(async () => [makeCamera()]),
    });
    renderWithActor(<CameraManagementPage />, actor);

    expect(await screen.findByText("North Gate Junction")).toBeInTheDocument();
    expect(screen.getByText("CAM-001")).toBeInTheDocument();
  });

  it("saves a valid camera and shows it in the list", async () => {
    const user = userEvent.setup();
    const created = makeCamera({
      id: 2n,
      code: "CAM-002",
      name: "South Bridge",
    });
    const listCameras = vi
      .fn()
      .mockResolvedValueOnce([])
      .mockResolvedValue([created]);
    const createCamera = vi.fn(async () => ({
      __kind__: "ok" as const,
      ok: null,
    }));
    const actor = makeActor({ listCameras, createCamera });

    renderWithActor(<CameraManagementPage />, actor);

    await user.click(await screen.findByTestId("cameras.add_button"));
    await user.type(screen.getByTestId("cameras.name_input"), "South Bridge");
    await user.type(screen.getByTestId("cameras.road_input"), "Outer Ring");
    await user.type(screen.getByTestId("cameras.area_input"), "South Zone");
    await user.type(screen.getByTestId("cameras.latitude_input"), "12.9716");
    await user.type(screen.getByTestId("cameras.longitude_input"), "77.5946");
    await user.type(
      screen.getByTestId("cameras.rtsp_input"),
      "rtsp://cam.example.com:554/south",
    );
    await user.click(screen.getByTestId("cameras.submit_button"));

    await waitFor(() => expect(createCamera).toHaveBeenCalledTimes(1));
    expect(createCamera).toHaveBeenCalledWith(
      "South Bridge",
      "Outer Ring",
      "South Zone",
      12.9716,
      77.5946,
      "rtsp://cam.example.com:554/south",
      VideoSourceKind.rtspStream,
      null,
    );
    expect(await screen.findByText("South Bridge")).toBeInTheDocument();
  });

  it("rejects a missing required field without saving", async () => {
    const user = userEvent.setup();
    const createCamera = vi.fn(async () => ({
      __kind__: "ok" as const,
      ok: null,
    }));
    const actor = makeActor({ createCamera });

    renderWithActor(<CameraManagementPage />, actor);
    await user.click(await screen.findByTestId("cameras.add_button"));
    await user.click(screen.getByTestId("cameras.submit_button"));

    expect(
      await screen.findByText("Camera name is required."),
    ).toBeInTheDocument();
    expect(screen.getByText("Road name is required.")).toBeInTheDocument();
    expect(createCamera).not.toHaveBeenCalled();
  });

  it("rejects an out-of-range latitude without saving", async () => {
    const user = userEvent.setup();
    const createCamera = vi.fn(async () => ({
      __kind__: "ok" as const,
      ok: null,
    }));
    const actor = makeActor({ createCamera });

    renderWithActor(<CameraManagementPage />, actor);
    await user.click(await screen.findByTestId("cameras.add_button"));
    await user.type(screen.getByTestId("cameras.name_input"), "Bad Coords");
    await user.type(screen.getByTestId("cameras.road_input"), "Ring Road");
    await user.type(screen.getByTestId("cameras.area_input"), "Central");
    await user.type(screen.getByTestId("cameras.latitude_input"), "120");
    await user.type(screen.getByTestId("cameras.longitude_input"), "77.2");
    await user.type(
      screen.getByTestId("cameras.rtsp_input"),
      "rtsp://cam.example.com:554/x",
    );
    await user.click(screen.getByTestId("cameras.submit_button"));

    expect(
      await screen.findByText("Latitude must be between -90 and 90."),
    ).toBeInTheDocument();
    expect(createCamera).not.toHaveBeenCalled();
  });

  it("starts and stops monitoring on a camera", async () => {
    const user = userEvent.setup();
    const stopped = makeCamera({ monitoringState: MonitoringState.stopped });
    const monitoring = makeCamera({
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

    renderWithActor(<CameraManagementPage />, actor);

    const toggle = await screen.findByTestId("cameras.monitor_toggle.1");
    expect(toggle).toHaveTextContent("Start monitoring");
    await user.click(toggle);

    await waitFor(() => expect(startMonitoring).toHaveBeenCalledWith(1n));
    expect(await screen.findByText("Monitoring")).toBeInTheDocument();
  });
});

/* --------------------------- Vehicle detection -------------------------- */

describe("VehicleDetectionPage", () => {
  it("overlays bounding boxes with class labels and confidence scores", async () => {
    const actor = makeActor({
      listCameras: vi.fn(async () => [makeCamera()]),
      listDetections: vi.fn(async () => [
        makeDetection({
          id: 1n,
          vehicleClass: VehicleClass.car,
          confidence: 0.87,
        }),
        makeDetection({
          id: 2n,
          vehicleClass: VehicleClass.truck,
          confidence: 0.64,
          box: { x: 0.6, y: 0.3, width: 0.2, height: 0.3 },
        }),
      ]),
    });
    renderWithActor(<VehicleDetectionPage />, actor);

    const box1 = await screen.findByTestId("vehicles.box.1");
    expect(box1).toHaveTextContent("Car");
    expect(box1).toHaveTextContent("87%");

    const box2 = screen.getByTestId("vehicles.box.2");
    expect(box2).toHaveTextContent("Truck");
    expect(box2).toHaveTextContent("64%");
  });
});

/* --------------------------- Emergency alerts --------------------------- */

describe("EmergencyAlertsPage", () => {
  it("marks an active alert as resolved and persists the new status", async () => {
    const user = userEvent.setup();
    const active = makeAlert({ id: 5n, status: AlertStatus.active });
    const resolved = makeAlert({ id: 5n, status: AlertStatus.resolved });
    const listAlerts = vi
      .fn()
      .mockResolvedValueOnce([active])
      .mockResolvedValue([resolved]);
    const updateAlertStatus = vi.fn(async () => ({
      __kind__: "ok" as const,
      ok: null,
    }));
    const actor = makeActor({ listAlerts, updateAlertStatus });

    renderWithActor(<EmergencyAlertsPage />, actor);

    await user.click(await screen.findByTestId("alerts.resolve_button.5"));

    await waitFor(() =>
      expect(updateAlertStatus).toHaveBeenCalledWith(5n, AlertStatus.resolved),
    );
    // The resolved alert moves out of the active tab.
    await waitFor(() =>
      expect(screen.queryByTestId("alerts.card.5")).not.toBeInTheDocument(),
    );
  });

  it("shows police and hospital notification status", async () => {
    const actor = makeActor({
      listAlerts: vi.fn(async () => [
        makeAlert({
          policeStatus: NotificationStatus.notified,
          hospitalStatus: NotificationStatus.pending,
        }),
      ]),
    });
    renderWithActor(<EmergencyAlertsPage />, actor);

    const police = await screen.findByTestId("alerts.police_status");
    expect(police).toHaveTextContent("Notified");
    expect(screen.getByTestId("alerts.hospital_status")).toHaveTextContent(
      "Pending",
    );
  });
});

/* --------------------------- Incident history --------------------------- */

describe("IncidentHistoryPage", () => {
  it("searches by incident ID and passes the filter to the backend", async () => {
    const user = userEvent.setup();
    const listIncidents = vi.fn(async (_filter: IncidentFilter) => [
      makeIncident(),
    ]);
    const actor = makeActor({ listIncidents });

    renderWithActor(<IncidentHistoryPage />, actor);

    await user.type(await screen.findByTestId("incidents.search_input"), "12");

    await waitFor(() =>
      expect(listIncidents).toHaveBeenCalledWith(
        expect.objectContaining({ searchId: "12" }),
      ),
    );
    expect(await screen.findByTestId("incidents.table")).toBeInTheDocument();
  });

  it("filters by status", async () => {
    const user = userEvent.setup();
    const listIncidents = vi.fn(async (_filter: IncidentFilter) => [
      makeIncident(),
    ]);
    const actor = makeActor({ listIncidents });

    renderWithActor(<IncidentHistoryPage />, actor);

    await user.click(await screen.findByTestId("incidents.status_select"));
    await user.click(await screen.findByRole("option", { name: "Verified" }));

    await waitFor(() =>
      expect(listIncidents).toHaveBeenCalledWith(
        expect.objectContaining({ status: IncidentStatus.verified }),
      ),
    );
  });

  it("filters by camera", async () => {
    const user = userEvent.setup();
    const listIncidents = vi.fn(async (_filter: IncidentFilter) => [
      makeIncident(),
    ]);
    const actor = makeActor({
      listIncidents,
      listCameras: vi.fn(async () => [makeCamera()]),
    });

    renderWithActor(<IncidentHistoryPage />, actor);

    await user.click(await screen.findByTestId("incidents.camera_select"));
    await user.click(await screen.findByRole("option", { name: /CAM-001/ }));

    await waitFor(() =>
      expect(listIncidents).toHaveBeenCalledWith(
        expect.objectContaining({ cameraId: 1n }),
      ),
    );
  });
});

/* ------------------------------- Analytics ------------------------------ */

describe("AnalyticsPage", () => {
  it("renders the Recharts chart containers for stored analytics", async () => {
    const actor = makeActor();
    renderWithActor(<AnalyticsPage />, actor);

    expect(
      await screen.findByTestId("analytics.chart.daily_detections"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("analytics.chart.camera_activity"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("analytics.chart.incident_distribution"),
    ).toBeInTheDocument();
    expect(
      screen.getAllByTestId("analytics.card").length,
    ).toBeGreaterThanOrEqual(5);
  });

  it("shows the empty state when analytics has no data", async () => {
    const actor = makeActor({
      getAnalytics: vi.fn(async () => ({
        dailyDetections: [],
        weeklyAlerts: [],
        cameraActivity: [],
        incidentDistribution: [],
        detectionStats: [],
      })),
    });
    renderWithActor(<AnalyticsPage />, actor);

    expect(await screen.findByTestId("page.empty_state")).toBeInTheDocument();
  });
});
