The user edits the Plan directly or by talking to the chat. Merlin re-runs the affected design steps and verification, and sends back a new version.

When the user approves the Plan, Merlin starts creating the Project.

## Payload

**Transport:** HTTPS through Agora's server, with the user's ID token. Editors can patch; only Owners can approve.

**PlanPatch**

| Field | Type | Notes |
| --- | --- | --- |
| `project_id` | uuid | |
| `base_version` | integer | Rejected if not the latest |
| `ops` | list of JSON Patch operations | Such as add a column |
| `comment` | string, optional | Why, for the agents |

**PlanApproval**

| Field | Type | Notes |
| --- | --- | --- |
| `project_id` | uuid | |
| `version` | integer | Must be verified |
| `approved_by` | uuid | Taken from the token |
