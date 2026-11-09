Registers schema definitions over the Parquet files. Data is read in place, so no duplicate copies are made or stored inside Foundry.

## Data flow

```mermaid
flowchart LR
  DC["gs_gold_connection"] --> R["Register table"]
  CAT[("Iceberg catalog")] -->|"latest snapshot"| R
  R --> VT["One virtual table per Gold table"]
  NEW["New Gold commit"] -->|"refresh"| VT
```

## Software components

- **Foundry Virtual Tables** over Apache Iceberg.

## Configuration and metadata

- Seven virtual tables, one per Gold table, same names.
- Refreshed after each daily commit; snapshot ID recorded.

## Low-level design

```mermaid
classDiagram
  class VirtualTable {
    +name
    +iceberg_identifier
    +primary_key
    +snapshot_id
  }
```
