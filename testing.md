# Tech Startup Platform - Testing & Quality Assurance Plan

## 1. Quality Assurance Strategy & Test Pyramid

The platform adopts a multi-layered verification strategy to guarantee high reliability, zero data corruption, and robust LLM agent execution.

```
                  /\
                 /  \      E2E Synthetic UI Tests (Playwright)
                /────\     10% of total suites
               /      \
              /────────\    Integration & Contract Tests (Supertest, Newman)
             /          \   30% of total suites
            /────────────\
           /              \  LLM Prompt Eval & Schema Verification
          /────────────────\ 20% of total suites
         /                  \
        /────────────────────\ Unit Tests (Jest / Vitest)
       /                      \ 40% of total suites
```

---

## 2. Unit & Integration Testing

### 2.1 Test Stack
- **Test Runner**: Jest / Vitest
- **Mocking**: MSW (Mock Service Worker) for network calls, `jest-mock` for internal services.
- **Database Fixtures**: `testcontainers-node` running ephemeral PostgreSQL and Redis instances.

### 2.2 Critical Path Unit Test Example (Stripe Metering)
```typescript
import { meterUsageEvent } from '../services/billing';
import { redisClient } from '../services/redis';

describe('Usage Metering Service', () => {
  beforeEach(async () => {
    await redisClient.flushall();
  });

  it('should reject duplicate idempotency keys without double charging', async () => {
    const payload = {
      customerId: 'cus_test_123',
      metric: 'llm_tokens',
      value: 1500,
      idempotencyKey: 'idem_unique_key_001'
    };

    const firstAttempt = await meterUsageEvent(payload);
    expect(firstAttempt.status).toBe('RECORDED');

    const secondAttempt = await meterUsageEvent(payload);
    expect(secondAttempt.status).toBe('DUPLICATE_IGNORED');
    expect(secondAttempt.recordedValue).toBe(0);
  });
});
```

---

## 3. n8n Workflow Automated Testing & Mocking

To test the 100 n8n workflows without charging real credit cards or spamming live WhatsApp numbers, test executions use mock fixtures:

### 3.1 Webhook Mock Dispatcher
```bash
# Execute local webhook trigger against Agent 00
curl -X POST http://localhost:5678/webhook-test/meta-whatsapp-inbound \
  -H "Content-Type: application/json" \
  -H "X-Hub-Signature-256: sha256=MOCK_TEST_SIGNATURE" \
  -d @tests/fixtures/whatsapp_sales_inbound.json
```

### 3.2 Mock Test Fixture (`tests/fixtures/whatsapp_sales_inbound.json`):
```json
{
  "object": "whatsapp_business_account",
  "entry": [{
    "id": "100234567890",
    "changes": [{
      "value": {
        "messaging_product": "whatsapp",
        "metadata": { "display_phone_number": "15551234567" },
        "contacts": [{ "profile": { "name": "Jane Developer" }, "wa_id": "919876543210" }],
        "messages": [{
          "from": "919876543210",
          "id": "wamid.HBgLOTE5ODc2NTQzMjEwFQIAEhgWM0VCMDFCRjQ1NkE3RUI4OTA=",
          "timestamp": "1730000000",
          "text": { "body": "Need pricing for 50 developer seats on the Scale plan." },
          "type": "text"
        }]
      },
      "field": "messages"
    }]
  }]
}
```

---

## 4. LLM Prompt & Agent Evaluation Benchmarks

All AI agent prompts (Sales bot, Code reviewer, SQL generator) undergo automated eval passes against a golden benchmark dataset.

### 4.1 Evaluation Criteria
1. **Schema Adherence**: Output must be 100% valid JSON matching the target schema.
2. **Hallucination Check**: Factual claims must map to ground-truth documents.
3. **Guardrails & Jailbreak Resistance**: Prompts must reject prompt injection attempts.
4. **Latency Ceiling**: P95 response time under 2.5 seconds.

### 4.2 Eval Runner Script (`npm run test:evals`):
```javascript
const { evaluateAgentResponse } = require('./eval_engine');

test('Agent 58 (PR Reviewer) flags hardcoded secrets', async () => {
  const mockDiff = `+ const apiKey = "sk_live_1234567890abcdef";`;
  const result = await evaluateAgentResponse('58_code_reviewer', { diff: mockDiff });

  expect(result.detectedVulnerabilities).toContain('HARDCODED_API_KEY');
  expect(result.status).toBe('REQUEST_CHANGES');
});
```

---

## 5. End-to-End Synthetic Browser Tests (Playwright)

Headless Playwright tests run nightly against the staging environment:

```typescript
import { test, expect } from '@playwright/test';

test('Full self-serve developer signup to API key generation', async ({ page }) => {
  await page.goto('https://staging.techstartup.io/signup');

  // Fill registration form
  await page.fill('input[name="email"]', `dev_${Date.now()}@example.com`);
  await page.fill('input[name="password"]', 'SuperSecretPass123!');
  await page.click('button[type="submit"]');

  // Navigate to API Keys section
  await page.waitForURL('**/dashboard');
  await page.click('nav >> text=API Keys');
  await page.click('button >> text=Create New Secret Key');

  // Verify key modal appears
  const keyInput = page.locator('input[readonly]');
  await expect(keyInput).toBeVisible();
  const keyValue = await keyInput.inputValue();
  expect(keyValue).toMatch(/^sk_test_[a-zA-Z0-9]{32}/);
});
```

---

## 6. High-Load & Stress Testing (k6)

Load test scenarios simulate high-concurrency spikes on the API Gateway and Webhook router.

### k6 Script (`tests/load/webhook_stress.js`):
```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 100 },   // Warm up to 100 RPS
    { duration: '1m', target: 1000 },   // Spike to 1,000 RPS
    { duration: '30s', target: 0 }      // Scale down
  ],
  thresholds: {
    http_req_duration: ['p(95)<300'],   // 95% of requests must complete < 300ms
    http_req_failed: ['rate<0.01']      // Less than 1% errors
  }
};

export default function () {
  const url = 'https://api-staging.techstartup.io/v1/billing/usage';
  const payload = JSON.stringify({
    customer_id: 'cus_stress_test',
    event_name: 'api_requests',
    value: 1
  });
  const params = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer sk_test_loadtesting'
    }
  };

  const res = http.post(url, payload, params);
  check(res, { 'status is 202': (r) => r.status === 202 });
  sleep(0.01);
}
```

---

## 7. CI/CD Automated Test Pipeline (GitHub Actions)

Every pull request triggers the automated test pipeline:
```yaml
name: Test Suite & Quality Gates

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npm run test:unit -- --coverage
      - run: npm run test:integration
      - run: npm run test:evals
      - name: Enforce Coverage Thresholds
        run: npx nyc check-coverage --lines 85 --functions 85 --branches 80
```

