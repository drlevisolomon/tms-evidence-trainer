# Screening Summary

Screening method: deterministic title, publication-type, query-lane, and module-rule screening over the full PubMed corpus. This is a complete first-pass screen of every PMID in `pubmed_records.csv`, with priority tiers designed for claim extraction and later manual QA.

Total screened records: 27325

## Screening Decisions

- `include_targeted_extraction`: 12606
- `include_claim_extraction`: 5570
- `background_index`: 4727
- `exclude_low_priority`: 4422

## Priority Tiers

- `1`: curated anchor source for immediate claim extraction
- `2`: review, guideline, consensus, or meta-analysis source for claim extraction
- `3`: clinical trial, protocol, safety, state-factor, or technician workflow source for targeted extraction
- `4`: background mechanism, protocol, or measurement source retained for lookup
- `5`: excluded or low-priority for this training-platform scope

- Priority `1`: 34
- Priority `2`: 5536
- Priority `3`: 12606
- Priority `4`: 4727
- Priority `5`: 4422

## Module Assignments

- `protocol_literacy`: 12991
- `mechanisms`: 12495
- `technician_workflow`: 10771
- `patient_faq_adherence`: 8093
- `state_factors`: 7109
- `guidelines_reviews`: 5918
- `safety_side_effects`: 5071
- `measurement_expansion`: 4260

## Caveat

This pass proves that every PubMed record has been triaged, not that every article has undergone full-text systematic-review adjudication. The claim table uses curated anchor and high-priority sources for training content, while lower-priority records remain searchable background evidence.
