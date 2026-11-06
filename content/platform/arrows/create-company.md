When a new company signs up, the Accounts API asks Orion to set up its raw data bucket, service account and hashing key.

## Payload

**Transport:** HTTPS `POST /companies`, IAM-authenticated as the Accounts API service account.

**Request: CreateCompany**

| Field | Type | Notes |
| --- | --- | --- |
| `company_id` | uuid | |
| `region` | string | Such as `europe-west2` |
| `retention_days` | integer | Raw data retention |

**Reply: CompanyResources**

| Field | Type | Notes |
| --- | --- | --- |
| `bucket` | string | `orion-raw-<company_id>` |
| `service_account` | string | The company's pipeline account |
| `hmac_key_secret` | string | Secret name, never the key |
