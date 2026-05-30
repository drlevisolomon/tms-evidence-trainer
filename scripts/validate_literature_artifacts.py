#!/usr/bin/env python3
"""Validate screening and claim extraction artifacts."""

from __future__ import annotations

import csv
import json
from pathlib import Path


PROJECT_ROOT = Path(__file__).resolve().parents[1]
LIT_DIR = PROJECT_ROOT / "literature_search"


def read_csv(name: str) -> list[dict[str, str]]:
    with (LIT_DIR / name).open(newline="", encoding="utf-8") as handle:
        return list(csv.DictReader(handle))


def require(condition: bool, message: str) -> None:
    if not condition:
        raise AssertionError(message)


def main() -> int:
    records = read_csv("pubmed_records.csv")
    screened = read_csv("screened_records.csv")
    claim_sources = read_csv("claim_extraction_sources.csv")
    targeted_sources = read_csv("targeted_extraction_sources.csv")
    claims = read_csv("evidence_claims.csv")
    faq_expansions = json.loads((LIT_DIR / "faq_expansions.json").read_text(encoding="utf-8"))
    anchors = read_csv("pubmed_anchor_sources.csv")
    abstracts = read_csv("pubmed_anchor_abstracts.csv")

    record_pmids = {row["pmid"] for row in records}
    screened_pmids = {row["pmid"] for row in screened}
    require(len(records) == 27_325, f"Expected 27,325 PubMed records, found {len(records)}")
    require(len(screened) == len(records), "Screened row count does not match PubMed records")
    require(screened_pmids == record_pmids, "Screened PMID set does not match PubMed records")
    require(all(row["screening_decision"] for row in screened), "Missing screening decision")
    require(all(row["priority"] in {"1", "2", "3", "4", "5"} for row in screened), "Invalid priority")

    claim_decisions = [row for row in screened if row["screening_decision"] == "include_claim_extraction"]
    targeted_decisions = [row for row in screened if row["screening_decision"] == "include_targeted_extraction"]
    require(len(claim_sources) == len(claim_decisions), "Claim-source queue count mismatch")
    require(len(targeted_sources) == len(targeted_decisions), "Targeted-source queue count mismatch")

    expected_modules = {
        "Mechanisms",
        "Safety and Side Effects",
        "Patient FAQ",
        "Technician Workflow",
        "Protocol Literacy",
        "Future Expansion: fNIRS, EEG, qEEG, TMS-EEG",
    }
    claim_modules = {row["module"] for row in claims}
    require(expected_modules <= claim_modules, "Claim table is missing one or more expected modules")
    require(len(claims) >= 60, f"Expected at least 60 extracted claims, found {len(claims)}")
    for row in claims:
        for field in [
            "claim_id",
            "module",
            "question",
            "claim",
            "patient_answer",
            "technician_detail",
            "evidence_strength",
            "source_pmids",
            "clinical_action",
            "caveat",
        ]:
            require(row[field].strip(), f"Claim {row.get('claim_id')} missing {field}")
        for pmid in [item.strip() for item in row["source_pmids"].split(";") if item.strip()]:
            require(pmid in record_pmids, f"Claim {row['claim_id']} source PMID missing from corpus: {pmid}")

    faq_claims = [row for row in claims if row["module"] == "Patient FAQ"]
    require(len(faq_claims) >= 25, f"Expected at least 25 Patient FAQ claims, found {len(faq_claims)}")
    claim_source_pmids = {
        row["claim_id"]: {item.strip() for item in row["source_pmids"].split(";") if item.strip()}
        for row in faq_claims
    }
    faq_ids = {row["claim_id"] for row in faq_claims}
    expansion_ids = {row.get("claim_id") for row in faq_expansions}
    require(faq_ids == expansion_ids, "FAQ expansion coverage does not match Patient FAQ claim IDs")
    for row in faq_expansions:
        claim_id = row.get("claim_id")
        for field in [
            "expanded_patient_answer",
            "why_it_matters",
            "technician_evidence_note",
            "technician_checklist",
            "follow_ups",
            "evidence_pmids",
        ]:
            require(row.get(field), f"FAQ expansion {claim_id} missing {field}")
        require(len(row["technician_checklist"]) >= 3, f"FAQ expansion {claim_id} needs at least 3 checklist items")
        require(len(row["follow_ups"]) >= 3, f"FAQ expansion {claim_id} needs at least 3 follow-up answers")
        for follow_up in row["follow_ups"]:
            for field in ["question", "answer", "route_when"]:
                require(follow_up.get(field), f"FAQ expansion {claim_id} follow-up missing {field}")
        for pmid in row["evidence_pmids"]:
            require(pmid in record_pmids, f"FAQ expansion {claim_id} source PMID missing from corpus: {pmid}")
            require(
                pmid in claim_source_pmids[claim_id],
                f"FAQ expansion {claim_id} source PMID is not attached to the matching claim: {pmid}",
            )

    require(len(abstracts) == len(anchors), "Anchor abstract row count does not match anchors")
    for name in [
        "patient_faq_claims.md",
        "technician_workflow_claims.md",
        "claim_source_coverage.md",
        "screening_summary.md",
        "module_map.md",
    ]:
        path = LIT_DIR / name
        require(path.exists() and path.stat().st_size > 500, f"{name} missing or too small")

    print("Validation passed")
    print(f"records={len(records)}")
    print(f"screened={len(screened)}")
    print(f"claim_extraction_sources={len(claim_sources)}")
    print(f"targeted_extraction_sources={len(targeted_sources)}")
    print(f"claims={len(claims)}")
    print(f"faq_expansions={len(faq_expansions)}")
    print(f"anchor_abstracts={len(abstracts)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
