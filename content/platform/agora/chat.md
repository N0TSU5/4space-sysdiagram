A simple chat field, used in three ways: onboarding a Project, editing its Plan, and asking questions once it's ready.

## Steps

- **Onboarding:** the user uploads raw data and describes the business problem.
- **Plan edits:** the user talks back and forth to change the Plan.
- **Questions:** once the Project is ready, the user asks about the decision, and answers stream back.

## Data flow

```mermaid
flowchart LR
  U["User"] --> IN["Message box and file drop"]
  IN -->|"files"| UP["Signed upload URL"] -->|"upload"| RAW[("Orion raw data bucket")]
  IN -->|"message + ID token + Project ID"| API["Accounts API check"]
  API -->|"onboarding or Plan edits"| PE["Plan agents"]
  API -->|"questions"| RA["Research agents"]
  PE & RA -->|"streamed tokens and steps"| SSE["Server-sent events"]
  SSE --> TH["Message thread"]
  TH -->|"links"| PD["Plan document, report, map"]
```

## UI components

- **Message thread:** user and agent messages, streamed as they arrive.
- **Step tracker:** shows the agent's current step, such as "Profiling data".
- **Composer:** text box, send button, and a drop zone for raw data files.
- **Upload progress:** one row per file, with size and status.
- **Suggested prompts:** starter questions for a new Project.
- **Citation chips:** link an answer to its sources in the report.
- **Role-aware state:** Viewers can ask questions but can't edit the Plan.

## Software components

- **Next.js (React, TypeScript)** with **shadcn/ui**.
- **Vercel AI SDK** `useChat` for streaming over server-sent events.
- **react-markdown** for agent messages.
- Uploads go straight to Cloud Storage with **signed URLs** from the Orion control API.

## Low-level design

```mermaid
classDiagram
  class ChatPanel {
    <<component>>
    +projectId
    +mode ChatMode
  }
  class MessageList {
    <<component>>
  }
  class MessageItem {
    <<component>>
    +message
  }
  class StepTracker {
    <<component>>
    +steps
  }
  class Composer {
    <<component>>
    +disabled
  }
  class FileDropZone {
    <<component>>
  }
  class CitationChip {
    <<component>>
  }
  class ChatMode {
    <<enumeration>>
    ONBOARDING
    PLAN_EDIT
    QUESTION
  }
  class ChatController {
    <<hook>>
    +messages
    +send(text)
    +stop()
  }
  class UploadService {
    +upload(files) UploadHandle
  }
  class RoleGuard {
    +canEditPlan(role) bool
  }
  ChatPanel --> MessageList
  ChatPanel --> StepTracker
  ChatPanel --> Composer
  ChatPanel --> ChatController
  ChatPanel --> ChatMode
  MessageList --> MessageItem
  MessageItem --> CitationChip
  Composer --> FileDropZone
  FileDropZone --> UploadService
  Composer ..> RoleGuard
```

- **ChatController** wraps `useChat` and picks the agent endpoint from `ChatMode`.
- **UploadService** asks for signed URLs and uploads in parallel, with retries.
- **RoleGuard** disables Plan edits for Viewers, but the Accounts API still checks every request.
