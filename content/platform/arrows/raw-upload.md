The user uploads raw data through Agora, straight into the company's bucket in Orion. Raw data never passes through Merlin.

Data supplied during company onboarding is already in Orion, so this step is optional for later Projects.

## Payload

**Transport:** Agora asks the Orion control API for a signed URL, then the browser uploads the file with `PUT` directly to Cloud Storage.

**Request: UploadRequest** (`POST /uploads`)

| Field | Type | Notes |
| --- | --- | --- |
| `project_id` | uuid | |
| `dataset` | string | Such as `raw_pings_2026` |
| `filename` | string | |
| `size_bytes` | integer | Up to 5 TB, resumable |
| `content_type` | string | Parquet, CSV or JSON |

**Reply: SignedUpload**

| Field | Type | Notes |
| --- | --- | --- |
| `url` | string | Resumable upload URL |
| `object` | string | `datasets/<dataset>/<date>/<filename>` |
| `expires_at` | timestamp | 15 minutes |

**Body:** the file's bytes.
