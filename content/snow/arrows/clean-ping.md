Pseudonymised, filtered pings. Raw `device_id` and IP are gone from here on.

## Payload

**Transport:** in-memory Spark DataFrame.

**CleanPing**

| Field | Type | Notes |
| --- | --- | --- |
| `device_key` | string | HMAC of `device_id` |
| `ip_day_key` | string | HMAC of IP and date |
| `ts` | timestamp | |
| `lat` | double | |
| `lon` | double | |
| `accuracy` | float | At most 30 m |
