# Diagram structure

This file controls which boxes and arrows appear on the Platform diagram. Each box's `File`
gives its starting text, which is copied to the Google Sheet the first time the page
connects. After that, use the page's Edit button to change box text. Arrow text stays in the
file named in its `File` column. Paths are relative to `content/platform/`.

See `README.md` for how to add, move or remove something.

## Stages

The journey stages, in order. Each arrow's `Stage` sets its colour, and the legend lists
them. The slideshow in the Journey tab uses the same IDs.

| ID | Label | Description |
| --- | --- | --- |
| onboard | 1. Onboard | The user supplies raw data, a business problem statement and the regulations the Project must follow, through Agora. |
| plan | 2. Plan | Merlin's Plan agents design the Golden Datasets, Ontology and predictive models, verify the code, and hand the Plan to the user for review. |
| create | 3. Create | Once the user approves, Orion runs the pipeline and model training, Merlin stores the results and generates the Ontology, and recovery agents restart failed work from a checkpoint. |
| interact | 4. Interact | The user asks questions. Research agents query the Golden Datasets, Ontology and models, and answer with a deep research document and a layered map. |

## Boxes

`Col` and `Row` place a box inside its parent's grid, counting from 0. `Rowspan` and
`Colspan` are optional and default to 1.

| ID | Parent | Label | Subtitle | Kind | Col | Row | Rowspan | Colspan | File |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| orion | | Orion | Customer data and compute | Trust boundary | 0 | 0 | 1 | 1 | orion/orion.md |
| raw | orion | Raw data buckets | Cloud Storage, per company | Storage | 0 | 0 | 1 | 1 | orion/raw-bucket.md |
| secrets | orion | Secret key storage | GCP Secret Manager | Secrets | 0 | 1 | 1 | 1 | orion/secret-manager.md |
| tpu | orion | TPU training VM | Compute Engine, TorchTPU | Compute | 0 | 2 | 1 | 1 | orion/tpu.md |
| orion-api | orion | Orion control API | Schema profiling and job runner | Control plane | 1 | 0 | 1 | 1 | orion/control-api.md |
| dataproc | orion | Dataproc Serverless | Runs the Plan's PySpark pipeline | Compute | 1 | 1 | 1 | 1 | orion/dataproc.md |
| merlin | | Merlin | Core platform and engine, on GCP | Module | 1 | 0 | 1 | 1 | merlin/merlin.md |
| plan-engine | merlin | Plan agents | ReAct loop on Vertex AI Agent Engine | AI agents | 0 | 0 | 1 | 2 | merlin/plan-engine.md |
| plan-lead | plan-engine | Plan orchestrator | Runs the ReAct loop for the Plan | AI agent | 0 | 0 | 2 | 1 | merlin/plan-orchestrator.md |
| regs | plan-engine | Regulations library | Added by the user | Knowledge base | 0 | 2 | 1 | 1 | merlin/regulations.md |
| gold-architect | plan-engine | Golden Dataset architect | Table schemas and PySpark pipeline | AI agent | 1 | 0 | 1 | 1 | merlin/gold-architect.md |
| ontology-architect | plan-engine | Ontology architect | Foundry object types and links | AI agent | 1 | 1 | 1 | 1 | merlin/ontology-architect.md |
| model-architect | plan-engine | Model architect | Architectures and TorchTPU code | AI agent | 1 | 2 | 1 | 1 | merlin/model-architect.md |
| plan-verifier | plan-engine | Verification agent | Formal verification and unit tests | AI agent | 2 | 0 | 3 | 1 | merlin/plan-verifier.md |
| recovery | merlin | Recovery agents | Audit, fix and restart from a checkpoint | AI agents | 0 | 1 | 1 | 1 | merlin/recovery.md |
| foundry | merlin | Palantir Foundry | One Ontology per Project | Platform | 1 | 1 | 1 | 1 | merlin/foundry.md |
| data-connection | foundry | 1. GCS Data Connection | Points at the Project's Golden Datasets | Foundry step | 0 | 0 | 1 | 1 | merlin/foundry-data-connection.md |
| virtual-tables | foundry | 2. Virtual Tables | Zero-copy data access | Foundry step | 0 | 1 | 1 | 1 | merlin/foundry-virtual-tables.md |
| ontology | foundry | 3. Ontology Graph | Generated from the Plan | Foundry step | 0 | 2 | 1 | 1 | merlin/foundry-ontology.md |
| project-store | merlin | Project store | Everything a Project owns | Storage | 0 | 2 | 1 | 1 | merlin/project-store.md |
| gold | project-store | Golden Datasets | Apache Iceberg, Spacetime-H3 | Storage | 0 | 0 | 1 | 1 | merlin/golden-datasets.md |
| models | project-store | Predictive models | Vertex AI Model Registry | Model store | 0 | 1 | 1 | 1 | merlin/models.md |
| research | merlin | Research agents | ReAct loop on Vertex AI Agent Engine | AI agents | 1 | 2 | 1 | 1 | merlin/research.md |
| planner | research | Planner agent | Breaks the question into steps | AI agent | 0 | 0 | 1 | 1 | merlin/agent-planner.md |
| analyst | research | Analyst agent | Queries data, Ontology and models | AI agent | 0 | 1 | 1 | 1 | merlin/agent-analyst.md |
| reporter | research | Report agent | Checks grounding, writes the answer | AI agent | 0 | 2 | 1 | 1 | merlin/agent-reporter.md |
| agora | | Agora | User workspace | Module | 2 | 0 | 1 | 1 | agora/agora.md |
| plan-doc | agora | Plan document | Interactive Plan review | UI window | 0 | 0 | 1 | 1 | agora/plan-doc.md |
| chat | agora | Chat interface | Onboarding and questions | UI window | 0 | 1 | 1 | 1 | agora/chat.md |
| map | agora | Layered map | MapLibre, Deck.gl, PMTiles | UI window | 0 | 2 | 1 | 1 | agora/map.md |
| studio | agora | Deep research document | Report, tables and sources | UI window | 0 | 3 | 1 | 1 | agora/studio.md |

## Arrows

- `Kind` sets the line style: `gold` is thick, `control` is dashed, `secret` is dotted, and
  `data` and `agent` are solid.
- `Stage` sets the colour, using an ID from the Stages table.
- `Direction` is `one` or `both`.
- `Route` is optional. Use `down` to leave the bottom of the first box, `top` to run above
  neighbouring boxes, or `over` to run above the whole diagram.
- Numbered labels match the steps in the Journey slideshow.
- An arrow's file is optional. If that file has a `## Steps` or `## Datasets` list, the list
  is also shown on the arrow.

| From | To | Label | Kind | Direction | Route | Stage | File |
| --- | --- | --- | --- | --- | --- | --- | --- |
| agora | raw | 1.1 Raw data upload | data | one | over | onboard | arrows/raw-upload.md |
| chat | plan-engine | 1.2 Problem and regulations | agent | one | | onboard | arrows/problem-statement.md |
| plan-lead | orion-api | 2.1 Schema and size | control | both | | plan | arrows/schema-request.md |
| raw | orion-api | | data | one | | plan | |
| regs | plan-lead | 2.2 Legal rules | data | one | | plan | |
| plan-lead | gold-architect | | agent | one | | plan | |
| plan-lead | ontology-architect | | agent | one | | plan | |
| plan-lead | model-architect | | agent | one | | plan | |
| gold-architect | plan-verifier | | agent | one | | plan | |
| ontology-architect | plan-verifier | | agent | one | | plan | |
| model-architect | plan-verifier | | agent | one | | plan | |
| plan-verifier | plan-doc | 2.3 Plan for review | agent | one | | plan | arrows/plan-review.md |
| plan-doc | plan-engine | 2.4 Edits and approval | control | one | | plan | arrows/plan-edits.md |
| plan-lead | orion-api | 3.1 Pipeline and training code | control | one | | create | arrows/kickstart.md |
| orion-api | dataproc | | control | one | | create | |
| orion-api | tpu | | control | one | | create | |
| raw | dataproc | | data | one | | create | |
| dataproc | tpu | Training data | data | one | | create | |
| secrets | dataproc | Hashing keys | secret | one | | create | |
| dataproc | gold | 3.2 Golden Datasets | gold | one | | create | arrows/golden-datasets.md |
| tpu | models | 3.3 Trained models | data | one | | create | |
| gold | data-connection | 3.4 Ontology generation | data | one | | create | arrows/ontology-generation.md |
| data-connection | virtual-tables | | data | one | | create | |
| virtual-tables | ontology | | data | one | | create | |
| recovery | orion-api | 3.5 Audit and restart | control | both | | create | arrows/recovery.md |
| merlin | chat | 3.6 Project ready | control | one | | create | |
| chat | planner | 4.1 Questions and answers | agent | both | | interact | arrows/questions.md |
| planner | analyst | | agent | one | | interact | |
| analyst | reporter | | agent | one | | interact | |
| analyst | gold | 4.2 Dataset queries | agent | both | | interact | |
| analyst | models | 4.3 Predictions | agent | both | | interact | |
| research | ontology | 4.4 Ontology queries | agent | both | | interact | |
| reporter | studio | 4.5 Deep research document | data | one | | interact | |
| reporter | map | 4.6 Map layers | data | one | | interact | |
