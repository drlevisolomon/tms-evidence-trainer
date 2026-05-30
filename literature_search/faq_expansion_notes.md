# FAQ Expansion Notes

This artifact expands the `Patient FAQ` rows in `evidence_claims.csv` into technician-ready teaching material.

## Current Coverage

- 25 of 25 Patient FAQ claims have an expansion in `faq_expansions.json`.
- Each expansion includes:
  - deeper patient-facing explanation
  - technician teaching rationale
  - evidence note
  - at least 3 technician checklist items
  - at least 3 likely patient follow-up questions with suggested answers
  - PubMed PMID links back to the screened corpus

## Boundary

These are training scripts, not independent medical advice. Technician language should be reviewed against clinic policy, device manuals, prescriber preferences, and local scope-of-practice rules before release.

## Source Pattern

The expansion file intentionally reuses source PMIDs from the evidence claim registry instead of adding unsupported claims. For example:

- sensation/twitching: `33243615`, `19833552`
- caffeine: `41346487`, `36911138`, `34872405`
- sleep: `39756660`, `33243615`
- medications/safety: `33243615`, `19833552`, `28541649`
- course expectations: `17573044`, `28541649`, `27090022`
- mechanism and repeated-session rationale: `33243615`, `19833552`, `31901449`, `28541649`, `27090022`
- motor threshold: `33243615`, `41949547`, `42082007`
- common side effects, seizure risk, ear protection, and headache: `33243615`, `19833552`, `34133991`, `9474057`, `1549231`
- implants, special populations, mania, ECT comparison, and maintenance: `33243615`, `19833552`, `9803953`, `9918361`, `40865772`, `40429604`, `31901449`, `28541649`, `27090022`
