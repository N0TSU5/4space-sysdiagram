The Accounts API reads and writes companies, users, Projects and memberships. Row-level security limits every query to the caller's company.

## Payload

**Transport:** Cloud SQL Python Connector, IAM auth, SQLAlchemy. Each transaction starts with `SET app.company_id`.

**ProjectMember row**

| Field | Type | Notes |
| --- | --- | --- |
| `project_id` | uuid | |
| `user_id` | uuid | |
| `role` | `owner` \| `editor` \| `viewer` | |
| `added_by` | uuid | |
| `added_at` | timestamp | |

**AuditEntry row** (written with every change)

| Field | Type | Notes |
| --- | --- | --- |
| `actor_id` | uuid | |
| `action` | string | Such as `member.role_changed` |
| `target` | string | Such as `project:<id>` |
| `at` | timestamp | |

The full table list is in the Accounts database box.
