Everything a Project owns, stored on GCP. The Project's metadata, such as its owner company and users, is stored in Cloud SQL. Each Project has its own Golden Datasets, models and Ontology, and many users can work on the same Project.

## Data flow

```mermaid
flowchart LR
  DP["Dataproc pipeline"] -->|"Iceberg commits"| G[("Golden Datasets")]
  DP -->|"Parquet"| TD[("Training data")]
  TD --> TR["Model training"]
  TR -->|"checkpoints"| CK[("Checkpoints")]
  TR --> M[("Model Registry")]
  PS[("Plan store, Cloud SQL")] <-->|"Plans, jobs, resource IDs"| O["Plan agents"]
  G --> F["Foundry"]
  G & M --> RA["Research agents"]
```

## Software components

- **Cloud Storage** bucket `merlin-projects` with one prefix per Project.
- **BigLake metastore** as the Iceberg catalog.
- **Vertex AI Model Registry**.
- **Cloud SQL for PostgreSQL** (the same instance as the accounts database) for the Plan store.

## Configuration and metadata

- Layout: `{project_id}/gold/`, `{project_id}/training/`, `{project_id}/checkpoints/`, `{project_id}/reports/`.
- IAM per prefix through managed folders; each Project's service account sees only its own.
- Lifecycle: training data deleted 30 days after the models are registered; checkpoints after 14 days.
- Plan store tables: `plans`, `plan_versions`, `jobs`, `incidents`, `foundry_resources`, `reports`.
- CMEK on everything.

## Low-level design

```mermaid
classDiagram
  class ProjectStore {
    +gold(project_id) GoldCatalog
    +training_uri(project_id) str
    +checkpoints(project_id) CheckpointStore
    +plans(project_id) PlanRepo
  }
  class GoldCatalog {
    +table(name) IcebergTable
  }
  class CheckpointStore {
    +save(job_id, state)
    +latest(job_id)
  }
  class PlanRepo {
    +current() Plan
    +version(n) Plan
    +save(plan)
  }
  ProjectStore --> GoldCatalog
  ProjectStore --> CheckpointStore
  ProjectStore --> PlanRepo
```

- `ProjectStore` is the only way services build paths, so a Project can't read another's prefix by a typo.
