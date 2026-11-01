# Copilot Instructions

## Project shape

This repository is a library of n8n workflow exports and their setup/architecture documentation, not an application with a source build. The 200 numbered agents are spread across department folders and root-level orchestrators; three additional root JSON files provide the WhatsApp router and connected canvases, for 203 workflow JSON files total.

- `00_whatsapp_master_router.json` routes inbound events to other workflows. Its Execute Workflow nodes must use IDs from the imported target workflows.
- `50_ceo_agent.json` is the CEO interface (logical department 08); `100_tech_startup_autonomous_master_workflow.json` and the department workflows cover the wider automation catalog.
- Department workflows live in numbered folders (01-07 and 09-24); agent 51 is in Sales. The root-level connected canvases are separate importable workflow exports.
- `README.md` is the quick start; `SETUP.md` covers import and credentials; `ARCHITECTURE.md` and `tree.md` describe workflow relationships; `testing.md` is a proposed QA plan, not an implemented test suite.

## Build and test

There are no repository build, lint, or automated test commands: no project package manifest, test files, or GitHub Actions workflow is present. Do not assume the examples in `testing.md` can be run as-is.

To check one workflow, import its JSON into n8n, configure its credentials and `YOUR_...` placeholders from its Sticky Note, then execute it with controlled test data. Nodes can send messages or modify external services; use test destinations and test data.

## Workflow conventions

- Treat each root-level or department `.json` file as an n8n workflow export. Keep node names and `connections` entries aligned; Code nodes may refer to other nodes by name (for example, `$('Node Name')`).
- Preserve the export's node IDs, types, type versions, parameters, connections, settings, and active state unless the requested behavior requires a change.
- Workflow Sticky Notes are the per-workflow setup contract: keep their credential, sheet/tab, column, and placeholder instructions accurate when changing nodes.
- `YOUR_...` values are configuration placeholders, not n8n expressions. Keep static phone numbers, email addresses, and Google Sheets filter values as literals; use n8n expression syntax only for values that must be evaluated dynamically.
- Keep webhook method/path pairs unique across workflows intended to run together. WhatsApp Cloud API supports one webhook per Meta app; use the central router or separate apps/numbers for multiple WhatsApp-triggered workflows.
- When changing the router or a connected canvas, verify its dispatch targets and workflow IDs against the corresponding standalone agent exports.
- Update the relevant setup or architecture documentation when a workflow's integration contract or routing changes.
