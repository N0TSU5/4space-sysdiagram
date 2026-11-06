The Plan orchestrator asks Orion about the raw data, and Orion replies without sending any of it.

## Payload

**Transport:** HTTPS `POST /profile`, IAM-authenticated as the Plan agents' service account.

**Request: ProfileRequest**

| Field | Type | Notes |
| --- | --- | --- |
| `company_id` | uuid | |
| `project_id` | uuid | |
| `datasets` | list of string | Dataset names in the raw bucket |

**Reply: list of DatasetProfile**

| Field | Type | Notes |
| --- | --- | --- |
| `dataset` | string | |
| `row_count` | integer | |
| `size_bytes` | integer | |
| `columns` | list of ColumnType | See below |

**ColumnType**

| Field | Type | Notes |
| --- | --- | --- |
| `name` | string | |
| `type` | string | Such as `string`, `timestamp`, `double` |
| `nullable` | boolean | |

There is no field for sample values, by design.
