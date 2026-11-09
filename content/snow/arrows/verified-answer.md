Only answers that pass all 7 checks and Model Armor reach the user, with their audit trace.

## Payload

**Transport:** final server-sent event, also stored in BigQuery `snow_audit`.

**VerifiedAnswer**

| Field | Type | Notes |
| --- | --- | --- |
| `answer_id` | string | |
| `text` | string | |
| `sites` | list of SiteScore | |
| `layers` | list of MapLayer | |
| `tables` | list of table | For the studio panel |
| `audit` | AuditTrace | See below |

**AuditTrace**

| Field | Type | Notes |
| --- | --- | --- |
| `checks` | list of CheckResult | ID, name, pass or fail, reason |
| `model_armor` | string | Verdict |
| `evidence_ids` | list of string | |
| `at` | timestamp | |
