# Architecture Decision Records (ADRs)

Key architectural decisions made for the Connected 51 AI Agents Automation Suite.

---

## ADR 001: Central Google Sheets as the Universal Enterprise Data Bus
* **Status:** Accepted
* **Context:** With 51 distinct workflows spanning 7 departments, point-to-point webhook communication would result in complex, fragile spaghetti connections.
* **Decision:** Use a single, standardized Google Spreadsheet as the central data bus. Workflows write their output to standard tabs (`Leads`, `Bookings`, `Invoices`, `Bills`, etc.) and trigger or read from those tabs asynchronously.
* **Consequences:** Highly observable, human-editable, zero database hosting cost, and allows the CEO Agent and Weekly Summary to easily aggregate company health in one place.

---

## ADR 002: Inbound WhatsApp Master Router Pattern
* **Status:** Accepted
* **Context:** Meta's WhatsApp Cloud API strictly allows only ONE webhook URL per WhatsApp Business phone number. Since multiple agents (Sales, Receptionist, FAQ, Complaints, HR Leave, CEO) listen to WhatsApp, separate webhooks cannot be registered directly with Meta.
* **Decision:** Implement `00_whatsapp_master_router.json`. It acts as the single entrypoint for Meta's webhook, detects if the sender is the business owner (routes to Agent 50 CEO), or uses an AI Classifier (Gemini 1.5 Flash) to dispatch customer messages to the appropriate department sub-workflow via n8n's `Execute Workflow` node.
* **Consequences:** One number handles customer sales, appointments, complaints, employee leaves, and owner queries seamlessly without collision.

---

## ADR 003: Multi-AI Brain Flexibility (Claude & Google Gemini)
* **Status:** Accepted
* **Context:** Claude 3.5 Sonnet offers high-level reasoning for complex drafting (proposals, SEO, CEO summaries), while Google Gemini 1.5 Flash offers low latency, high rate limits, and multilingual capabilities (Marathi, Hindi, English).
* **Decision:** Support both models interchangeably across the suite. Workflows default to Claude or Gemini 1.5 Flash depending on task speed and cost profile.
* **Consequences:** Maximum cost efficiency and superior multilingual conversational accuracy for Indian local businesses.

