# MAP 2.0: 20 AI employees, ₹0 salary

**Setup mein help chahiye? Free call book karo:** https://calendar.google.com/calendar/appointments/schedules/AcZssZ2ZI6Dqh2h1_ZDYvYyeQvzmzxSRp9yCcr0mHPj0WDpbplw-pbnv-e_5B6NI8tjpjhDK8GYfs2ol

20 ready-to-import n8n workflows, organised like a company with 5 departments (4 agents each).
Each one uses Claude (Anthropic) as its brain. Every workflow has a yellow sticky note on the canvas with its own setup steps.

## Sales

| # | Agent | What it does |
|---|-------|--------------|
| 01 | **Lead Finder** | Searches Google Maps for businesses in your niche and city each morning, opens each website, and Claude writes a personal first line for your cold email. Saved to Google Sheets. |
| 02 | **WhatsApp Replier** | Replies to new WhatsApp leads within seconds and asks one qualifying question. Lead saved to Sheets. |
| 03 | **Lead Qualifier** | Leads from your form or ads come in by webhook. Claude labels them hot, warm or cold; hot leads send you a WhatsApp alert. |
| 04 | **Repeat-Order Bot** | Reads your Orders sheet and WhatsApps each customer a few days before their product runs out, so they re-order. |

## Support

| # | Agent | What it does |
|---|-------|--------------|
| 05 | **AI Receptionist** | Checks your Google Calendar and books a free slot from a WhatsApp message, then sends a reminder one day before. |
| 06 | **Missed-Call Rescuer** | When you miss a call, a friendly WhatsApp text-back goes out within seconds. Caller logged as a lead. |
| 07 | **Inbox Sorter** | Claude reads every new Gmail message: needs-reply gets a ready draft, the rest is labelled FYI. Nothing is sent automatically. |
| 08 | **FAQ Bot** | Answers common customer questions on WhatsApp from your own FAQ text; anything it is unsure about is passed to you. |

## Marketing

| # | Agent | What it does |
|---|-------|--------------|
| 09 | **SEO Page Team** | Five agents research competitors, find missing pages, write and edit them, and save WordPress drafts every night. |
| 10 | **1 Video → 5 Posts** | Paste a YouTube link: caption, LinkedIn post, X thread, Shorts hook and newsletter blurb, saved in Notion. |
| 11 | **Review Replier** | Fetches new Google reviews hourly and writes on-brand replies. Angry reviews are never auto-answered; you get a draft. |
| 12 | **Review Asker** | After a visit or order, asks happy customers for a Google review; unhappy feedback comes privately to you instead. |

## Finance

| # | Agent | What it does |
|---|-------|--------------|
| 13 | **Bill Reader** | Bill PDFs arriving in Gmail become Sheet rows: vendor, invoice no., date, amount, tax. |
| 14 | **Invoice Chaser** | Finds overdue invoices every night and sends reminders whose tone gets firmer the later the payment is. |
| 15 | **Statement AI** | Reads a bank statement PDF and categorises every transaction into a clean sheet. |
| 16 | **GST Clerk** | Turns sales/purchase invoices into a GST register sheet (GSTIN, taxable value, CGST/SGST/IGST). |

## Ops

| # | Agent | What it does |
|---|-------|--------------|
| 17 | **HR Screener** | Resume PDFs in Gmail are scored 0–10 against your job description; Shortlist or Reject row in Sheets. |
| 18 | **No-Show Stopper** | Confirms tomorrow's appointments on WhatsApp; cancellations are offered to the next person on the waitlist. |
| 19 | **Deadline Bot** | Checks your deadlines sheet daily and sends reminders before anything is due. |
| 20 | **Doc Chaser** | Tracks which documents each customer still owes you and politely follows up until they arrive. |

## Bonus

`00_BONUS_first_12_connected_one_canvas.json` is the original MAP reel: 12 agents connected on one canvas with a 👑 Manager that sends you a nightly WhatsApp report.

## How to import

1. Open n8n (n8n.cloud or self-hosted) → **Workflows → Add workflow**.
2. **⋯** menu (top right) → **Import from File** → pick a `.json` file.
3. Read the sticky note on the canvas and follow its setup steps.
4. Add your own credentials: **Anthropic (Claude)**, and as needed **Google Sheets**, **Gmail**, **WhatsApp Business Cloud**. These files contain no keys or IDs.
5. Replace every `YOUR_...` placeholder (sheet IDs, WhatsApp Phone Number ID, your number, etc.).
6. Click **Execute workflow** once with test data, check the result, then switch it to **Active**.

## Tips

- Start with one agent. Easiest first: **13 Bill Reader** (Gmail + Sheets + Claude).
- Point anything that sends messages at your own number or a draft until you trust it.
- Model: Claude nodes use `claude-sonnet-5-5`; switch in the Claude node if you like.

> **Setup mein help chahiye? Free call book karo:** https://calendar.google.com/calendar/appointments/schedules/AcZssZ2ZI6Dqh2h1_ZDYvYyeQvzmzxSRp9yCcr0mHPj0WDpbplw-pbnv-e_5B6NI8tjpjhDK8GYfs2ol

Free from **Kaamchor AI**.
