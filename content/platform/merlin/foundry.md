Palantir Foundry holds each Project's Ontology Graph. Foundry reads the Golden Datasets in place, with no copy, and the Ontology is generated automatically once they're stored.

## Steps

- **GCS Data Connection:** points at the Project's Golden Datasets.
- **Virtual Tables:** expose them to Foundry without copying.
- **Ontology Graph:** object types and links from the Plan, backed by the virtual tables.

## Data flow

```mermaid
flowchart LR
  G[("Golden Datasets, Iceberg on GCS")] -->|"read in place"| DC["GCS Data Connection"]
  DC --> VT["Virtual Tables"]
  VT --> ON["Ontology object types and links"]
  GEN["Ontology generator, Merlin"] -->|"Foundry Platform SDK"| DC & VT & ON
  ON -->|"OSDK queries"| RA["Research agents"]
```

## Software components

- **Palantir Foundry** (FourthSpace enrolment), one Foundry project per FourthSpace Project.
- **Foundry Platform SDK** (Python) used by Merlin's Ontology generator.
- **Ontology SDK (OSDK)**, Python, generated per Ontology, used by the research agents.

## Configuration and metadata

- Foundry project name: `fs-{company_id}-{project_id}`.
- Access: one Foundry service user per Project, read-only for agents. No end users log in to Foundry.
- The generator records Foundry resource IDs (connection, tables, ontology) in the Plan store.
- Deleting a Project deletes its Foundry project.

## Low-level design

```mermaid
classDiagram
  class OntologyGenerator {
    +generate(project, ontology_spec)
    +sync(project)
  }
  class FoundryClient {
    <<interface>>
    +create_connection(spec) Rid
    +create_virtual_table(conn, table) Rid
    +apply_ontology(spec) Rid
  }
  class PlatformSdkFoundryClient
  class FoundryResources {
    +project_rid
    +connection_rid
    +table_rids dict
    +ontology_rid
  }
  OntologyGenerator --> FoundryClient
  FoundryClient <|.. PlatformSdkFoundryClient
  OntologyGenerator --> FoundryResources
```

- `OntologyGenerator` is idempotent: running it again only applies what changed.
