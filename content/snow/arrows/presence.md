One row per stay or movement segment for each device.

## Payload

**Transport:** in-memory Spark DataFrame.

**Presence**

| Field | Type | Notes |
| --- | --- | --- |
| `device_key` | string | |
| `start` | timestamp | |
| `end` | timestamp | |
| `lat` | double | Medoid centroid |
| `lon` | double | |
| `presence_type` | `pass_by` \| `short_presence` \| `long_stay` \| `very_long_stay` | |
| `modality` | `stationary` \| `pedestrian` \| `non_pedestrian` | |
