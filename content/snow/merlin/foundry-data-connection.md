The GCS Data Connection (`gs_gold_connection`) is a secure, read-only integration path directly in Google Cloud Storage.

## Data flow

```mermaid
flowchart LR
  WIF["Workload identity federation"] -->|"short-lived credentials"| DC["gs_gold_connection"]
  DC -->|"list and read"| B[("Gold bucket")]
  DC --> VT["Virtual Tables"]
```

## Software components

- **Foundry Data Connection**, Google Cloud Storage source.
- **GCP Workload Identity Federation**: no stored service account key.

## Configuration and metadata

- Read-only, whole Gold bucket.
- GCP principal: `foundry-snow`, role `storage.objectViewer`.
- Foundry egress IPs allow-listed in the perimeter.

## Low-level design

```mermaid
classDiagram
  class GcsSource {
    +name gs_gold_connection
    +bucket
    +wif_provider
    +service_account
  }
```
