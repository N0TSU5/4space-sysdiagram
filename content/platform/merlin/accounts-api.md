The single place Merlin decides who may do what. Agora sends the user's ID token with every request, and the Accounts API checks it before any agent runs.

## Steps

- **Verify:** checks the ID token's signature, expiry and tenant.
- **Authorise:** looks up the user's role on the Project.
- **Manage:** invites users, creates Projects, changes roles.
- **Provision:** sets up a new company's tenant and Orion bucket.

## Data flow

```mermaid
flowchart LR
  A["Agora"] -->|"request + ID token"| V["Verify token"]
  V -->|"company_id, user"| R{"Role check"}
  DB[("Accounts database")] -->|"project_members"| R
  R -->|"allowed"| F["Forward to Plan or research agents"]
  R -->|"denied"| E["403"]
  A -->|"invite, create Project"| W["Admin actions"]
  W --> DB
  W -->|"audit entry"| DB
  N["New company signed"] --> P["Provision"]
  P -->|"create tenant"| IP["Identity Platform"]
  P -->|"create raw bucket"| O["Orion control API"]
  P --> DB
```

## Software components

- **Python 3.12, FastAPI**, on **Cloud Run**.
- **Firebase Admin SDK** to verify tokens and manage tenants.
- **Cloud SQL Python Connector** with IAM database auth, **SQLAlchemy** models.
- **SendGrid** for invitation emails.
- **OpenTelemetry** traces to Cloud Trace.

## Configuration and metadata

- Cloud Run: min 1 instance, internal ingress behind the external HTTPS load balancer, Cloud Armor rules.
- Own service account. Can call Orion's control API only to create company buckets.
- Every request sets the Postgres session variable `app.company_id`, which row-level security uses.
- Endpoints: `/me`, `/companies`, `/projects`, `/projects/{id}/members`, `/invitations`, `/authorise`.
- Agents call `/authorise` with the user's token and Project ID before acting.

## Low-level design

```mermaid
classDiagram
  class ProjectsRouter
  class MembersRouter
  class InvitationsRouter
  class AuthoriseRouter
  class TokenVerifier {
    +verify(token) Principal
  }
  class Authoriser {
    +check(principal, project_id, action) AuthContext
  }
  class UnitOfWork {
    +begin(company_id)
    +commit()
  }
  class Repository~T~ {
    <<abstract>>
    +get(id) T
    +add(entity)
    +list(filter) List~T~
  }
  class ProjectRepo
  class MembershipRepo
  class InvitationRepo
  class AuditRepo
  class Provisioner {
    +create_company(name, domain) Company
  }
  class Mailer {
    <<interface>>
    +send_invite(invitation)
  }
  class SendGridMailer
  class OrionClient {
    +create_company_bucket(company_id)
  }
  ProjectsRouter --> Authoriser
  MembersRouter --> Authoriser
  InvitationsRouter --> Authoriser
  AuthoriseRouter --> Authoriser
  Authoriser --> TokenVerifier
  Authoriser --> MembershipRepo
  Repository <|-- ProjectRepo
  Repository <|-- MembershipRepo
  Repository <|-- InvitationRepo
  Repository <|-- AuditRepo
  Repository --> UnitOfWork
  InvitationsRouter --> Mailer
  Mailer <|.. SendGridMailer
  Provisioner --> OrionClient
```

- **Routers** are thin. All rules live in `Authoriser` and the repositories.
- **UnitOfWork** opens each transaction and sets `app.company_id`, so row-level security always applies.
- **Repository** pattern keeps SQL out of the routers and makes them testable with fakes.
- Every write also adds an `AuditRepo` entry in the same transaction.
