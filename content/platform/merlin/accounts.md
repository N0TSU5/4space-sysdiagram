Who can sign in, which company they belong to, and which Projects they can open. Every call from Agora into Merlin is checked here first.

## Steps

- **Sign in:** Identity Platform, one tenant per customer company.
- **Authorise:** the Accounts API checks the user's company and Project role.
- **Record:** companies, users, Projects and memberships live in Cloud SQL.

## Data flow

```mermaid
flowchart LR
  A["Agora sign-in"] -->|"email, SSO or email link"| I["Identity Platform tenant"]
  I -->|"ID token with company_id"| A
  A -->|"token on every request"| API["Accounts API"]
  API -->|"verify token"| I
  API <-->|"users, roles, Projects"| DB[("Accounts database")]
  API -->|"allow or deny"| M["Plan and research agents"]
  API -->|"new company"| O["Orion control API"]
```

## Tenant model

- **Company** = tenant. Own Identity Platform tenant, own Orion raw data bucket.
- **Project** belongs to one company.
- **Members** join a Project with a role: Owner, Editor or Viewer.
- Company admins invite users and create Projects.

## Low-level design

The contract every Merlin service uses to check access. The classes inside are in each child box.

```mermaid
classDiagram
  class AccountsClient {
    +authorise(token, project_id, action) AuthContext
    +me(token) UserProfile
  }
  class AuthContext {
    +user_id
    +company_id
    +project_id
    +role Role
    +can(action) bool
  }
  class Role {
    <<enumeration>>
    OWNER
    EDITOR
    VIEWER
  }
  class Action {
    <<enumeration>>
    VIEW
    ASK
    EDIT_PLAN
    APPROVE_PLAN
    MANAGE_MEMBERS
  }
  AccountsClient --> AuthContext
  AuthContext --> Role
  AuthContext ..> Action
```

- Shared as a small Python package, `fourthspace-auth`, used by the agents and the Accounts API.
- **Role → Action** mapping: Viewer can view and ask; Editor can also edit the Plan; Owner can also approve and manage members.
