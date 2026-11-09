Turns clean pings into presences for each device, in time order.

## Steps

- Group consecutive clean pings per device
- Break on a time gap above 20 min
- Break on a spatial step above 50 m
- Break on an anchor walk above 50 m
- Calculate the geographic medoid centroid
- Classify presence type and movement modality

## Classifications

- **Presence type:** `pass_by`, `short_presence`, `long_stay`, `very_long_stay`
- **Movement modality:** `stationary`, `pedestrian`, `non_pedestrian`

## Data flow

```mermaid
flowchart LR
  CP["Clean pings by device, time order"] --> SEG{"Break? gap over 20 min, step over 50 m, anchor walk over 50 m"}
  SEG -->|"new segment"| S["Presence segment"]
  S --> MED["Medoid centroid"]
  MED --> PT["Presence type by duration"]
  MED --> MM["Modality by speed"]
  PT & MM --> P["Presences"]
```

## Software components

- PySpark `applyInPandas` grouped by `device_key`, one device per task.
- A NumPy medoid function (point with the smallest summed distance to the rest).

## Configuration and metadata

- Breaks: 20 min gap, 50 m step, 50 m anchor walk.
- Presence type thresholds by duration: `pass_by`, `short_presence`, `long_stay`, `very_long_stay`.
- Modality by median speed: `stationary`, `pedestrian`, `non_pedestrian`.

> **To confirm:** the exact duration and speed cut-offs for each class.

## Low-level design

```mermaid
classDiagram
  class StayStage {
    +apply(df, ctx) DataFrame
  }
  class Segmenter {
    +segments(pings) List~Segment~
  }
  class Presence {
    +device_key
    +start
    +end
    +lat
    +lon
    +presence_type
    +modality
  }
  class PresenceClassifier {
    +type(duration) str
    +modality(speeds) str
  }
  StayStage --> Segmenter
  StayStage --> PresenceClassifier
  StayStage ..> Presence
```
