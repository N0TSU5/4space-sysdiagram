Checks that every claim in the answer is backed by a query result, then writes the outputs.

## Outputs

- A deep research document with findings, tables and sources.
- Map layers, such as hexagon heatmaps and candidate site markers.

## Data flow

```mermaid
flowchart LR
  L[("Evidence ledger")] --> D["Draft report"]
  Q["Question"] --> D
  D --> GC{"Grounding check"}
  GC -->|"claim without evidence"| D
  GC -->|"all grounded"| RJ["Report JSON"]
  L --> ML["Build map layers"]
  RJ -->|"save"| ST[("Project store: reports")]
  RJ --> S["Deep research document"]
  ML --> M["Layered map"]
  RJ -->|"short answer"| C["Chat"]
```

## Software components

- ADK `LlmAgent`, Gemini 4 Argon.
- A deterministic **grounding checker** that matches every number and claim to an evidence ID.
- **Vega-Lite** chart specs; map layers as H3 cell lists with values.

## Prompting and context engineering

- **Context:** the question and the evidence ledger summaries with IDs. Raw rows only for tables the report will show.
- **Cite everything:** every sentence with a fact carries `[E3]`-style evidence IDs.
- **Checker in the loop:** the draft goes through the grounding checker; ungrounded claims are sent back to be removed or fixed, up to 2 rounds.
- **Structure:** short answer first, then findings, tables, charts, method, limitations.

## Prompt (excerpt)

```text
Answer: "{question}" using only this evidence: {ledger}.
Every factual sentence must cite evidence IDs like [E3].
Start with a 2-sentence answer, then findings, tables, charts,
method and limitations. Propose map layers from evidence with H3 cells.
Return Report JSON only.
```

## Low-level design

```mermaid
classDiagram
  class ReporterAgent {
    +write(question, ledger) Answer
  }
  class GroundingChecker {
    +check(report, ledger) List~Issue~
  }
  class Report {
    +summary
    +sections List~Section~
    +sources List~EvidenceId~
  }
  class Section {
    +title
    +blocks List~Block~
  }
  class Block {
    <<abstract>>
  }
  class TextBlock
  class TableBlock
  class ChartBlock
  class MapLayer {
    +id
    +kind
    +h3_res
    +cells dict
    +legend
  }
  ReporterAgent --> GroundingChecker
  ReporterAgent --> Report
  ReporterAgent --> MapLayer
  Report o-- Section
  Section o-- Block
  Block <|-- TextBlock
  Block <|-- TableBlock
  Block <|-- ChartBlock
```
