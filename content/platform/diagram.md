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
| access | 0. Sign in | Users sign in with GCP Identity Platform under their company's tenant. Company admins invite users and create Projects, which Merlin records in its Cloud SQL accounts database. |
| onboard | 1. Onboard | The user supplies raw data, a business problem statement and the regulations the Project must follow, through Agora. |
| plan | 2. Plan | Merlin's Plan agents design the Golden Datasets, Ontology and predictive models, verify the code, and hand the Plan to the user for review. |
| create | 3. Create | Once the user approves, Orion runs the pipeline and anonymises the training data, Merlin trains the models on CPU or GPU, stores the results and generates the Ontology, and recovery agents restart failed work from a checkpoint. |
| interact | 4. Interact | The user asks questions. Research agents query the Golden Datasets, Ontology and models, and answer with a deep research document and a layered map. |

## Boxes

`Col` and `Row` place a box inside its parent's grid, counting from 0. `Rowspan` and
`Colspan` are optional and default to 1.

| ID | Parent | Label | Subtitle | Kind | Col | Row | Rowspan | Colspan | File |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| orion | | Orion | Customer data and compute | Trust boundary | 0 | 0 | 1 | 1 | orion/orion.md |
| raw | orion | Raw data buckets | Cloud Storage, per company | Storage | 0 | 0 | 1 | 1 | orion/raw-bucket.md |
| secrets | orion | Secret key storage | GCP Secret Manager | Secrets | 0 | 1 | 1 | 1 | orion/secret-manager.md |
| orion-api | orion | Orion control API | Cloud Run, profiling and job runner | Control plane | 1 | 0 | 1 | 1 | orion/control-api.md |
| dataproc | orion | Dataproc Serverless | Runs the Plan's PySpark pipeline | Compute | 1 | 1 | 1 | 1 | orion/dataproc.md |
| merlin | | Merlin | Core platform and engine, on GCP | Module | 1 | 0 | 1 | 1 | merlin/merlin.md |
| plan-engine | merlin | Plan agents | ReAct loop on Vertex AI Agent Engine | AI agents | 0 | 0 | 1 | 2 | merlin/plan-engine.md |
| plan-lead | plan-engine | Plan orchestrator | Runs the ReAct loop for the Plan | AI agent | 0 | 0 | 2 | 1 | merlin/plan-orchestrator.md |
| regs | plan-engine | Regulations library | Added by the user | Knowledge base | 0 | 2 | 1 | 1 | merlin/regulations.md |
| gold-architect | plan-engine | Golden Dataset architect | Schemas and pipeline from building blocks | AI agent | 1 | 0 | 1 | 1 | merlin/gold-architect.md |
| ontology-architect | plan-engine | Ontology architect | Foundry object types and links | AI agent | 1 | 1 | 1 | 1 | merlin/ontology-architect.md |
| model-architect | plan-engine | Model architect | Architectures and training building blocks | AI agent | 1 | 2 | 1 | 1 | merlin/model-architect.md |
| plan-verifier | plan-engine | Verification agent | Formal checks, tests on Cloud Run | AI agent | 2 | 0 | 3 | 1 | merlin/plan-verifier.md |
| recovery | merlin | Recovery agents | Vertex AI, restart from a checkpoint | AI agents | 0 | 1 | 1 | 1 | merlin/recovery.md |
| foundry | merlin | Palantir Foundry | One Ontology per Project | Platform | 1 | 1 | 1 | 1 | merlin/foundry.md |
| data-connection | foundry | 1. GCS Data Connection | Points at the Project's Golden Datasets | Foundry step | 0 | 0 | 1 | 1 | merlin/foundry-data-connection.md |
| virtual-tables | foundry | 2. Virtual Tables | Zero-copy data access | Foundry step | 0 | 1 | 1 | 1 | merlin/foundry-virtual-tables.md |
| ontology | foundry | 3. Ontology Graph | Generated from the Plan | Foundry step | 0 | 2 | 1 | 1 | merlin/foundry-ontology.md |
| training | merlin | Model training | Vertex AI Training, CPU or GPU | Compute | 0 | 3 | 1 | 1 | merlin/training.md |
| accounts | merlin | Accounts | Sign-in, tenants and Projects | Platform service | 1 | 3 | 1 | 1 | merlin/accounts.md |
| identity | accounts | Sign-in | GCP Identity Platform, a tenant per company | Identity | 0 | 0 | 1 | 1 | merlin/identity.md |
| accounts-api | accounts | Accounts API | Cloud Run, checks every request | Control plane | 0 | 1 | 1 | 1 | merlin/accounts-api.md |
| accounts-db | accounts | Accounts database | Cloud SQL: companies, users, Projects, roles | Database | 0 | 2 | 1 | 1 | merlin/accounts-db.md |
| project-store | merlin | Project store | Metadata in Cloud SQL | Storage | 0 | 2 | 1 | 1 | merlin/project-store.md |
| gold | project-store | Golden Datasets | Apache Iceberg, Spacetime-H3 | Storage | 0 | 0 | 1 | 1 | merlin/golden-datasets.md |
| models | project-store | Predictive models | Vertex AI Model Registry | Model store | 0 | 1 | 1 | 1 | merlin/models.md |
| research | merlin | Research agents | ReAct loop on Vertex AI Agent Engine | AI agents | 1 | 2 | 1 | 1 | merlin/research.md |
| planner | research | Planner agent | Breaks the question into steps | AI agent | 0 | 0 | 1 | 1 | merlin/agent-planner.md |
| analyst | research | Analyst agent | Queries data, Ontology and models | AI agent | 0 | 1 | 1 | 1 | merlin/agent-analyst.md |
| reporter | research | Report agent | Checks grounding, writes the answer | AI agent | 0 | 2 | 1 | 1 | merlin/agent-reporter.md |
| agora | | Agora | User workspace | Module | 2 | 0 | 1 | 1 | agora/agora.md |
| signin | agora | Sign-in and admin | Log in, invite users, manage Projects | UI window | 0 | 0 | 1 | 1 | agora/signin.md |
| plan-doc | agora | Plan document | Interactive review, in Cloud SQL | UI window | 0 | 1 | 1 | 1 | agora/plan-doc.md |
| chat | agora | Chat interface | Onboarding and questions | UI window | 0 | 2 | 1 | 1 | agora/chat.md |
| map | agora | Layered map | MapLibre, Deck.gl, tiles on Cloud CDN | UI window | 0 | 3 | 1 | 1 | agora/map.md |
| studio | agora | Deep research document | Report, tables and sources | UI window | 0 | 4 | 1 | 1 | agora/studio.md |
| hosting | agora | Agora hosting | Load balancer, Cloud Armor, Cloud CDN | Platform service | 0 | 5 | 1 | 1 | agora/hosting.md |
| edge | hosting | HTTPS load balancer | Cloud Armor, Cloud CDN | Edge | 0 | 0 | 1 | 1 | agora/edge.md |
| basemap | hosting | Basemap tiles | Cloud Storage, PMTiles | Storage | 0 | 1 | 1 | 1 | agora/basemap.md |

## Arrows

- `Kind` sets the line style: `gold` is thick, `control` is dashed, `secret` is dotted, and
  `data` and `agent` are solid.
- `Stage` sets the colour, using an ID from the Stages table.
- `Direction` is `one` or `both`.
- `Route` is optional. Use `down` to leave the bottom of the first box, `top` to run above
  neighbouring boxes, or `over` to run above the whole diagram.
- `Label` is the step number, if any, and the name of the payload the arrow carries. Numbers
  match the steps in the Journey slideshow.
- The arrow's file describes the payload's schema, shown when the arrow is clicked. If that
  file has a `## Steps` or `## Datasets` list, the list is also shown on the arrow.

| From | To | Label | Kind | Direction | Route | Stage | File |
| --- | --- | --- | --- | --- | --- | --- | --- |
| signin | identity | 0.1 IdToken | control | both |  | access | arrows/sign-in.md |
| signin | accounts-api | 0.2 AccountsRequest | control | both |  | access | arrows/tenant-admin.md |
| identity | accounts-api | TokenClaims | secret | one |  | access | arrows/token-claims.md |
| accounts-api | accounts-db | 0.3 AccountRecords | data | both |  | access | arrows/account-records.md |
| accounts-api | orion-api | 0.4 CreateCompany | control | one |  | access | arrows/create-company.md |
| agora | raw | 1.1 RawUpload | data | one | over | onboard | arrows/raw-upload.md |
| chat | plan-engine | 1.2 ProblemStatement | agent | one |  | onboard | arrows/problem-statement.md |
| plan-lead | orion-api | 2.1 DatasetProfile | control | both |  | plan | arrows/schema-request.md |
| raw | orion-api | FileMetadata | data | one |  | plan | arrows/file-metadata.md |
| regs | plan-lead | 2.2 RegulationContext | data | one |  | plan | arrows/regulation-context.md |
| plan-lead | gold-architect | ArchitectBrief | agent | one |  | plan | arrows/brief-gold.md |
| plan-lead | ontology-architect | ArchitectBrief | agent | one |  | plan | arrows/brief-ontology.md |
| plan-lead | model-architect | ArchitectBrief | agent | one |  | plan | arrows/brief-model.md |
| gold-architect | plan-verifier | GoldDraft | agent | one |  | plan | arrows/draft-gold.md |
| ontology-architect | plan-verifier | OntologyDraft | agent | one |  | plan | arrows/draft-ontology.md |
| model-architect | plan-verifier | ModelDraft | agent | one |  | plan | arrows/draft-model.md |
| plan-verifier | plan-doc | 2.3 PlanVersion | agent | one |  | plan | arrows/plan-review.md |
| plan-doc | plan-engine | 2.4 PlanPatch | control | one |  | plan | arrows/plan-edits.md |
| plan-lead | orion-api | 3.1 PipelineJobSpec | control | one |  | create | arrows/kickstart.md |
| orion-api | dataproc | BatchSpec | control | one |  | create | arrows/batch-spec.md |
| plan-lead | training | TrainingJobSpec | control | one |  | create | arrows/training-job.md |
| raw | dataproc | RawFiles | data | one |  | create | arrows/raw-files.md |
| dataproc | training | TrainingDataset | data | one |  | create | arrows/training-data.md |
| secrets | dataproc | HmacKey | secret | one |  | create | arrows/hmac-key.md |
| dataproc | gold | 3.2 IcebergCommit | gold | one |  | create | arrows/golden-datasets.md |
| training | models | 3.3 ModelVersion | data | one |  | create | arrows/model-version.md |
| gold | data-connection | 3.4 IcebergSnapshot | data | one |  | create | arrows/ontology-generation.md |
| data-connection | virtual-tables | TableRegistration | data | one |  | create | arrows/table-registration.md |
| virtual-tables | ontology | ObjectTypeBinding | data | one |  | create | arrows/object-type-binding.md |
| recovery | orion-api | 3.5 JobEvent | control | both |  | create | arrows/recovery.md |
| merlin | chat | 3.6 ProjectReady | control | one |  | create | arrows/project-ready.md |
| chat | planner | 4.1 Question | agent | both |  | interact | arrows/questions.md |
| planner | analyst | ResearchPlan | agent | one |  | interact | arrows/research-plan.md |
| analyst | reporter | EvidenceLedger | agent | one |  | interact | arrows/evidence-ledger.md |
| analyst | gold | 4.2 GoldQuery | agent | both |  | interact | arrows/gold-query.md |
| analyst | models | 4.3 Scenario | agent | both |  | interact | arrows/scenario.md |
| research | ontology | 4.4 OntologyQuery | agent | both |  | interact | arrows/ontology-query.md |
| reporter | studio | 4.5 Report | data | one |  | interact | arrows/report.md |
| basemap | edge | PmtilesObject | data | one | | interact | arrows/tile-origin.md |
| edge | map | BasemapTiles | data | one | | interact | arrows/basemap-tiles.md |
| reporter | map | 4.6 MapLayer | data | one |  | interact | arrows/map-layer.md |
