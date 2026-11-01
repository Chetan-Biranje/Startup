# Integrations & Credentials Guide

To operate the 51 AI Agents, configure the following external credentials in n8n.

---

## 1. AI Language Models (The Brains)

### A. Google Gemini (PaLM API)
* **Used by:** `00 WhatsApp Master Router`, `51 WhatsApp AI Lead Bot` (can be used for all 51 workflows).
* **How to get:**
  1. Visit [Google AI Studio](https://aistudio.google.com/).
  2. Click **Create API Key**.
  3. In n8n, create credential: **Google Gemini(PaLM) Api**.
  4. Paste API key.

### B. Anthropic Claude
* **Used by:** Default MAP 3.0 nodes (`claude-sonnet-5-5` or `claude-3-5-sonnet`).
* **How to get:**
  1. Go to [Anthropic Console](https://console.anthropic.com/).
  2. Create an API key in Account Settings.
  3. In n8n, create credential: **Anthropic** and paste key.

---

## 2. Meta WhatsApp Business Cloud API

* **Used by:** `00 Master Router`, `02 WA Replier`, `05 Follow-up`, `08 Receptionist`, `20 Broadcaster`, `28 Cash Report`, `50 CEO Agent`, `51 Gemini Bot`.
* **Setup Steps:**
  1. Go to [Meta for Developers](https://developers.facebook.com/).
  2. Create an app -> Select **Business** -> Add **WhatsApp** product.
  3. Under **API Setup**:
     - Copy **Temporary Access Token** (or create Permanent System User Token).
     - Copy **Phone Number ID**.
     - Copy **WhatsApp Business Account ID (WABA ID)**.
  4. Under **Configuration**:
     - Webhook URL: Enter your n8n Production Webhook URL from `00_whatsapp_master_router.json`.
     - Verify Token: Enter any random secret string (e.g. `MY_SECURE_TOKEN_2026`).
     - Webhook Fields: Check `messages`.
  5. In n8n, create credential: **WhatsApp Business Cloud API** with your Token.

---

## 3. Google Workspace (Sheets, Gmail, Calendar, Drive, Docs)

* **Used by:** Central Database (`DATABASE.md`), `10 Inbox Sorter`, `08 AI Receptionist`, `04 Proposal Writer`.
* **Setup Steps:**
  1. Go to [Google Cloud Console](https://console.cloud.google.com/).
  2. Create a project and enable:
     - Google Sheets API
     - Google Drive API
     - Google Calendar API
     - Gmail API
     - Places API (New) (for Agent 01 Lead Finder)
  3. Under **OAuth Consent Screen**, configure external app with email scopes.
  4. Under **Credentials**, create OAuth 2.0 Client ID (Web Application):
     - Redirect URI: `https://<YOUR_N8N_INSTANCE>/rest/oauth2-credential/callback`
  5. In n8n, connect **Google Sheets OAuth2 API**, **Gmail OAuth2 API**, **Google Calendar OAuth2 API**.

---

## 4. Telegram Bot API (Optional Alternative Channel)

* **Used by:** `50 CEO Agent`, `27 Expense Categoriser`.
* **Setup Steps:**
  1. In Telegram, chat with `@BotFather`.
  2. Run `/newbot` and copy the Bot Token.
  3. Chat with `@userinfobot` to get your numeric Chat ID.
  4. In n8n, create credential: **Telegram API** with your Bot Token.

---

## 5. Summary of Placeholders to Replace

Search (`Ctrl + F`) in the imported workflows for these placeholder tokens:
* `YOUR_SHEET_ID` / `YOUR_GOOGLE_SHEET_URL` ➔ Master Google Sheet ID.
* `YOUR_PHONE_NUMBER_ID` ➔ Meta WhatsApp Phone Number ID.
* `YOUR_OWNER_WHATSAPP_NUMBER` ➔ 91XXXXXXXXXX (Owner WhatsApp with country code, no +).
* `YOUR_BUSINESS_NAME` ➔ Name of your company/brand.

