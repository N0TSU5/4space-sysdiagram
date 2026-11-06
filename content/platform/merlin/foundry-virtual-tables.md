Virtual Tables let Foundry read the Golden Datasets where they are, so there's only one copy of the data and it's always current.

## Data flow

```mermaid
flowchart LR
  DC["GCS Data Connection"] --> REG["Register Iceberg table"]
  CAT[("Iceberg catalog, BigLake metastore")] -->|"latest snapshot"| REG
  REG --> VT["Virtual Table per Gold table"]
  NEW["New Gold snapshot"] -->|"refresh"| VT
  VT --> ON["Ontology object types"]
```

## Software components

- **Foundry Virtual Tables** over Apache Iceberg.
- **BigLake metastore** as the Iceberg catalog.

## Configuration and metadata

- One virtual table per Gold table, same name as in the GoldSpec.
- Reads the latest Iceberg snapshot; the snapshot ID is recorded on each Ontology sync.
- Schema changes come from a new Plan version only; the generator updates the table then.

## Low-level design

```mermaid
classDiagram
  class VirtualTableSpec {
    +table_name
    +iceberg_identifier
    +primary_key
  }
  class VirtualTableSync {
    +ensure(conn, spec) Rid
    +refresh(rid, snapshot_id)
  }
  VirtualTableSync --> VirtualTableSpec
```
