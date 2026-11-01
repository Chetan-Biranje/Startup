# Step-by-Step Setup Guide: 51 AI Agents & Workflows

Follow this sequence to set up, connect, and activate your automated company.

---

## Phase 1: Folder & File Structure

The project has been organized into clear, functional department folders:

```
c:\Users\Mr Shadex\Startup\
├── 00_whatsapp_master_router.json             # Inbound Webhook Router
├── 00_BONUS_first_12_connected_one_canvas.json # 12 Agents All-in-One Canvas
├── 01_sales_lead_finder.json ... 50_ceo_agent.json # Root level workflows
├── 51_sales_whatsapp_gemini_lead_bot.json    # Gemini 1.5 Flash WhatsApp Agent
│
├── 01_Sales/                                  # 8 Sales Workflows (01-07, 51)
├── 02_Support/                                # 7 Support Workflows (08-14)
├── 03_Marketing/                              # 7 Marketing Workflows (15-21)
├── 04_Finance/                                # 7 Finance Workflows (22-28)
├── 05_HR/                                     # 7 HR Workflows (29-35)
├── 06_Operations/                             # 7 Operations Workflows (36-42)
├── 07_Research/                               # 7 Research Workflows (43-49)
├── 08_CEO/                                    # CEO Orchestrator (50) & Router (00)
│
└── _archive_MAP_2.0/                          # 17 Archived Duplicate MAP 2.0 files
```

---

## Phase 2: Create Master Google Sheet

1. Create a single new spreadsheet in Google Sheets named **`AI Business Master Database`**.
2. Create the 10 tabs defined in [`DATABASE.md`](file:///c:/Users/Mr%20Shadex/Startup/DATABASE.md):
   * `Leads`
   * `Bookings`
   * `Invoices`
   * `Bills`
   * `Content`
   * `Reviews`
   * `Tickets`
   * `Candidates`
   * `Tasks`
   * `Stock`
   * `Daily Log`
3. Add the column headers in Row 1 for each tab as specified in [`DATABASE.md`](file:///c:/Users/Mr%20Shadex/Startup/DATABASE.md).
4. Copy the Sheet ID from the URL (the string between `/d/` and `/edit`).

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
   * Import the department workflows from `01_Sales/`, `02_Support/`, etc. as needed.
   * In each workflow, paste your Sheet ID and WhatsApp Phone Number ID.
3. **Step 3: Connect to Router**
   * Copy the Workflow ID of `08_support_ai_receptionist`, `12_support_complaint_summariser`, `33_hr_leave_bot`, and `51_sales_whatsapp_gemini_lead_bot` into the respective nodes of `00_whatsapp_master_router.json`.
4. **Step 4: Meta Webhook URL**
   * Copy the Production Webhook URL from `00_whatsapp_master_router.json` and paste it into your Meta Developer WhatsApp Webhook settings.
5. **Step 5: Test & Activate**
   * Send a test WhatsApp message from your phone.
   * Verify the reply and check the row added to Google Sheets.
   * Toggle **Active** to ON.
