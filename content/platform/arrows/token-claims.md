The Accounts API verifies each ID token against Identity Platform's public keys and reads its claims. It never sees passwords or SSO assertions.

## Payload

**Transport:** Firebase Admin SDK `verify_id_token`, using cached public keys.

**TokenClaims**

| Field | Type | Notes |
| --- | --- | --- |
| `uid` | string | Identity Platform user ID |
| `email` | string | |
| `tenant` | string | Must match the company's `idp_tenant_id` |
| `company_id` | uuid | |
| `company_role` | `admin` \| `member` | |
| `auth_time` | timestamp | Used to force re-login after 12 hours |
