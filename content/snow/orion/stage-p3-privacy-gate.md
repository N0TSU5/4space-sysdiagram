The release boundary. Nothing reaches Merlin without passing this stage.

## Steps

- Permanently strip all pseudonymous `device_key` values
- Enforce the Floor of 5: suppress cells with fewer than 5 distinct panel devices
- Apply secondary sibling suppression
- Round exported counts to multiples of 5

## Data flow

```mermaid
flowchart LR
  A["Aggregates"] --> S["Strip device_key and ip_day_key"]
  S --> K{"distinct devices under 5?"}
  K -->|"yes"| SUP["Suppress cell"]
  K -->|"no"| KEEP["Keep"]
  SUP --> SIB["Sibling suppression: hide a neighbour if a total would reveal it"]
  KEEP --> SIB
  SIB --> R["Round counts to multiples of 5"]
  R --> CHK{"Final checks pass?"}
  CHK -->|"yes"| W["Iceberg commit to gold@datalake4us"]
  CHK -->|"no"| X["Abort run, nothing written"]
```

## Software components

- PySpark transforms plus a final **Great Expectations** suite that fails the run on any breach.
- Iceberg writer with `partitionOverwriteMode = dynamic`.

## Configuration and metadata

- k floor: 5 distinct panel devices.
- Rounding: to the nearest 5.
- Final checks: no column named like `device`, `ip` or `key` except `spacetime_key`; every published count at least 5; row count within expected range.
- The gate's report (cells suppressed, rows published) is kept with the run.

## Low-level design

```mermaid
classDiagram
  class PrivacyGate {
    +k_floor int
    +apply(df, ctx) DataFrame
  }
  class IdentifierStripper {
    +strip(df) DataFrame
  }
  class KFloorSuppressor {
    +suppress(df, k) DataFrame
  }
  class SiblingSuppressor {
    +suppress(df) DataFrame
  }
  class CountRounder {
    +round(df, base) DataFrame
  }
  class ReleaseChecks {
    +run(df) bool
  }
  PrivacyGate --> IdentifierStripper
  PrivacyGate --> KFloorSuppressor
  PrivacyGate --> SiblingSuppressor
  PrivacyGate --> CountRounder
  PrivacyGate --> ReleaseChecks
```
