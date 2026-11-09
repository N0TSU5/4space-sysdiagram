Presences with each device's home LSOA and expansion factor attached.

## Payload

**Transport:** in-memory Spark DataFrame.

**WeightedPresence** (Presence fields, plus)

| Field | Type | Notes |
| --- | --- | --- |
| `home_lsoa` | string, optional | ONS LSOA 2021 code |
| `e_i` | float | At most 70.0 |
