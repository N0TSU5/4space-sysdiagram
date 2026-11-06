The user signs in through their company's Identity Platform tenant and gets back a short-lived ID token.

## Payload

**Transport:** Firebase Auth JS SDK over HTTPS to Identity Platform.

**Request: SignInStart**

| Field | Type | Notes |
| --- | --- | --- |
| `email` | string | Used to find the tenant |
| `tenant_id` | string | From the Accounts API tenant lookup |
| `provider` | `saml` \| `oidc` \| `email_link` | Set per tenant |
| `mfa_code` | string, optional | TOTP, on the second step |

**Reply: IdToken** (a signed JWT, these are its claims)

| Field | Type | Notes |
| --- | --- | --- |
| `sub` | string | Identity Platform user ID |
| `email` | string | |
| `firebase.tenant` | string | The company's tenant |
| `company_id` | uuid | Custom claim |
| `company_role` | `admin` \| `member` | Custom claim |
| `exp` | timestamp | 1 hour after issue |
