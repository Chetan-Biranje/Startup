# Authentication & Authorization Architecture (`auth.md`)

This document defines the security models, token lifecycles, and authorization mechanisms governing the Tech Startup platform.

---

## 1. Authentication Layer Overview

The platform uses a **Dual-Layer Authentication Strategy**:
1. **User / Dashboard Sessions:** Ephemeral JSON Web Tokens (JWT) signed via asymmetric RS256 with refresh-token rotation.
2. **Machine-to-Machine / API Access:** Cryptographically secure API Keys (`sk_live_...` / `sk_test_...`) hashed with SHA-256 at rest.

```
[ Developer / Client App ]
           │
     (HTTP Request with Bearer Token / API Key)
           │
           ▼
[ API Gateway / Cloudflare Edge ]
    ├── 1. Rate Limiting Check (Redis Sliding Window)
    ├── 2. Signature & Token Validation (RS256 / SHA-256 Hash Lookup)
    └── 3. RBAC Policy Enforcement (Read / Write / Admin)
           │
     (Authenticated Context Passed)
           ▼
[ Microservices / AI Agent Runtime / n8n Nodes ]
```

---

## 2. API Key Architecture & Vaulting

### Generation & Hashing
1. **Key Structure:** `sk_{env}_{32_char_entropy}` (e.g., `sk_live_8f3d1b9a2c4e6a7c8b0e1d2f3a4b5c6d`)
2. **Database Storage:** The raw key is displayed to the user **ONLY ONCE** upon creation. The database stores:
   - `key_id`: `key_abc123`
   - `key_prefix`: `sk_live_8f3d...` (First 12 characters for user display)
   - `hashed_secret`: `SHA256(raw_key + salt)`
   - `workspace_id`: `ws_987654`
   - `scopes`: `["agents:execute", "leads:read", "billing:view"]`
   - `last_used_at`: Timestamp

---

## 3. JWT Session Tokens (Dashboard & UI)

* **Access Token:**
  - Expiry: 15 minutes.
  - Signed using private RSA key (`RS256`).
  - Payload claims:
    ```json
    {
      "sub": "usr_12345",
      "email": "alex@startup.io",
      "workspace_id": "ws_98765",
      "role": "org:admin",
      "iss": "https://auth.yourstartup.io",
      "exp": 1730448900
    }
    ```
* **Refresh Token:**
  - Expiry: 30 days.
  - Stored in an `HttpOnly`, `SameSite=Strict`, `Secure` cookie.
  - Employs strict **Single-Use Refresh Token Rotation** (re-using an old refresh token invalidates all existing sessions immediately).

---

## 4. Role-Based Access Control (RBAC)

| Role | Permissions | Use Case |
|---|---|---|
| **Owner / Founder** | `*` (Full Admin, Billing, Delete Workspace, Secrets) | Startup Founder / Principal Engineer |
| **Developer / Admin** | `agents:*`, `api_keys:*`, `webhooks:*`, `logs:read` | Core Engineering & Ops Team |
| **Member / Analyst** | `agents:dispatch`, `leads:read`, `analytics:read` | Sales, Support & Marketing staff |
| **Service Account** | Scoped strictly to assigned MCP tools and webhooks | Automated CI/CD or 3rd-party bots |

---

## 5. Webhook Signature Verification (HMAC-SHA256)

To protect inbound and outbound webhooks from replay attacks and tampering:
1. Every webhook sends `X-Startup-Timestamp` and `X-Startup-Signature`.
2. Reject any timestamp older than 300 seconds (5 minutes).
3. Compute expected signature:
   ```javascript
   const crypto = require('crypto');
   const signature = crypto
     .createHmac('sha256', WEBHOOK_SIGNING_SECRET)
     .update(`${timestamp}.${rawBody}`)
     .digest('hex');
   ```
4. Perform timing-safe string comparison: `crypto.timingSafeEqual(expected, received)`.

