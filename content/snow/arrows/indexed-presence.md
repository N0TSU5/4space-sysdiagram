Weighted presences with their 64-bit space-time key. They still hold `device_key`, so they stay inside Orion.

## Payload

**Transport:** in-memory Spark DataFrame.

**IndexedPresence** (WeightedPresence fields, plus)

| Field | Type | Notes |
| --- | --- | --- |
| `spacetime_key` | int64 | Gosper rank and time slot |
| `h3_res` | integer | 8, 9 or 10 |
| `slot_id` | string | Hourly, local time |
