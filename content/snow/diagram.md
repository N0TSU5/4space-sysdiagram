# Diagram structure

This file controls which boxes and arrows appear on the diagram. Each box's `File`
gives its starting text, which is copied to the Google Sheet the first time the page
connects. After that, use the page's Edit button to change box text. Arrow text stays
in the file named in its `File` column. Paths are relative to `content/snow/`.

See `README.md` for how to add, move or remove something.

## Boxes

`Col` and `Row` place a box inside its parent's grid, counting from 0.

| ID | Parent | Label | Subtitle | Kind | Col | Row | Rowspan | File |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| orion | | Orion | Terrabite sovereign cloud boundary | Trust boundary | 0 | 0 | 1 | orion/orion.md |
| raw | orion | Raw bucket storage | raw@datalake4us | Storage | 0 | 0 | 1 | orion/raw-bucket.md |
| scheduler | orion | Scheduler and event listener | Pub/Sub, Workflows or Composer | Trigger | 0 | 1 | 1 | orion/scheduler.md |
| secrets | orion | Secret key storage | GCP Secret Manager | Secrets | 0 | 2 | 1 | orion/secret-manager.md |
| dataproc | orion | Dataproc Serverless | PySpark 3.5, Runtime 2.2 | Compute | 1 | 0 | 3 | orion/dataproc.md |
| p1-clean | dataproc | P1.1–P1.7 De-Id and ping cleaning | | Pipeline stage | 0 | 0 | 1 | orion/stage-p1-cleaning.md |
| p1-stay | dataproc | P1.8–P1.14 Presence and stay clustering | | Pipeline stage | 0 | 1 | 1 | orion/stage-p1-stays.md |
| p2-home | dataproc | P2 Home assignment and expansion | | Pipeline stage | 0 | 2 | 1 | orion/stage-p2-home.md |
| p3-index | dataproc | P3 Spacetime-H3 integer indexing | | Pipeline stage | 0 | 3 | 1 | orion/stage-p3-indexing.md |
| p3-gate | dataproc | P3.15 Privacy gate and release boundary | | Pipeline stage | 0 | 4 | 1 | orion/stage-p3-privacy-gate.md |
| merlin | | Merlin | FourthSpace core platform and engine | Module | 1 | 0 | 1 | merlin/merlin.md |
| lakehouse | merlin | GCP lakehouse store | gold@datalake4us, Apache Iceberg | Storage | 0 | 0 | 1 | merlin/lakehouse.md |
| bigquery | merlin | BigQuery | BigLake tables over the Gold Iceberg data | Query engine | 0 | 1 | 1 | merlin/bigquery.md |
| foundry | merlin | Palantir Foundry | Zero-copy projection into the Ontology | Platform | 1 | 0 | 1 | merlin/foundry.md |
| data-connection | foundry | 1. GCS Data Connection | gs_gold_connection | Foundry step | 0 | 0 | 1 | merlin/foundry-data-connection.md |
| virtual-tables | foundry | 2. Virtual Tables | Zero-copy data access | Foundry step | 0 | 1 | 1 | merlin/foundry-virtual-tables.md |
| ontology | foundry | 3. [Snow] Ontology Graph | 4 object types, 3 graph links | Foundry step | 0 | 2 | 1 | merlin/foundry-ontology.md |
| agents | merlin | Vertex AI Agent Engine | Multi-agent SDK and Gemini | AI agents | 1 | 1 | 1 | merlin/agents.md |
| planner | agents | Planner Agent | Inspects object properties and links | AI agent | 0 | 0 | 1 | merlin/agent-planner.md |
| analyst | agents | Analyst Agent | Ontology queries and range scans | AI agent | 0 | 1 | 1 | merlin/agent-analyst.md |
| verifier | agents | Verifier Agent | 7 checks and Model Armor | AI agent | 0 | 2 | 1 | merlin/agent-verifier.md |
| agora | | Agora | User interface workspace | Module | 2 | 0 | 1 | agora/agora.md |
| chat | agora | LLM chat interface | Window 1 | UI window | 0 | 0 | 2 | agora/chat.md |
| map | agora | Map viewport | Window 2: MapLibre, Deck.gl, PMTiles | UI window | 1 | 0 | 1 | agora/map.md |
| studio | agora | Deep research and studio panel | Window 3 | UI window | 1 | 1 | 1 | agora/studio.md |

## Arrows

- `Kind` is one of `gold`, `data`, `control`, `secret` or `agent`.
- `Direction` is `one` or `both`.
- `Route` is optional. Use `down` to leave the bottom of the first box, or `top` to
  run above neighbouring boxes.
- `Label` is the name of the payload the arrow carries. The arrow's file describes its
  schema, shown when the arrow is clicked. If that file has a `## Steps` or `## Datasets`
  list, the list is also shown on the arrow.

| From | To | Label | Kind | Direction | Route | File |
| --- | --- | --- | --- | --- | --- | --- |
| raw | scheduler | ObjectFinalized | control | one |  | arrows/object-finalized.md |
| raw | p1-clean | RawPing | data | one |  | arrows/raw-ping.md |
| scheduler | dataproc | RunPeriodRequest | control | one |  | arrows/run-period.md |
| secrets | p1-clean | HmacKey | secret | one |  | arrows/hmac-key.md |
| p1-clean | p1-stay | CleanPing | data | one |  | arrows/clean-ping.md |
| p1-stay | p2-home | Presence | data | one |  | arrows/presence.md |
| p2-home | p3-index | WeightedPresence | data | one |  | arrows/weighted-presence.md |
| p3-index | p3-gate | CellAggregate | data | one |  | arrows/cell-aggregate.md |
| p3-gate | lakehouse | GoldCommit | gold | one |  | arrows/gold-datasets.md |
| lakehouse | data-connection | IcebergSnapshot | data | one |  | arrows/arrow-1-data-sync.md |
| data-connection | virtual-tables | TableRegistration | data | one |  | arrows/table-registration.md |
| virtual-tables | ontology | ObjectTypeBinding | data | one |  | arrows/object-type-binding.md |
| agents | ontology | OntologyQuery | agent | one |  | arrows/arrow-2-agent-reasoning.md |
| planner | analyst | QueryPlan | agent | one |  | arrows/query-plan.md |
| analyst | verifier | DraftAnswer | agent | one |  | arrows/draft-answer.md |
| lakehouse | bigquery | BigLakeTable | data | one | | arrows/biglake-table.md |
| agents | bigquery | RangeScan | agent | both | | arrows/range-scan.md |
| planner | chat | Question | agent | both |  | arrows/question.md |
| verifier | chat | VerifiedAnswer | agent | one |  | arrows/verified-answer.md |
| chat | map | MapLayer | data | one |  | arrows/map-layer.md |
| chat | studio | StudioContent | data | one |  | arrows/studio-content.md |
