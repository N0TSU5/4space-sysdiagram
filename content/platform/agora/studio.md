Shows the deep research document the Report agent writes: findings, tables, charts and the sources behind each claim.

## Data flow

```mermaid
flowchart LR
  RA["Report agent"] -->|"Report JSON"| ST[("Project store: reports")]
  ST -->|"GET report, with token"| RV["Report view"]
  RV --> BL["Render blocks: text, table, chart"]
  BL -->|"click [E3]"| EV["Evidence popover"]
  EV -->|"show on map"| MP["Layered map"]
  RV -->|"export"| PDF["PDF export"]
  RV -->|"follow-up"| CH["Chat"]
```

## UI components

- **Report header:** question, date, short answer.
- **Outline:** section list for jumping around.
- **Blocks:** text with citation chips, sortable tables, charts.
- **Evidence popover:** the query or scenario behind a claim, with its summary and "show on map".
- **Sources list:** every evidence item used.
- **Report history:** earlier answers in this Project.
- **Export:** PDF and CSV for tables.

## Software components

- Next.js page, **shadcn/ui**.
- **react-markdown** for text blocks, **TanStack Table** for tables, **react-vega** for Vega-Lite charts.
- PDF export with headless Chrome on a Cloud Run job.

## Configuration and metadata

- Renders the stored `Report` JSON; reports are read-only once written.
- Each report: ID, question, Plan version, model versions, evidence IDs, created at, created by.

## Low-level design

```mermaid
classDiagram
  class ReportView {
    <<component>>
    +reportId
  }
  class ReportHeader {
    <<component>>
  }
  class Outline {
    <<component>>
  }
  class BlockRenderer {
    <<component>>
    +block Block
  }
  class TextBlockView {
    <<component>>
  }
  class TableBlockView {
    <<component>>
  }
  class ChartBlockView {
    <<component>>
  }
  class EvidencePopover {
    <<component>>
  }
  class useReport {
    <<hook>>
    +report
    +evidence(id)
  }
  ReportView --> ReportHeader
  ReportView --> Outline
  ReportView --> BlockRenderer
  BlockRenderer --> TextBlockView
  BlockRenderer --> TableBlockView
  BlockRenderer --> ChartBlockView
  TextBlockView --> EvidencePopover
  ReportView --> useReport
```

- `BlockRenderer` picks a view per block type, matching the Report agent's `Block` classes.
