Makes spatial and temporal lookups fast by combining them into one sortable integer.

## Steps

- Take spatial cell centroids at H3 resolution 8, 9 or 10
- Rank cells along the Gosper curve
- Combine the rank with the timestamp
- Encode both into a compact 64-bit integer `spacetime_key`

## Data flow

```mermaid
flowchart LR
  P["Presences with e_i"] --> C["H3 cell at res 8, 9, 10"]
  C --> G["Gosper curve rank of the cell"]
  P --> T["Time slot"]
  G & T --> K["Pack into 64-bit spacetime_key"]
  K --> OUT["Indexed presences to P3 aggregation"]
```

## Software components

- **h3-py** for cells; a FourthSpace `spacetime` library for Gosper ranking and key packing.
- PySpark column expressions. No joins or aggregation in this stage.

## Configuration and metadata

- Key layout: high bits are the Gosper rank, low bits the time slot, so nearby cells and times sort together.
- Time slots: hourly, local time.
- Output: one row per presence and H3 resolution, still keyed by `device_key`. The aggregation stage builds the Gold tables.

> **To confirm:** the exact bit split between space and time.

## Low-level design

```mermaid
classDiagram
  class IndexStage {
    +apply(df, ctx) DataFrame
  }
  class SpacetimeCodec {
    +encode(cell, slot) int
    +decode(key) tuple
    +range(cells, slots) List~KeyRange~
  }
  class GosperRanker {
    +rank(cell) int
  }
  IndexStage --> SpacetimeCodec
  SpacetimeCodec --> GosperRanker
```

- `SpacetimeCodec.range` is reused by the Analyst agent to build `[k_lo, k_hi]` scans.
