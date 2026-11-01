# Step-by-Step Setup Guide: n8n Workflows

Follow this sequence to set up, connect, and activate your automated company.

---

## Phase 1: Workflow Files

```
c:\Users\Mr Shadex\Startup\
├── 00_whatsapp_master_router.json
├── 00_BONUS_first_12_connected_one_canvas.json
├── 00_SUPREME_ENTERPRISE_TITAN_CONNECTED_CANVAS.json
├── 50_ceo_agent.json
├── 100_tech_startup_autonomous_master_workflow.json
├── 01_Sales/ ... 07_Research/
└── 09_DevOps_Cloud_Infra/ ... 24_Chaos_Engineering_Disaster_Recovery/
```

There are 203 workflow JSON files: 200 numbered agent workflows and three root-level router/canvas workflows. Department 08 (CEO) is represented by the root-level `50_ceo_agent.json`; it has no separate folder.

---

## Phase 2: Create Master Google Sheet

1. Create a single new spreadsheet in Google Sheets named **`AI Business Master Database`**.
2. Create the core tabs defined in [`DATABASE.md`](file:///c:/Users/Mr%20Shadex/Startup/DATABASE.md): `Leads`, `Invoices`, `Incidents`, `Usage_Summary`, and `Executive_Daily`.
3. Check each workflow's sticky note and Google Sheets nodes for any additional tabs and columns it requires; add those before activating the workflow.
4. Add the column headers in Row 1 for each tab as specified in [`DATABASE.md`](file:///c:/Users/Mr%20Shadex/Startup/DATABASE.md) and the relevant workflow setup notes.
5. Copy the Sheet ID from the URL (the string between `/d/` and `/edit`).

---

## Phase 3: Setup Credentials in n8n

Open your n8n dashboard and configure:
1. **Google Gemini PaLM API** (from [Google AI Studio](https://aistudio.google.com/)) or **Anthropic**.
2. **Google Sheets OAuth2** (connect your Google account).
3. **WhatsApp Business Cloud API** (from [Meta Developers](https://developers.facebook.com/)).

---

## Phase 4: Import and Activate in Sequence

1. **Step 1: Router & CEO**
   * Import [`00_whatsapp_master_router.json`](file:///c:/Users/Mr%20Shadex/Startup/00_whatsapp_master_router.json).
   * Import [`50_ceo_agent.json`](file:///c:/Users/Mr%20Shadex/Startup/50_ceo_agent.json).
2. **Step 2: Department Workflows**
   * Import the workflows from the relevant department folders (for example, `01_Sales/` and `02_Support/`) as needed.
   * In each workflow, paste your Sheet ID and WhatsApp Phone Number ID.
3. **Step 3: Connect to Router**
   * Copy the imported Workflow IDs for Agent 50 (CEO), Agent 08 (AI Receptionist), Agent 12 (Complaint Summariser), Agent 33 (Leave Bot), and Agent 51 (Gemini Sales Lead Bot) into their matching Execute Workflow nodes in `00_whatsapp_master_router.json`.
4. **Step 4: Meta Webhook URL**
   * Copy the Production Webhook URL from `00_whatsapp_master_router.json` and paste it into your Meta Developer WhatsApp Webhook settings.
5. **Step 5: Test & Activate**
   * Send a test WhatsApp message from your phone.
   * Verify the reply and check the row added to Google Sheets.
   * Toggle **Active** to ON.
