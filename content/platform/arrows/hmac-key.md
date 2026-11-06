The pipeline reads the company's hashing key at run time. It's held in memory only and never written or logged.

## Payload

**Transport:** Secret Manager `accessSecretVersion`.

**HmacKey**

| Field | Type | Notes |
| --- | --- | --- |
| `name` | string | `hmac-key-<company_id>` |
| `version` | integer | |
| `data` | bytes | 256-bit key |
