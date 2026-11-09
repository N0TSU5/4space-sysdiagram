Orion runs strictly as an **ephemeral data processing worker** inside Terrabite's secure GCP project.

Raw personal movement traces and persistent device IDs stay inside this boundary. Only non-linkable Gold Parquet tables that pass the privacy gate are published out to Merlin.

## Data flow

```mermaid
flowchart LR
  T["Terrabite delivery"] -->|"TSV and Parquet"| RAW[("raw@datalake4us")]
  RAW -->|"new partition event"| SCH["Scheduler"]
  SCH -->|"run_period.sh"| DP["Dataproc Serverless"]
  RAW --> DP
  SM["Secret Manager"] -->|"snow-hash-secret"| DP
  REF[("Reference bucket: ONS, Census, IoD, MHIP")] --> DP
  DP --> P1["P1 clean and stays"] --> P2["P2 home"] --> P3["P3 index"] --> PA["P3 aggregation with demographics"] --> PG{"P3.15 privacy gate"}
  PG -->|"pass: Gold Parquet"| G[("gold@datalake4us, Merlin")]
  PG -->|"fail"| STOP["Run stops, nothing published"]
```

## Software components

- Terrabite's GCP project, inside a **VPC Service Controls** perimeter.
- **Cloud Storage**, **Pub/Sub**, **Workflows**, **Dataproc Serverless**, **Secret Manager**.
- **Cloud KMS** customer-managed keys on the bucket and secret.
- **Terraform** for the project's resources.

## Configuration and metadata

- Workers are ephemeral: no persistent disks, no data kept after a run.
- One path out of the perimeter: the privacy gate's write to `gold@datalake4us`.
- FourthSpace staff have no read access to `raw@datalake4us`.
- Data Access audit logs on for the raw bucket and the secret.

## Low-level design

```mermaid
classDiagram
  class snow_pipeline {
    <<package>>
    p1_clean
    p1_stays
    p2_home
    p3_index
    p3_aggregate
    p3_gate
  }
  class snow_runner {
    <<package>>
    run_period
  }
  class snow_infra {
    <<package>>
    terraform
  }
  snow_runner ..> snow_pipeline : submits
```

- Two deployables: the `snow_pipeline` wheel and the `run_period.sh` runner.
