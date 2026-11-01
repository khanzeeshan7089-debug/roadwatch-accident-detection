import { renderWithActor } from "@/__tests__/test-utils";
import {
  type Camera,
  ConnectionStatus,
  type Incident,
  type IncidentFilter,
  IncidentStatus,
  MonitoringState,
  ResolutionStatus,
  VerificationStatus,
  VideoSourceKind,
} from "@/backend";
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeAll, describe, expect, it, vi } from "vitest";

import IncidentHistoryPage from "@/pages/IncidentHistoryPage";
import LocationManagementPage from "@/pages/LocationManagementPage";

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
  listIncidents: ReturnType<typeof vi.fn>;
};

function makeActor(overrides: Partial<Actor> = {}): Actor {
  return {
    listCameras: vi.fn(async () => []),
    listIncidents: vi.fn(async () => []),
    ...overrides,
  };
}

/* --------------------------- Test environment --------------------------- */

beforeAll(() => {
  class ResizeObserverStub {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  (globalThis as { ResizeObserver?: unknown }).ResizeObserver =
    ResizeObserverStub;
});

/* --------------------------- Location management ------------------------ */

describe("LocationManagementPage", () => {
  it("lists every camera with code, road, area and coordinates", async () => {
    const actor = makeActor({
      listCameras: vi.fn(async () => [
        makeCamera(),
        makeCamera({
          id: 2n,
          code: "CAM-002",
          name: "South Bridge",
          roadName: "Outer Ring",
          area: "South Zone",
          latitude: 12.9716,
          longitude: 77.5946,
        }),
      ]),
    });
    renderWithActor(<LocationManagementPage />, actor);

    const table = await screen.findByTestId("locations.table");
    const rows = within(table).getAllByTestId("locations.row");
    expect(rows).toHaveLength(2);

    expect(rows[0]).toHaveTextContent("CAM-001");
    expect(rows[0]).toHaveTextContent("Ring Road");
    expect(rows[0]).toHaveTextContent("Central District");
    expect(rows[0]).toHaveTextContent("28.61390");
    expect(rows[0]).toHaveTextContent("77.20900");

    expect(rows[1]).toHaveTextContent("CAM-002");
    expect(rows[1]).toHaveTextContent("Outer Ring");
    expect(rows[1]).toHaveTextContent("South Zone");
    expect(rows[1]).toHaveTextContent("12.97160");
    expect(rows[1]).toHaveTextContent("77.59460");
  });

  it("shows the empty state when no cameras are registered", async () => {
    const actor = makeActor({ listCameras: vi.fn(async () => []) });
    renderWithActor(<LocationManagementPage />, actor);

    expect(await screen.findByTestId("page.empty_state")).toBeInTheDocument();
    expect(screen.queryByTestId("locations.table")).not.toBeInTheDocument();
  });
});

/* ------------------- Incident camera filter (BigInt key) ---------------- */

describe("IncidentHistoryPage camera filter", () => {
  it("selects a camera and queries the backend without a BigInt key error", async () => {
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
    // The page still renders its table rather than crashing on the query key.
    expect(await screen.findByTestId("incidents.table")).toBeInTheDocument();
  });

  it("filters by a date range and passes nanosecond bounds", async () => {
    const user = userEvent.setup();
    const listIncidents = vi.fn(async (_filter: IncidentFilter) => [
      makeIncident(),
    ]);
    const actor = makeActor({ listIncidents });

    renderWithActor(<IncidentHistoryPage />, actor);

    await user.type(
      await screen.findByTestId("incidents.from_date_input"),
      "2026-01-01",
    );

    await waitFor(() =>
      expect(listIncidents).toHaveBeenCalledWith(
        expect.objectContaining({ fromTime: expect.any(BigInt) }),
      ),
    );
  });
});
