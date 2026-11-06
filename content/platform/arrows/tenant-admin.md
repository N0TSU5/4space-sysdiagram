Agora calls the Accounts API with the user's ID token for anything about people or Projects. Every other Agora request is checked here too.

## Payload

**Transport:** HTTPS, JSON, `Authorization: Bearer <IdToken>`.

**POST /invitations: InviteRequest**

| Field | Type | Notes |
| --- | --- | --- |
| `emails` | list of string | Up to 50 |
| `project_id` | uuid, optional | Omit for a company-only invite |
| `role` | `owner` \| `editor` \| `viewer` | Project role |

**POST /projects: CreateProjectRequest**

| Field | Type | Notes |
| --- | --- | --- |
| `name` | string | |
| `description` | string, optional | |

**GET /projects reply: list of ProjectSummary**

| Field | Type | Notes |
| --- | --- | --- |
| `id` | uuid | |
| `name` | string | |
| `status` | `onboarding` \| `planning` \| `creating` \| `ready` | |
| `my_role` | `owner` \| `editor` \| `viewer` | |
| `updated_at` | timestamp | |
