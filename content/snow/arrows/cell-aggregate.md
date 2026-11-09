Aggregates per space-time cell, before privacy checks. Still holds device counts that may be under 5.

## Payload

**Transport:** in-memory Spark DataFrame.

**CellAggregate**

| Field | Type | Notes |
| --- | --- | --- |
| `spacetime_key` | int64 | Gosper rank and time slot |
| `h3_res` | integer | 8, 9 or 10 |
| `table` | string | Which Gold table it feeds |
| `panel_devices` | integer | Distinct `device_key`s |
| `est_people` | float | Sum of `e_i` |
| `metrics` | columns | Dwell, composition and so on |
