# Project Guidance

## User Preferences

- Dark navy and black control-room theme with electric blue and cyan accents, red accident-warning indicators and green camera-online indicators
- Professional typography, modern cards, responsive layouts, and smooth animations and transitions
- Lucide React icons and Recharts for analytics
- Sidebar navigation across the nine application pages
- Clearly distinguish fully implemented, model-dependent, simulated, and future-integration features; never invent AI accuracy or successful test results

## Accepted Requirements

- Premium dark control-room dashboard with six statistics cards, traffic overview, recent incident activity, camera connection status, and analytics charts
- Emergency alert dashboard with police and hospital notification status, alert history, and mark as verified / false alarm / resolved
- Incident management page with search by incident ID and filters by date, camera and status, plus incident details and event snapshot
- Recharts analytics for daily vehicle detections, weekly accident alerts, camera activity, incident distribution and detection statistics
- Location management table showing camera ID, road name, area, latitude and longitude
- Persistent storage for cameras, incidents, alerts, detection logs and users with full CRUD
- Nine application pages with professional sidebar navigation, form validation, loading indicators, empty states, error handling and sample demonstration data
- Upload MP4 and AVI traffic videos for a camera
- Display the actual uploaded video in the monitoring panel
- Video playback controls
- Display vehicle bounding boxes and detection results
- Update frame counters and vehicle statistics dynamically
- Potential accident detection using temporal video analysis
- Incident records containing camera ID, location and timestamp
- Emergency alerts displayed in the existing dashboard
- Do not display fake live CCTV footage
- Clearly distinguish simulated functionality from implemented AI detection
- Do not show a camera as monitoring when its stream is disconnected
- Preserve the current ROADWATCH design
- Explain backend or hosting limitations that prevent real-time video processing
- Implement and test features supported by the platform rather than creating non-functional UI controls

## Verified Commands

- **typecheck**: `pnpm typecheck`
- **fix**: `mops check --fix`
- **build**: `mops build`

## Learnings

- Backend commands from src/backend/ are mops check --fix and mops build; bindings are generated from the repository root with pnpm bindgen.
- Frontend commands from src/frontend/ are pnpm typecheck and pnpm fix; the root test suite runs with pnpm --dir app test.
- The backend's write operations are callable without a sign-in step; the authorization package stays installed as infrastructure only, and no endpoint consults it.
- The camera's uploaded file reference is an external blob stored through platform file storage, and the generated createCamera binding takes eight arguments with the backend assigning the camera code.
- React Query key hashing uses JSON.stringify, which throws on bigint; a filter object with toJSON serializes safely.
- A Location Management page, route and sidebar entry exist alongside the other control-room pages.
- The Live CCTV Monitoring panel plays a camera's uploaded clip through an HTML5 video element using ExternalBlob.getDirectURL(); the sample source uses the bundled clip at src/frontend/public/assets/videos/sample-traffic-clip.mp4.
- RTSP startability is gated in three places: hasConfiguredSource, MonitoringControls.canStart, and handleStart's guard; all three must agree.
- A referenced public asset must be confirmed with a glob under src/frontend/public, not inferred from the URL constant.
- A migration's NewActor field must also be declared as a stable actor field in main.mo, or M0151/M0169 fire; applied migrations are frozen read-only, so new stored-field changes go in the draft's pending migration file.
- The live page's start/stop must call startMonitoring/stopMonitoring; the session variants are a different backend pair.
- Rendering a TanStack Link in an always-mounted panel breaks tests that render the page without a router; use a plain anchor there.
