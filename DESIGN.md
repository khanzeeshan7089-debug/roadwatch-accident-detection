# Design Brief

## Direction

Mission Control — ROADWATCH as a real city traffic-surveillance console: dark navy-black panels, electric-blue and cyan telemetry, red accident warnings, green camera links.

## Tone

Industrial/utilitarian control-room executed with conviction — dense, instrumented, and calm until a warning fires; every surface reads as operational hardware, never a marketing page.

## Differentiation

A mono-font telemetry layer (IDs, timestamps, frame counts, confidence scores) over Space Grotesk headings makes the whole app feel like live surveillance equipment rather than a generic dashboard.

## Color Palette

| Token      | OKLCH       | Role                              |
| ---------- | ----------- | --------------------------------- |
| background | 0.14 0.018 258 | Deep navy-black control-room base |
| foreground | 0.95 0.008 240 | Primary text                     |
| card       | 0.185 0.022 258 | Panel surface                   |
| primary    | 0.62 0.2 255   | Electric-blue actions / brand     |
| accent     | 0.78 0.15 195  | Cyan highlights / active states   |
| muted      | 0.24 0.026 258 | Inactive surfaces / secondary text |
| destructive| 0.58 0.22 25   | Red accident-warning indicators   |
| success    | 0.72 0.17 150  | Green camera-online indicators    |
| warning    | 0.78 0.15 80   | Amber simulated-mode badges       |

## Typography

- Display: Space Grotesk — headings, stat values, brand wordmark, section titles
- Body: DM Sans — labels, paragraphs, form fields, table cells
- Mono: JetBrains Mono — camera IDs, timestamps, coordinates, frame/confidence telemetry
- Scale: hero `text-3xl md:text-4xl font-bold tracking-tight`, h2 `text-xl md:text-2xl font-semibold`, label `text-xs font-semibold tracking-widest uppercase`, body `text-sm md:text-base`

## Elevation & Depth

Panels sit on the navy base with `border border-border` plus `shadow-elevated`; a 1px inset `shadow-panel` top highlight and a faint 32px grid texture give surfaces a machined, instrumented feel.

## Structural Zones

| Zone    | Background             | Border                       | Notes                                        |
| ------- | ---------------------- | ---------------------------- | -------------------------------------------- |
| Sidebar | `bg-sidebar`           | `border-r border-sidebar-border` | 9 nav items, active = cyan left-bar + tinted bg |
| Header  | `bg-card/80 backdrop-blur` | `border-b border-border` | Brand, live clock, persistent simulation badge |
| Content | `bg-background`        | —                            | `bg-grid` texture; cards on `bg-card`        |
| Footer  | `bg-muted/30`          | `border-t border-border`     | Status bar: last sync, simulated-mode notice |

## Spacing & Rhythm

Page padding `p-4 md:p-6 lg:p-8`; card grids `gap-4 md:gap-6`; stat cards compact interior `p-4`; section gaps `space-y-6`; table rows `py-3`.

## Component Patterns

- Buttons: `rounded-md`, primary = electric-blue fill, hover brightens + `shadow-elevated`; destructive = red fill for stop/delete; ghost = muted hover
- Cards: `rounded-lg bg-card border border-border shadow-elevated`, no glow; stat cards add a colored left accent strip per metric
- Badges: pill `rounded-full text-xs font-medium`; online = green, offline = muted, accident = red, simulated = amber with mono label

## Motion

- Entrance: `animate-fade-in` staggered 0.4s on cards/sections; `animate-slide-in-right` for alert feed rows
- Hover: `transition-smooth` on buttons/cards/rows — border brightens to primary, subtle lift via `shadow-elevated`
- Decorative: `status-pulse` on live dots, `pulse-ring` on accident markers, `animate-scan-line` over video frames

## Constraints

- Dark mode only — the control-room theme is the product, not a toggle
- Never use raw hex/rgb or arbitrary color classes; semantic tokens only
- Red is reserved for accident/warning; green only for online/success; amber only for simulated
- Simulation-mode and model-unavailable states must stay visually distinct and never imply real detection

## Signature Detail

Every data value — camera ID, timestamp, coordinate, frame count, confidence — renders in JetBrains Mono with tabular numerals, so the console reads as live instrumentation.
