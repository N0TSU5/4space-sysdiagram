Agora provides the interactive multi-window workspace for NHS planners and analysts: an LLM chat interface with side windows for the map and the deep research output.

## Data flow

```mermaid
flowchart LR
  U["NHS planner"] --> CH["Chat"]
  CH -->|"SSE"| AG["Merlin agents"]
  AG -->|"VerifiedAnswer"| CH
  CH -->|"layers"| MP["Map viewport"]
  CH -->|"brief, tables, audit"| ST["Studio panel"]
  CDN["Cloud CDN"] -->|"basemap PMTiles"| MP
```

## Software components

- **Next.js (React, TypeScript)** on **Cloud Run**, **shadcn/ui** and **Tailwind CSS**.
- **MapLibre GL JS**, **deck.gl**, **pmtiles**.
- HTTPS load balancer with **Cloud CDN** for basemap tiles.

## Configuration and metadata

- MVP access: NHS users sign in with **Identity-Aware Proxy** and Google or Microsoft accounts on an allow-list.
- The app stores nothing; answers and briefs live in Merlin.

> **To confirm:** IAP allow-list sign-in for the MVP, instead of Platform's full Accounts service.

## UI components

- **Layout:** chat on the left, map and studio stacked on the right, resizable.

## Low-level design

```mermaid
classDiagram
  class Workspace {
    <<component>>
  }
  class ChatWindow {
    <<component>>
  }
  class MapViewport {
    <<component>>
  }
  class StudioPanel {
    <<component>>
  }
  class AnswerStore {
    <<context>>
    +current VerifiedAnswer
  }
  Workspace --> ChatWindow
  Workspace --> MapViewport
  Workspace --> StudioPanel
  ChatWindow ..> AnswerStore
  MapViewport ..> AnswerStore
  StudioPanel ..> AnswerStore
```

- `AnswerStore` is how the chat "drives" the side windows: they render whatever answer is current.
