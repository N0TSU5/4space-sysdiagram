Estimates where devices live and how many people each one represents.

## Steps

- Evaluate night-time presences, 22:00–06:00 local time
- Use multi-week lookbacks
- Assign primary night H3 resolution 10 cells
- Map cells to ONS LSOA 2021 boundaries by point-in-polygon
- Calculate user expansion factors

## Expansion factor

`e_i = min(LSOA Population / Sample Devices, 70.0)`

## Data flow

```mermaid
flowchart LR
  P["Presences, multi-week"] --> N["Keep 22:00-06:00 local"]
  N --> H10["Most-used night H3 res 10 cell"]
  H10 --> PIP["Point in polygon"]
  L[("ONS LSOA 2021 boundaries")] --> PIP
  PIP --> HL["Home LSOA per device"]
  HL --> EF["Expansion factor e_i"]
  POP[("ONS LSOA population")] --> EF
  EF --> OUT["Devices with home LSOA and e_i"]
```

## Software components

- PySpark with **Apache Sedona** spatial join on LSOA polygons.
- **h3-py** for resolution 10 cells.
- Reference tables: ONS LSOA 2021 boundaries and mid-year population, read from the Reference data bucket.

## Configuration and metadata

- Lookback: 4 weeks of presences (rolling).
- Night window: 22:00 to 06:00 Europe/London, DST-aware.
- Expansion factor capped at 70.0.
- Devices with no stable night cell get no home and are weighted 1.

> **To confirm:** the 4-week lookback.

## Low-level design

```mermaid
classDiagram
  class HomeStage {
    +apply(df, ctx) DataFrame
  }
  class HomeAssigner {
    +night_cell(presences) str
    +lsoa(cell) str
  }
  class ExpansionCalculator {
    +cap float
    +factor(lsoa_pop, sample_devices) float
  }
  class DeviceHome {
    +device_key
    +home_lsoa
    +e_i float
  }
  HomeStage --> HomeAssigner
  HomeStage --> ExpansionCalculator
  HomeStage ..> DeviceHome
```
