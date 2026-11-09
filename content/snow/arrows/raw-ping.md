P1 reads one day's raw pings. This is the only arrow that carries personal data, and it stays inside Orion.

## Payload

**Transport:** Spark reading `gs://raw@datalake4us/pings/dt=<date>/`.

**RawPing** (main fields of 17)

| Field | Type | Notes |
| --- | --- | --- |
| `device_id` | string | Advertising ID, hashed in P1 |
| `timestamp` | timestamp | UTC |
| `latitude` | double | WGS84 |
| `longitude` | double | WGS84 |
| `horizontal_accuracy` | float | Metres |
| `altitude` | float | Metres |
| `ip_address` | string | Hashed per day in P1 |
| `os` | string | |
| `consent` | string | Only `granted` is kept |
