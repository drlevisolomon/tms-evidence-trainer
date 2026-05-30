# Completion Audit

Objective: complete screening and claim extraction for the TMS technician education literature corpus.

Audit date: 2026-05-29

## Requirements And Evidence

1. Full corpus preserved from the initial PubMed search.
   - Evidence: `pubmed_records.csv` contains 27,325 article records.

2. Every record screened.
   - Evidence: `screened_records.csv` contains 27,325 screened rows with matching PMIDs to `pubmed_records.csv`.
   - Validation: `python3 scripts/validate_literature_artifacts.py`.

3. Screening decisions and source queues produced.
   - Evidence: `screening_summary.md`, `claim_extraction_sources.csv`, and `targeted_extraction_sources.csv`.
   - Counts: 5,570 priority claim-extraction sources, 12,606 targeted follow-up sources, 4,727 background records, and 4,422 low-priority/excluded records.

4. Anchor abstracts fetched for claim extraction.
   - Evidence: `pubmed_anchor_abstracts.csv` contains 34 rows matching `pubmed_anchor_sources.csv`.

5. Claim-level extraction completed for the training platform scope.
   - Evidence: `evidence_claims.csv` contains 69 structured, source-linked claims across all planned modules.
   - Modules covered: mechanisms, safety and side effects, patient FAQ, technician workflow, protocol literacy, and future fNIRS/EEG/qEEG/TMS-EEG expansion.

6. Patient-facing and technician-facing synthesis drafts produced.
   - Evidence: `patient_faq_claims.md` and `technician_workflow_claims.md`.

7. Source coverage verified.
   - Evidence: `claim_source_coverage.md`.
   - Result: every claim source PMID is present in `pubmed_records.csv`.

8. Scripts compile and artifacts validate.
   - Evidence: `python3 -m py_compile scripts/*.py` completed successfully.
   - Evidence: `python3 scripts/validate_literature_artifacts.py` completed successfully.

## Completion Boundary

This completes the requested screening and claim extraction phase for the available PubMed corpus. It does not claim full-text systematic-review adjudication of every article, institution-only database coverage, FDA/manufacturer manual integration, or final clinician-approved training copy. Those are separate downstream phases.
