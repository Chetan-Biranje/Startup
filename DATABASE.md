# Tech Startup Platform - Unified Database & Storage Specification

## 1. Storage Architecture Overview

The Tech Startup Platform utilizes a hybrid storage model:
1. **PostgreSQL 16 (Primary ACID Store)**: Organizations, user authentication, subscriptions, API keys, usage metering, and audit logs.
2. **Redis 7.2 (Cache & Queue Bus)**: Real-time rate limiting, BullMQ agent task queues, idempotency keys, and session contexts.
3. **Google Sheets Sync Layer**: Provides a no-code visual dashboard for non-technical founders and operations staff, synced bidirectionally via n8n.

---

## 2. PostgreSQL Relational Schemas

```sql
-- Organizations (Multi-tenant root)
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    plan_tier VARCHAR(50) DEFAULT 'startup', -- 'free', 'startup', 'scale', 'enterprise'
    stripe_customer_id VARCHAR(100) UNIQUE,
    stripe_subscription_id VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users & IAM
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(150),
    role VARCHAR(50) DEFAULT 'developer', -- 'owner', 'admin', 'developer', 'viewer'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Developer API Keys
CREATE TABLE api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    key_prefix VARCHAR(16) NOT NULL,
    key_hash VARCHAR(64) NOT NULL, -- SHA-256
    scopes TEXT[] DEFAULT ARRAY['agent:invoke'],
    is_active BOOLEAN DEFAULT TRUE,
    last_used_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Usage Metering Telemetry
CREATE TABLE usage_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    metric_name VARCHAR(50) NOT NULL, -- 'api_requests', 'llm_tokens', 'compute_seconds'
    quantity NUMERIC NOT NULL,
    idempotency_key VARCHAR(128) UNIQUE NOT NULL,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Agent Execution Traces
CREATE TABLE agent_executions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    correlation_id VARCHAR(64) NOT NULL,
    agent_id VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'RUNNING', -- 'RUNNING', 'SUCCESS', 'FAILED'
    input_payload JSONB,
    output_payload JSONB,
    tokens_consumed INT DEFAULT 0,
    duration_ms INT,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Security Audit Logs (SOC 2 Compliant)
CREATE TABLE security_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    actor_id VARCHAR(100) NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    ip_address INET,
    user_agent TEXT,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## 3. Redis Data Structures & TTL Policies

| Key Pattern | Data Structure | TTL | Purpose |
|---|---|---|---|
| `ratelimit:{key_prefix}:{window}` | String (Atomic Counter) | 60 seconds | Enforces API rate limits per minute. |
| `idempotency:{key}` | String (`COMPLETED`) | 24 hours | Guarantees exactly-once webhook and payment execution. |
| `session:{token_hash}` | Hash (User session data) | 7 days | Fast authenticated user state retrieval. |
| `agent:queue:{agent_id}` | Redis Stream / List | Monitored by BullMQ | Asynchronous job dispatch queue for AI agents. |
| `cache:metrics:mrr` | String (JSON) | 5 minutes | Cached MRR and churn metrics for fast dashboard rendering. |

---

## 4. Google Sheets Fast-View Data Bus

For rapid operations and live executive monitoring, the system mirrors core transactional data to Google Sheets tabs:

1. **`Leads`**: B2B customer leads, qualifying scores, and WhatsApp interaction status.
2. **`Invoices`**: Stripe and custom invoice records, due dates, and dunning status.
3. **`Incidents`**: Sentry errors, severity scores, and resolution owners.
4. **`Usage_Summary`**: Aggregated monthly consumption per client organization.
5. **`Executive_Daily`**: 9 PM daily executive brief with revenue, active agents, and uptime.
