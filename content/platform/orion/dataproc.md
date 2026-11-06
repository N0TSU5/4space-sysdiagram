Runs the Plan's PySpark pipeline inside Orion. It builds the Golden Datasets and anonymises a separate copy of the data for model training. Raw data never leaves Orion.

## Steps

- **Clean and de-identify:** removes or hashes personal identifiers.
- **Derive metrics:** computes the signals that drive the decision.
- **Spacetime-H3 indexing:** keys every record by H3 cell and time bucket.
- **Compliance gate:** checks the output against the Project's regulations.
- **Anonymise training data:** pseudonymises, coarsens and checks k-anonymity before it goes to Merlin.

## Data flow

```mermaid
flowchart LR
  RAW[("Raw data bucket")] --> RD["Read and validate"]
  RD --> CL["Clean and de-identify"]
  KEY["Hashing key, Secret Manager"] --> CL
  CL --> DM["Derive metrics and H3 index"]
  DM --> CG{"Compliance gate"}
  CG -->|"pass"| GOLD[("Golden Datasets, Merlin")]
  CL --> AN["Anonymise training data"]
  KEY --> AN
  AN --> KA{"k-anonymity check"}
  KA -->|"pass"| TD[("Training data bucket, Merlin")]
  KA -->|"fail"| CO["Coarsen or suppress"] --> AN
  CG & KA -->|"run metadata"| API["Orion control API"]
```

## Anonymisation of training data

- Drops direct identifiers: names, emails, phone numbers, device IDs.
- Replaces remaining IDs with keyed hashes (HMAC-SHA256), key from Secret Manager.
- Coarsens location to an H3 cell and time to an hour or day.
- Suppresses any group smaller than k = 10.
- Writes an anonymisation report with the run's metadata.

## Software components

- **Dataproc Serverless for Spark**, runtime 2.2, Python 3.11, PySpark.
- **FourthSpace pipeline building blocks**, a Python wheel of tested transforms.
- **Apache Iceberg** Spark runtime, **H3** for indexing.
- **Great Expectations** for data quality checks.

## Configuration and metadata

- One batch per pipeline run, started by the Orion control API.
- Runs as the company's own service account: read its raw bucket, write the Project's Golden Dataset and training data paths in Merlin, read the hashing key.
- Inside a VPC Service Controls perimeter, private IPs only.
- Executor count scaled from the profiled data size.
- Run metadata: batch ID, Plan version, code commit, input versions, row counts in and out, anonymisation report.
- Spark logs kept on a Persistent History Server.

## Low-level design

```mermaid
classDiagram
  class PipelineRun {
    +run_id str
    +plan_version int
    +code_commit str
    +stages List~Stage~
    +run(spark) RunReport
  }
  class Stage {
    <<abstract>>
    +name str
    +apply(df, ctx) DataFrame
    +checks() List~Expectation~
  }
  class ReadRaw
  class CleanDeidentify
  class DeriveMetrics
  class H3Index
  class ComplianceGate
  class AnonymiseForTraining
  class Hasher {
    -key bytes
    +hmac(value) str
  }
  class KAnonymityChecker {
    +k int
    +check(df, quasi_ids) KResult
  }
  class Sink {
    <<interface>>
    +write(df, target)
  }
  class IcebergSink
  class ParquetSink
  class SecretProvider {
    +hashing_key(company_id) bytes
  }
  class RunReport {
    +row_counts dict
    +anonymisation AnonReport
    +checks List~CheckResult~
  }
  PipelineRun o-- Stage
  Stage <|-- ReadRaw
  Stage <|-- CleanDeidentify
  Stage <|-- DeriveMetrics
  Stage <|-- H3Index
  Stage <|-- ComplianceGate
  Stage <|-- AnonymiseForTraining
  CleanDeidentify --> Hasher
  AnonymiseForTraining --> Hasher
  AnonymiseForTraining --> KAnonymityChecker
  Hasher ..> SecretProvider
  PipelineRun --> Sink
  Sink <|.. IcebergSink
  Sink <|.. ParquetSink
  PipelineRun --> RunReport
```

- **Stages come from the building blocks.** The agents compose a `PipelineRun` from existing `Stage` classes and only write new subclasses when none fits.
- Each stage declares its own **data quality checks**, run after `apply`.
- **Sinks** decide where output goes: Iceberg for Golden Datasets, Parquet for training data.
- The hashing key is injected through `SecretProvider`, never hard-coded or logged.
