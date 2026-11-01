import { setActorForTest } from "@/__tests__/setup";
import {
  type Analytics,
  type Camera,
  ConnectionStatus,
  type DashboardStats,
  MonitoringState,
  type Settings,
  VideoSourceKind,
} from "@/backend";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeAll, describe, expect, it, vi } from "vitest";

import App from "@/App";

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

const STATS: DashboardStats = {
  totalCameras: 4n,
  activeCameras: 2n,
  vehiclesDetected: 128n,
  potentialAccidents: 3n,
  pendingAlerts: 2n,
  resolvedIncidents: 7n,
};

const ANALYTICS: Analytics = {
  dailyDetections: [{ date: "2026-01-01", count: 12n }],
  weeklyAlerts: [{ week: "1", count: 3n }],
  cameraActivity: [
    { cameraId: 1n, cameraCode: "CAM-001", detections: 20n, incidents: 2n },
  ],
  incidentDistribution: [{ status: "potential", count: 3n }],
  detectionStats: [{ vehicleClass: "car", count: 10n }],
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
};

function makeActor(overrides: Partial<Actor> = {}): Actor {
  return {
    listCameras: vi.fn(async () => [makeCamera()]),
    listDetections: vi.fn(async () => []),
    listIncidents: vi.fn(async () => []),
    listAlerts: vi.fn(async () => []),
    getDashboardStats: vi.fn(async () => STATS),
    getAnalytics: vi.fn(async () => ANALYTICS),
    getSettings: vi.fn(async () => SETTINGS),
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

function renderApp(actor: Actor) {
  setActorForTest(actor);
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>,
  );
}

/* ------------------------------ App shell ------------------------------- */

describe("App shell navigation", () => {
  it("renders the dashboard on the default route instead of a blank screen", async () => {
    renderApp(makeActor());

    // The shell chrome and the default page both render.
    expect(await screen.findByTestId("nav.sidebar")).toBeInTheDocument();
    expect(await screen.findByTestId("dashboard.page")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Dashboard" }),
    ).toBeInTheDocument();
  });

  it("highlights the active page in the sidebar", async () => {
    renderApp(makeActor());

    const sidebar = await screen.findByTestId("nav.sidebar");
    const dashboardLink = within(sidebar).getByTestId("nav.link.dashboard");
    expect(dashboardLink).toHaveAttribute("aria-current", "page");

    // A non-active link carries no current-page marker.
    expect(
      within(sidebar).getByTestId("nav.link.analytics"),
    ).not.toHaveAttribute("aria-current");
  });

  it("reaches every page through the sidebar navigation", async () => {
    const user = userEvent.setup();
    renderApp(makeActor());

    const sidebar = await screen.findByTestId("nav.sidebar");
    const destinations: Array<{ link: string; page: string }> = [
      { link: "nav.link.live_cctv_monitoring", page: "live.page" },
      { link: "nav.link.camera_management", page: "cameras.page" },
      { link: "nav.link.location_management", page: "locations.page" },
      { link: "nav.link.vehicle_detection", page: "vehicles.page" },
      { link: "nav.link.accident_detection", page: "accidents.page" },
      { link: "nav.link.emergency_alerts", page: "alerts.page" },
      { link: "nav.link.incident_history", page: "incidents.page" },
      { link: "nav.link.analytics", page: "analytics.page" },
      { link: "nav.link.settings", page: "settings.page" },
    ];

    for (const { link, page } of destinations) {
      await user.click(within(sidebar).getByTestId(link));
      expect(await screen.findByTestId(page)).toBeInTheDocument();
      // The clicked link becomes the active page.
      await waitFor(() =>
        expect(within(sidebar).getByTestId(link)).toHaveAttribute(
          "aria-current",
          "page",
        ),
      );
    }
  });
});
