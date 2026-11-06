The workspace users see. It's where users start a Project, review its Plan, and ask questions once it's created.

## Data flow

```mermaid
flowchart LR
  U["Browser"] -->|"HTTPS"| LB["Load balancer, Cloud Armor"]
  LB --> NX["Agora: Next.js on Cloud Run"]
  LB -->|"basemap tiles"| CDN["Cloud CDN"]
  NX -->|"sign-in"| IP["Identity Platform"]
  NX -->|"token"| AC["Accounts API"]
  NX -->|"SSE"| PA["Plan agents"]
  NX -->|"SSE"| RA["Research agents"]
  NX -->|"signed upload URLs"| OR["Orion control API"]
```

## Software components

- **Next.js (React, TypeScript)**, App Router, on **Cloud Run**.
- **shadcn/ui** and **Tailwind CSS** for UI, **TanStack Query** for data.
- **Firebase Auth JS SDK**, **Vercel AI SDK** for streaming chat.
- **MapLibre GL JS** and **deck.gl** for the map, **React Flow** for graphs, **Vega-Lite** for charts.
- External HTTPS load balancer, **Cloud Armor**, **Cloud CDN**.

## Configuration and metadata

- The Next.js server is a thin backend-for-frontend: it adds the user's token and forwards to Merlin. It stores nothing.
- Content Security Policy locks scripts to Agora's own origin.
- Feature flags per company (for example, map 3D view) read from the Accounts API.

## UI components

- **App shell:** top bar with Project switcher and account menu, left nav: Chat, Plan, Report, Map.
- Each window is its own box in this diagram.

## Low-level design

```mermaid
classDiagram
  class AppShell {
    <<component>>
  }
  class ProjectProvider {
    <<context>>
    +project
    +role
  }
  class AuthProvider {
    <<context>>
  }
  class MerlinApi {
    +plan
    +chat
    +reports
    +layers
  }
  class ChatPanel {
    <<component>>
  }
  class PlanDocument {
    <<component>>
  }
  class ReportView {
    <<component>>
  }
  class LayeredMap {
    <<component>>
  }
  AppShell --> AuthProvider
  AppShell --> ProjectProvider
  AppShell --> ChatPanel
  AppShell --> PlanDocument
  AppShell --> ReportView
  AppShell --> LayeredMap
  ChatPanel ..> MerlinApi
  PlanDocument ..> MerlinApi
  ReportView ..> MerlinApi
  LayeredMap ..> MerlinApi
```
