P1 reads the hashing key once per run, keeps it in memory and never logs it.

## Payload

**Transport:** Secret Manager `accessSecretVersion`.

**HmacKey**

| Field | Type | Notes |
| --- | --- | --- |
| `name` | string | `snow-hash-secret` |
| `version` | string | `latest`, not rotated during the MVP |
| `data` | bytes | 256-bit key |
