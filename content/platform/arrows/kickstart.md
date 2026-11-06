On approval, Merlin sends the verified pipeline code to Orion's job runner. It builds the Golden Datasets and the anonymised training data. Model training runs in Merlin.

## Payload

**Transport:** HTTPS `POST /jobs`, IAM-authenticated as the Plan agents' service account.

**PipelineJobSpec**

| Field | Type | Notes |
| --- | --- | --- |
| `project_id` | uuid | |
| `plan_version` | integer | Must be approved |
| `code` | CodeBundle | Wheel and entrypoint |
| `inputs` | list of string | Raw datasets |
| `gold_target` | string | Iceberg namespace in Merlin |
| `training_target` | string | Merlin training bucket path |
| `anonymisation` | AnonymisationSpec | Drop, hash, coarsen, k |
| `checkpoint_every` | string | Such as "each stage" |

**Reply: JobAccepted**

| Field | Type | Notes |
| --- | --- | --- |
| `job_id` | string | |
| `state` | `queued` | |
