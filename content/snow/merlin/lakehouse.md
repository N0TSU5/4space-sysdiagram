The platform's store for Gold data, `gold@datalake4us`.

## Capabilities

- Stores Snappy-compressed Gold Parquet files
- Uses Apache Iceberg snapshot commits to update table catalog pointers atomically (`partitionOverwriteMode = dynamic`)
- Exposed zero-copy to BigQuery BigLake external tables
- Runs fast 64-bit `spacetime_key` range pruning over Parquet row-group metadata

## Data flow

```mermaid
flowchart LR
  PG["Privacy gate"] -->|"Iceberg commit"| T[("Gold Parquet, Iceberg tables")]
  T --> CAT[("BigLake metastore")]
  CAT --> BQ["BigQuery BigLake tables"]
  CAT --> GCS["gs_gold_connection, Foundry"]
  BQ -->|"spacetime_key BETWEEN k_lo AND k_hi"| AN["Analyst agent"]
```

## Software components

- **Cloud Storage** bucket `gold@datalake4us`, `europe-west2`.
- **Apache Iceberg** tables, Snappy Parquet.
- **BigLake metastore** catalog and **BigQuery** BigLake tables.

## Configuration and metadata

- Tables: `footfall`, `dwell`, `composition`, `origin`, `reach`, `area_need`, `site_recommendation`.
- Partitioned by date; files sorted by `spacetime_key`, so row-group min and max prune range scans.
- Row groups about 128 MB.
- Snapshots kept 30 days for rollback.
- Writer: Orion's pipeline account only. Readers: Foundry connection and the agents' read-only BigQuery account.
- CMEK on the bucket.

## Low-level design

```mermaid
classDiagram
  class GoldTable {
    +name
    +schema
    +partition date
    +sort spacetime_key
  }
  class FootfallRow {
    +spacetime_key int
    +h3_res int
    +date
    +slot_id
    +est_people int
    +panel_devices int
  }
  class SiteRecommendationRow {
    +site_id
    +window_id
    +norm_reach float
    +norm_need float
    +score float
  }
  GoldTable ..> FootfallRow
  GoldTable ..> SiteRecommendationRow
```

- Two of the seven table shapes shown; the full list is on the Gold datasets arrow.
