# Model Context Protocol (MCP) Server Specification

## 1. Overview & Protocol Standard

The Tech Startup Platform integrates the **Model Context Protocol (MCP)** (JSON-RPC 2.0) to give AI agents standard, secure, and bidirectional access to development tools, databases, billing systems, and cloud infrastructure.

```
┌─────────────────────────────────┐
│     AI Clients / Agents         │
│  Claude / Gemini / Antigravity  │
└────────────────┬────────────────┘
                 │ JSON-RPC 2.0 (stdio / SSE / HTTPS)
                 ▼
┌─────────────────────────────────┐
│       Tech Startup MCP Hub      │
│     (Agent 71 Router & Gate)    │
└────────────────┬────────────────┘
                 │
  ┌──────────────┼──────────────┬──────────────┐
  ▼              ▼              ▼              ▼
[Postgres]   [Stripe API]   [GitHub SDK]   [Kubernetes]
```

---

## 2. Supported Transport Modes

| Transport | Endpoint / Command | Use Case | Auth Method |
|---|---|---|---|
| **stdio** | `node ./mcp/server.js` | Local CLI, Claude Desktop, Antigravity Agent | Local OS process boundary |
| **Server-Sent Events (SSE)** | `https://api.techstartup.io/mcp/sse` | Web dashboard, real-time streaming tools | Bearer JWT / API Key |
| **HTTP POST (JSON-RPC 2.0)** | `https://api.techstartup.io/mcp/rpc` | Standard webhook and asynchronous tool invocations | Bearer API Key (`sk_live_...`) |

---

## 3. Core Tool Definitions & Schemas

### 3.1 `database_query`
Executes safe, parameterized queries against read-only or read-write PostgreSQL tenant pools.

```json
{
  "name": "database_query",
  "description": "Execute a parameterized SQL query against the tenant database. Mutations require write scope.",
  "parameters": {
    "type": "object",
    "properties": {
      "query": {
        "type": "string",
        "description": "The SQL query text with parameter placeholders ($1, $2)."
      },
      "params": {
        "type": "array",
        "items": { "type": ["string", "number", "boolean", "null"] },
        "description": "Array of parameters bound safely to the SQL query."
      },
      "read_only": {
        "type": "boolean",
        "description": "Set to true to force execution against read-replica with transaction abort on write.",
        "default": true
      }
    },
    "required": ["query", "params"]
  }
}
```

### 3.2 `stripe_meter_event`
Reports real-time usage consumption events directly to the billing metering pipeline.

```json
{
  "name": "stripe_meter_event",
  "description": "Report a billable consumption event for metered customer plans.",
  "parameters": {
    "type": "object",
    "properties": {
      "customer_id": {
        "type": "string",
        "description": "Stripe Customer ID (cus_xxx)."
      },
      "event_name": {
        "type": "string",
        "enum": ["api_requests", "llm_tokens", "compute_seconds", "active_agents"],
        "description": "Name of the metered metric."
      },
      "value": {
        "type": "number",
        "description": "Quantity consumed in this event."
      },
      "idempotency_key": {
        "type": "string",
        "description": "Unique UUID to prevent double-charging."
      }
    },
    "required": ["customer_id", "event_name", "value", "idempotency_key"]
  }
}
```

### 3.3 `github_pr_action`
Performs code review, merges, or triggers testing on GitHub pull requests.

```json
{
  "name": "github_pr_action",
  "description": "Automate GitHub Pull Request actions: review, post comments, or merge.",
  "parameters": {
    "type": "object",
    "properties": {
      "repo": {
        "type": "string",
        "description": "Repository in format owner/repo."
      },
      "pr_number": {
        "type": "integer",
        "description": "Pull Request number."
      },
      "action": {
        "type": "string",
        "enum": ["review_approve", "review_request_changes", "comment", "merge"],
        "description": "Action to perform on PR."
      },
      "body": {
        "type": "string",
        "description": "Review comment body or commit message."
      }
    },
    "required": ["repo", "pr_number", "action"]
  }
}
```

### 3.4 `docker_container_run`
Executes untrusted or dynamic code in an ephemeral gVisor/Firecracker sandbox.

```json
{
  "name": "docker_container_run",
  "description": "Run Python or Node.js code in a sandboxed, network-restricted container.",
  "parameters": {
    "type": "object",
    "properties": {
      "runtime": {
        "type": "string",
        "enum": ["python3.11", "nodejs20"],
        "description": "Sandboxed runtime environment."
      },
      "script_content": {
        "type": "string",
        "description": "Executable code to evaluate."
      },
      "timeout_seconds": {
        "type": "integer",
        "default": 15,
        "maximum": 60
      }
    },
    "required": ["runtime", "script_content"]
  }
}
```

---

## 4. MCP Resources & Dynamic Prompts

### 4.1 Exposed Resources
Clients can read live platform contexts via standardized resource URIs:
- `techstartup://metrics/live-mrr`: Real-time MRR, active subscribers, and churn.
- `techstartup://logs/recent-errors`: Last 50 critical system errors from Sentry.
- `techstartup://infra/health`: Cluster health, pod CPU/memory, and queue backlog.

### 4.2 Resource Reading Example:
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "resources/read",
  "params": {
    "uri": "techstartup://metrics/live-mrr"
  }
}
```

---

## 5. Client Configuration Guide

### 5.1 Claude Desktop Configuration
Add the following to your Claude Desktop config (`claude_desktop_config.json`):
```json
{
  "mcpServers": {
    "techstartup-platform": {
      "command": "node",
      "args": ["c:/Users/Mr Shadex/Startup/mcp/server.js"],
      "env": {
        "TECH_STARTUP_API_KEY": "sk_live_prod_abc123456789",
        "NODE_ENV": "production"
      }
    }
  }
}
```

### 5.2 Antigravity / Cursor Configuration
```json
{
  "name": "TechStartupHub",
  "url": "https://api.techstartup.io/mcp/sse",
  "headers": {
    "Authorization": "Bearer sk_live_prod_abc123456789"
  }
}
```

---

## 6. Security, Rate Limiting & Scope Verification

1. **Role-Based Scope Checks**:
   - Every MCP tool call checks the caller's API key scope:
     - `database_query` with writes requires `db:write`.
     - `docker_container_run` requires `compute:sandbox`.
     - `stripe_meter_event` requires `billing:meter`.
2. **Execution Quotas**:
   - Maximum 120 tool executions per minute per tenant.
   - Any tool execution exceeding 60 seconds is automatically killed with a SIGKILL timeout.

