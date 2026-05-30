# TMS Evidence Trainer MVP

An evidence-backed training prototype for TMS technicians. The app turns `literature_search/evidence_claims.csv` into an interactive technician workspace with patient-facing FAQ answers, evidence filters, a session workflow checklist, and a source-linked claim registry.

## Run Locally

```bash
npm install
npm run dev -- --port 5173
```

Open `http://127.0.0.1:5173/`.

## Build

```bash
npm run build
```

## Data Source

The MVP reads claims directly from `literature_search/evidence_claims.csv` at build time. Each claim keeps the patient answer, technician detail, evidence strength, caveat, clinical action, and PubMed source PMIDs together so educational copy remains tied to its boundaries.

FAQ depth is stored in `literature_search/faq_expansions.json`. It adds deeper patient explanations, technician evidence notes, checklists, and likely follow-up answers for every `Patient FAQ` claim.

## Current Views

- `Ask`: searchable FAQ and patient-answer builder with module, audience, and evidence-strength filters.
- `Learn`: module sequence for moving from mechanism basics to safety, workflow, protocol literacy, and future measurement integrations.
- `Workflow`: room-ready session checklist plus escalation prompts from safety and workflow claims.
- `Evidence`: registry-style table for auditing claims and opening PubMed source links.
