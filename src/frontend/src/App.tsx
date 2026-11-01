import { Layout } from "@/components/Layout";
import AccidentDetectionPage from "@/pages/AccidentDetectionPage";
import AnalyticsPage from "@/pages/AnalyticsPage";
import CameraManagementPage from "@/pages/CameraManagementPage";
import DashboardPage from "@/pages/DashboardPage";
import EmergencyAlertsPage from "@/pages/EmergencyAlertsPage";
import IncidentHistoryPage from "@/pages/IncidentHistoryPage";
import LiveMonitoringPage from "@/pages/LiveMonitoringPage";
import LocationManagementPage from "@/pages/LocationManagementPage";
import SettingsPage from "@/pages/SettingsPage";
import VehicleDetectionPage from "@/pages/VehicleDetectionPage";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";

const rootRoute = createRootRoute({
  component: () => (
    <Layout>
      <Outlet />
    </Layout>
  ),
});

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: DashboardPage,
});

const liveRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/live",
  component: LiveMonitoringPage,
});

const camerasRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/cameras",
  component: CameraManagementPage,
});

const locationsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/locations",
  component: LocationManagementPage,
});

const vehiclesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/vehicles",
  component: VehicleDetectionPage,
});

const accidentsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/accidents",
  component: AccidentDetectionPage,
});

const alertsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/alerts",
  component: EmergencyAlertsPage,
});

const incidentsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/incidents",
  component: IncidentHistoryPage,
});

const analyticsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/analytics",
  component: AnalyticsPage,
});

const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/settings",
  component: SettingsPage,
});

const routeTree = rootRoute.addChildren([
  dashboardRoute,
  liveRoute,
  camerasRoute,
  locationsRoute,
  vehiclesRoute,
  accidentsRoute,
  alertsRoute,
  incidentsRoute,
  analyticsRoute,
  settingsRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
