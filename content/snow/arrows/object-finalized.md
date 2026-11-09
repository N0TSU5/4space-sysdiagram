When Terrabite finishes a day's delivery, Cloud Storage sends a notification for the `_SUCCESS` marker.

## Payload

**Transport:** GCS Pub/Sub notification, topic `snow-raw-arrivals`.

**ObjectFinalized**

| Field | Type | Notes |
| --- | --- | --- |
| `bucket` | string | `raw@datalake4us` |
| `name` | string | `pings/dt=YYYY-MM-DD/_SUCCESS` |
| `eventType` | string | `OBJECT_FINALIZE` |
| `generation` | string | |
| `timeCreated` | timestamp | |
