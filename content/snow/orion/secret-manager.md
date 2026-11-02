GCP Secret Manager stores the secret salt key, `snow-hash-secret`.

`keyed_hash` (HMAC-SHA256) uses this key to:

- Pseudonymize `device_id` strings into `device_key` tokens
- Generate daily IP hashes (`ip_day_key`)
