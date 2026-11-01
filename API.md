# Tech Startup API Reference & Specifications

Comprehensive API architecture, REST endpoints, webhooks, rate limits, and data contracts for the Tech Startup & AI Agent Platform.

---

## 1. Global Conventions & Base URL

* **Production Base URL:** `https://api.yourstartup.io/v1`
* **Sandbox / Staging URL:** `https://staging-api.yourstartup.io/v1`
* **Protocol:** HTTPS (TLS 1.3 enforced)
* **Standard Headers:**
  ```http
  Authorization: Bearer sk_live_your_api_key_here
  Content-Type: application/json
  X-Workspace-ID: ws_123456789
  X-Request-ID: req_abc123xyz
  ```

---

## 2. Authentication & Authorization

All requests to protected endpoints require an API Key passed as a Bearer token in the `Authorization` header.
* Live Keys: `sk_live_...` (Read & Write with full workspace scope)
* Test Keys: `sk_test_...` (Sandbox environment, zero Stripe charges)
* Restricted Keys: `sk_sec_...` (Scoped to specific microservices/MCP tools)

---

## 3. Core REST Endpoints

### A. Workspaces & Provisioning
#### `POST /v1/workspaces`
Create a new developer workspace and provision initial resource quotas.
* **Request:**
  ```json
  {
    "name": "Acme Dev Team",
    "tier": "pro_saas",
    "region": "us-east-1",
    "notification_webhook": "https://acme.com/webhooks/startup"
  }
  ```
* **Response (201 Created):**
  ```json
  {
    "id": "ws_987654321",
    "name": "Acme Dev Team",
    "tier": "pro_saas",
    "monthly_token_quota": 5000000,
    "api_key": "sk_live_9a8b7c6d5e4f3g2h1",
    "status": "active",
    "created_at": "2026-11-01T06:00:00Z"
  }
  ```

### B. AI Agent Dispatch & Tool Execution
#### `POST /v1/agents/dispatch`
Invokes an autonomous multi-agent task or department sub-workflow.
* **Request:**
  ```json
  {
    "agent_id": "01_lead_finder",
    "model": "gemini-1.5-flash",
    "input_payload": {
      "query": "B2B SaaS companies in London",
      "max_leads": 25,
      "enrich_emails": true
    },
    "async": false
  }
  ```
* **Response (200 OK):**
  ```json
  {
    "task_id": "task_456789",
    "agent_id": "01_lead_finder",
    "status": "completed",
    "execution_time_ms": 1420,
    "tokens_consumed": 1840,
    "result": {
      "leads_found": 25,
      "export_url": "https://storage.yourstartup.io/exports/leads_456789.csv"
    }
  }
  ```

### C. Usage & Metering
#### `GET /v1/usage/current`
Returns live consumption metrics against the monthly plan limits.
* **Response (200 OK):**
  ```json
  {
    "workspace_id": "ws_987654321",
    "billing_cycle_start": "2026-11-01T00:00:00Z",
    "tokens_used": 142800,
    "tokens_limit": 5000000,
    "api_calls_count": 3120,
    "projected_overage_usd": 0.00
  }
  ```

---

## 4. Inbound & Outbound Webhooks

### A. Stripe Inbound Webhook (`/v1/webhooks/stripe`)
Listens for billing events to dynamically adjust workspace limits:
* `customer.subscription.created` -> Provision Pro/Enterprise tier.
* `invoice.payment_failed` -> Trigger Dunning Agent (Agent 66) for card update.
* `customer.subscription.deleted` -> Downgrade workspace to Free tier.

### B. Outbound Webhook Verification
Every outbound event dispatched to your webhook URL includes cryptographic HMAC signature headers:
```http
X-Startup-Signature: t=1698822000,v1=52571869e72d1fa2f53a9e7a042714732000f3564526eb4b80d95772782e4929
```
* **Verification formula:** `HMAC_SHA256(secret, timestamp + "." + payload)`

---

## 5. Rate Limiting & Quotas

| Tier | Requests / Min | Concurrency | Daily Token Cap |
|---|---|---|---|
| **Free Developer** | 60 req/min | 2 concurrent | 100,000 tokens |
| **Pro SaaS** | 1,000 req/min | 20 concurrent | 5,000,000 tokens |
| **Enterprise** | Custom (10,000+) | 100+ concurrent | Unlimited |

* When rate limited, the API returns HTTP `429 Too Many Requests` with header `Retry-After: <seconds>`.

---

## 6. Standard Error Codes

```json
{
  "error": {
    "code": "INVALID_API_KEY",
    "message": "The provided API key is invalid or has expired.",
    "request_id": "req_847194821",
    "documentation_url": "https://docs.yourstartup.io/errors/invalid-api-key"
  }
}
```
* `400 Bad Request`: Payload validation failed.
* `401 Unauthorized`: Missing or malformed Bearer token.
* `403 Forbidden`: Workspace suspended or permission denied.
* `404 Not Found`: Resource does not exist.
* `429 Too Many Requests`: Rate limit exceeded.
* `500 Internal Error`: Upstream LLM / worker exception.

