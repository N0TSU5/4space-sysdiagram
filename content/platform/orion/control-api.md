The single entry point Merlin uses to work with Orion. It runs on Cloud Run.

## Steps

- **Schema profiling:** returns the number of records and a mapping of each column name to its type, so the Plan agents can design without seeing the raw data.
- **Job runner:** receives the approved PySpark pipeline, starts it on Dataproc Serverless, and records checkpoints.
- **Company buckets:** creates a new company's raw data bucket when the Accounts API asks.
- **Status:** reports progress and failures, which recovery agents use to restart work.

## Data flow

```mermaid
flowchart LR
  M["Merlin service account"] -->|"IAM-authenticated call"| API["Control API"]
  API -->|"profile"| PR["Profiler, DuckDB"]
  PR -->|"read file metadata and counts"| RAW[("Raw bucket")]
  PR -->|"counts and column types"| M
  API -->|"submit"| JR["Job runner"]
  JR -->|"create batch"| DP["Dataproc Serverless"]
  JR <-->|"job state, checkpoints"| FS[("Firestore")]
  DP -->|"status"| JR
  JR -->|"job events"| PS["Pub/Sub"]
  API -->|"provision"| B["New company bucket, key, service account"]
  AG["Agora"] -->|"upload request"| API
  API -->|"signed URL"| AG
```

## Software components

- **Python 3.12, FastAPI**, on **Cloud Run**.
- **DuckDB** for profiling: reads Parquet footers and CSV headers, counts rows. Never returns values.
- **Dataproc Batches API** client.
- **Firestore** for job state, **Pub/Sub** for job events.

## Configuration and metadata

- Ingress: internal only, plus the Agora upload endpoint behind the load balancer.
- Callers allowed: Merlin's Plan, recovery and accounts service accounts, checked by IAM.
- Endpoints: `POST /profile`, `POST /jobs`, `GET /jobs/{id}`, `POST /jobs/{id}/restart`, `POST /companies`, `POST /uploads`.
- Profile output schema is fixed: dataset, row count, columns with name and type. No sample values.
- Job record: job ID, Project, Plan version, code commit, batch ID, state, last checkpoint, error.
- Signed upload URLs expire after 15 minutes.

## Low-level design

```mermaid
classDiagram
  class ProfileRouter
  class JobsRouter
  class CompaniesRouter
  class UploadsRouter
  class Profiler {
    +profile(dataset) DatasetProfile
  }
  class DatasetProfile {
    +dataset str
    +row_count int
    +columns List~ColumnType~
  }
  class JobRunner {
    +submit(spec) Job
    +restart(job_id, checkpoint) Job
    +on_batch_update(event)
  }
  class Job {
    +id
    +project_id
    +plan_version
    +state JobState
    +last_checkpoint
  }
  class JobStore {
    <<interface>>
    +get(id) Job
    +save(job)
  }
  class FirestoreJobStore
  class EventPublisher {
    +publish(job_event)
  }
  class CompanyProvisioner {
    +create(company_id, region)
  }
  ProfileRouter --> Profiler
  Profiler --> DatasetProfile
  JobsRouter --> JobRunner
  JobRunner --> JobStore
  JobStore <|.. FirestoreJobStore
  JobRunner --> EventPublisher
  JobRunner --> Job
  CompaniesRouter --> CompanyProvisioner
```

- `DatasetProfile` has no field that can hold a data value, so a sample can't leak by mistake.
- `JobRunner` is the only class that talks to Dataproc.
