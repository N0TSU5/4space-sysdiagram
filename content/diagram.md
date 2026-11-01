# Diagram structure

This file controls which boxes and arrows appear on the diagram. The text inside
each box or arrow lives in the Markdown file named in its `File` column, relative
to the `content/` folder.

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
| foundry | merlin | Palantir Foundry | Ontology and integration steps | Platform | 1 | 0 | 1 | merlin/foundry.md |
| data-connection | foundry | 1. Data Connection | fourthspace_adls / GCS | Foundry step | 0 | 0 | 1 | merlin/foundry-data-connection.md |
| pipeline-builder | foundry | 2. Pipeline Builder transforms | Virtual Tables, geo types | Foundry step | 0 | 1 | 1 | merlin/foundry-pipeline-builder.md |
| ontology | foundry | 3. Ontology object mapping | 9 object types, 10 link types | Foundry step | 0 | 2 | 1 | merlin/foundry-ontology.md |
| compute-module | foundry | 4. Compute Module | querySites | Foundry step | 1 | 0 | 1 | merlin/foundry-compute-module.md |
| workshop | foundry | 5. Workshop and AIP Logic | snowRequestRanking, explanations | Foundry step | 1 | 1 | 1 | merlin/foundry-workshop-aip.md |
| agents | merlin | Vertex AI Agent Engine | Multi-agent SDK and Gemini | AI agents | 1 | 1 | 1 | merlin/agents.md |
| planner | agents | Planner Agent | Classifies and routes prompts | AI agent | 0 | 0 | 1 | merlin/agent-planner.md |
| analyst | agents | Analyst Agent | spacetime_key range scans | AI agent | 0 | 1 | 1 | merlin/agent-analyst.md |
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
- An arrow's file is optional. If that file has a `## Steps` or `## Datasets` list,
  the list is also shown on the arrow.

| From | To | Label | Kind | Direction | Route | File |
| --- | --- | --- | --- | --- | --- | --- |
| raw | scheduler | GCS notification | control | one | | |
| raw | p1-clean | Raw pings | data | one | | |
| scheduler | dataproc | Invokes run_period.sh | control | one | | |
| secrets | p1-clean | snow-hash-secret | secret | one | | |
| p1-clean | p1-stay | | data | one | | |
| p1-stay | p2-home | | data | one | | |
| p2-home | p3-index | | data | one | | |
| p3-index | p3-gate | | data | one | | |
| p3-gate | lakehouse | Gold datasets | gold | one | | arrows/gold-datasets.md |
| lakehouse | data-connection | Arrow 1: data sync | data | one | | arrows/arrow-1-data-sync.md |
| data-connection | pipeline-builder | | data | one | | |
| pipeline-builder | ontology | | data | one | | |
| ontology | compute-module | | data | one | | |
| compute-module | workshop | | data | one | | |
| planner | ontology | Arrow 2: agent reasoning | agent | both | | arrows/arrow-2-agent-reasoning.md |
| planner | analyst | | agent | one | | |
| analyst | verifier | | agent | one | | |
| lakehouse | analyst | BigLake range scans | agent | both | down | |
| planner | chat | Prompts and streamed answers | agent | both | | |
| verifier | chat | Verified answers and audit logs | agent | one | | |
| chat | map | Heatmaps and site markers | data | one | | |
| chat | studio | Briefs, tables, audit traces | data | one | | |
| map | foundry | Approve Deployment | control | one | top | |
