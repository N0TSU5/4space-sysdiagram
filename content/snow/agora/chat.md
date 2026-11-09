The main window for working with the copilot. For example, a planner might ask: *"Find the optimal health van location in Barking & Dagenham for weekday afternoons"*.

## Steps

- Accepts natural language queries
- Streams real-time copilot answers
- Shows execution plans and audit logs
- Drives the map and research side windows

## Data flow

```mermaid
flowchart LR
  U["Planner"] --> IN["Composer"]
  IN -->|"Question"| AG["Merlin agents"]
  AG -->|"SSE: steps, tokens"| TH["Message thread"]
  AG -->|"VerifiedAnswer"| AS["AnswerStore"]
  AS --> MP["Map viewport"]
  AS --> ST["Studio panel"]
  TH -->|"show plan and audit"| PL["Plan and audit drawer"]
```

## UI components

- **Message thread:** streamed answers with evidence chips.
- **Step tracker:** Planner, Analyst, Verifier progress.
- **Composer:** text box and suggested Snow questions.
- **Plan and audit drawer:** the QueryPlan and the 7 check results.
- **Verified badge:** shown only on answers that passed the Verifier.

## Software components

- Next.js, **shadcn/ui**, a custom `useAgentStream` hook over server-sent events, **react-markdown**.

## Low-level design

```mermaid
classDiagram
  class ChatWindow {
    <<component>>
  }
  class MessageThread {
    <<component>>
  }
  class StepTracker {
    <<component>>
  }
  class Composer {
    <<component>>
  }
  class AuditDrawer {
    <<component>>
  }
  class useAgentStream {
    <<hook>>
    +messages
    +steps
    +send(text)
  }
  ChatWindow --> MessageThread
  ChatWindow --> StepTracker
  ChatWindow --> Composer
  ChatWindow --> AuditDrawer
  ChatWindow --> useAgentStream
```
