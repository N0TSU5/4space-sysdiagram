Removes direct identifiers in-line and filters out unreliable pings.

## Steps

- Hash `device_id` to `device_key` with HMAC-SHA256
- Convert raw IP addresses to daily keys
- Drop pings with accuracy above 30 m
- Drop pings with altitude above 1,500 m
- Drop teleportation speeds above 90 m/s

## Data flow

```mermaid
flowchart LR
  R["Raw pings"] --> C{"consent = granted?"}
  C -->|"no"| D1["Drop"]
  C -->|"yes"| H["device_id to device_key, ip to ip_day_key"]
  H --> DR["Drop raw device_id and ip"]
  DR --> F1{"accuracy over 30 m?"}
  F1 -->|"yes"| D2["Drop"]
  F1 -->|"no"| F2{"altitude over 1,500 m?"}
  F2 -->|"yes"| D3["Drop"]
  F2 -->|"no"| F3{"speed from previous ping over 90 m/s?"}
  F3 -->|"yes"| D4["Drop"]
  F3 -->|"no"| OUT["Clean pings"]
```

## Software components

- PySpark DataFrame transforms; window functions per `device_key` ordered by time for speed.
- `KeyedHasher` (HMAC-SHA256) as a vectorised pandas UDF.

## Configuration and metadata

- Thresholds from `SnowParams`: 30 m, 1,500 m, 90 m/s.
- Raw `device_id` and IP are dropped in this stage; no later stage can see them.
- Counts dropped per rule go to the run report.

## Low-level design

```mermaid
classDiagram
  class CleaningStage {
    +apply(df, ctx) DataFrame
    -pseudonymise(df) DataFrame
    -drop_inaccurate(df) DataFrame
    -drop_high_altitude(df) DataFrame
    -drop_teleports(df) DataFrame
  }
  class CleanPing {
    +device_key
    +ip_day_key
    +ts
    +lat
    +lon
    +accuracy
  }
  CleaningStage ..> CleanPing
```
