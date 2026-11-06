The screens a user sees before and around a Project: signing in, picking a Project, and, for company admins, managing people and Projects.

## Steps

- **Sign in:** email first, then company SSO or an email link.
- **Projects:** lists the Projects the user is a member of.
- **Admin:** invite users, create Projects, set roles.

## Data flow

```mermaid
flowchart LR
  U["User"] --> E["Email field"]
  E -->|"tenant lookup"| API["Accounts API"]
  E --> S["SSO redirect or email link"]
  S -->|"Identity Platform"| T["ID token stored in memory"]
  T --> PL["Project list"]
  PL -->|"GET /projects"| API
  PL -->|"open"| W["Project workspace: chat, Plan, map, report"]
  T --> AD["Admin pages"]
  AD -->|"invites, roles, new Project"| API
```

## UI components

- **Sign-in card:** email input, "Continue" button, SSO redirect, email-link sent state, MFA code input.
- **Project switcher:** searchable list with each Project's status and the user's role.
- **Members table:** name, email, role dropdown, remove button.
- **Invite dialog:** email list, role, optional Project.
- **New Project dialog:** name and description, then opens the chat for onboarding.
- **Account menu:** company name, user, sign out.

## Software components

- **Next.js (React, TypeScript)** on Cloud Run, behind the HTTPS load balancer.
- **shadcn/ui** components with **Tailwind CSS**.
- **Firebase Auth JS SDK** for sign-in, **TanStack Query** for API calls.

> **To confirm:** Agora's frontend stack. Next.js with shadcn/ui is assumed here and in the other Agora boxes.

## Low-level design

```mermaid
classDiagram
  class AuthProvider {
    <<context>>
    +user
    +idToken()
    +signOut()
  }
  class SignInPage {
    <<component>>
    -step EmailStep or SsoStep or LinkSent or MfaStep
  }
  class EmailStep {
    <<component>>
  }
  class MfaStep {
    <<component>>
  }
  class ProjectSwitcher {
    <<component>>
    +projects
    +onOpen(id)
  }
  class AdminLayout {
    <<component>>
  }
  class MembersTable {
    <<component>>
  }
  class InviteDialog {
    <<component>>
  }
  class NewProjectDialog {
    <<component>>
  }
  class AccountsApi {
    +me()
    +projects()
    +invite(input)
    +setRole(projectId, userId, role)
    +createProject(input)
  }
  class AuthClient {
    +start(email)
    +idToken()
  }
  AuthProvider --> AuthClient
  SignInPage --> EmailStep
  SignInPage --> MfaStep
  SignInPage ..> AuthProvider
  ProjectSwitcher ..> AccountsApi
  AdminLayout --> MembersTable
  AdminLayout --> InviteDialog
  AdminLayout --> NewProjectDialog
  MembersTable ..> AccountsApi
  AccountsApi ..> AuthProvider
```

- **AuthProvider** is a React context. Every component gets the user and token from it.
- **AccountsApi** is one typed client class that adds the token to every call. Components use it through TanStack Query hooks.
- **SignInPage** is a small state machine: email, then SSO or email link, then MFA.
