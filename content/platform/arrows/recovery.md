When a job fails, recovery agents read the failure from Orion, fix the code or configuration, and restart from the nearest checkpoint.

## Payload

**Transport:** Pub/Sub topic `orion-job-events` to Merlin, then HTTPS `POST /jobs/{id}/restart` back.

**JobEvent**

| Field | Type | Notes |
| --- | --- | --- |
| `job_id` | string | |
| `project_id` | uuid | |
| `state` | `running` \| `succeeded` \| `failed` | |
| `stage` | string | Failing stage |
| `error` | string | Message, no data values |
| `last_checkpoint` | string | |
| `log_ref` | string | Cloud Logging query |

**RestartRequest**

| Field | Type | Notes |
| --- | --- | --- |
| `from_checkpoint` | string | |
| `patched_code` | CodeBundle, optional | Must be re-verified |
| `reason` | string | |
