#!/usr/bin/env python3
"""Screen the PubMed TMS corpus into training-platform evidence priorities."""

from __future__ import annotations

import csv
from collections import Counter
from pathlib import Path


PROJECT_ROOT = Path(__file__).resolve().parents[1]
LIT_DIR = PROJECT_ROOT / "literature_search"
RECORDS_PATH = LIT_DIR / "pubmed_records.csv"
ANCHORS_PATH = LIT_DIR / "pubmed_anchor_sources.csv"
SCREENED_PATH = LIT_DIR / "screened_records.csv"
CLAIM_SOURCE_PATH = LIT_DIR / "claim_extraction_sources.csv"
TARGETED_SOURCE_PATH = LIT_DIR / "targeted_extraction_sources.csv"
SUMMARY_PATH = LIT_DIR / "screening_summary.md"


MODULE_RULES = {
    "mechanisms": [
        "mechanisms_neuroplasticity",
        "electric field",
        "cortical excitability",
        "neuroplasticity",
        "plasticity",
        "connectivity",
        "network",
        "theta burst",
    ],
    "safety_side_effects": [
        "safety_side_effects_sensations",
        "safety",
        "adverse",
        "side effect",
        "seizure",
        "headache",
        "pain",
        "discomfort",
        "tolerability",
        "hearing",
        "mania",
        "syncope",
    ],
    "patient_faq_adherence": [
        "patient_experience_adherence_state",
        "adherence",
        "acceptability",
        "patient education",
        "expectancy",
        "dropout",
        "sleep",
        "caffeine",
        "medication",
        "benzodiazepine",
        "antidepressant",
    ],
    "state_factors": [
        "medication_sleep_caffeine_state",
        "caffeine",
        "sleep",
        "insomnia",
        "benzodiazepine",
        "anticonvulsant",
        "antiepileptic",
        "nicotine",
        "alcohol",
        "motor threshold",
    ],
    "technician_workflow": [
        "technician_equipment_localization",
        "motor threshold",
        "resting motor threshold",
        "rmt",
        "coil",
        "neuronavigation",
        "localization",
        "localisation",
        "beam f3",
        "dlpfc",
        "operator",
        "technician",
        "targeting",
    ],
    "protocol_literacy": [
        "dosing_protocol_variants",
        "clinical_depression_protocols",
        "psychiatric_indications",
        "protocol",
        "dose",
        "dosing",
        "high-frequency",
        "low-frequency",
        "bilateral",
        "accelerated",
        "itbs",
        "ctbs",
        "deep tms",
        "depression",
        "ocd",
        "smoking",
    ],
    "measurement_expansion": [
        "fnirs_eeg_qeeg_biomarkers",
        "fnirs",
        "functional near-infrared spectroscopy",
        "eeg",
        "qeeg",
        "tms-eeg",
        "biomarker",
        "neuroimaging",
    ],
    "guidelines_reviews": [
        "guidelines_consensus_reviews",
        "guideline",
        "consensus",
        "review",
        "meta-analysis",
        "systematic review",
    ],
}

FALSE_POSITIVE_TERMS = [
    "transcranial direct current stimulation",
    "tdcs",
    "transcranial alternating current stimulation",
    "tacs",
    "transcranial pulsed current",
    "vagus nerve stimulation",
    "taVNS",
    "shock wave",
    "ultrasound",
]

TMS_TERMS = [
    "transcranial magnetic stimulation",
    "repetitive transcranial magnetic stimulation",
    "rtms",
    "tms",
    "theta burst",
    "itbs",
    "ctbs",
    "deep transcranial magnetic stimulation",
    "dtms",
    "magnetic stimulation",
]


def load_anchor_pmids() -> set[str]:
    with ANCHORS_PATH.open(newline="", encoding="utf-8") as handle:
        return {row["pmid"] for row in csv.DictReader(handle)}


def has_any(text: str, terms: list[str]) -> bool:
    return any(term.lower() in text for term in terms)


def assign_modules(row: dict[str, str]) -> list[str]:
    text = " ".join(
        [
            row["title"],
            row["journal"],
            row["pubtypes"],
            row["query_lanes"],
        ]
    ).lower()
    modules = []
    for module, terms in MODULE_RULES.items():
        if any(term.lower() in text for term in terms):
            modules.append(module)
    return modules


def likely_false_positive(row: dict[str, str], modules: list[str]) -> tuple[bool, str]:
    title = row["title"].lower()
    all_text = " ".join([row["title"], row["journal"], row["query_lanes"]]).lower()
    title_has_tms = has_any(title, TMS_TERMS)

    if "veterinary" in all_text or "dogs" in title or "canine" in title:
        return True, "animal_or_veterinary_record"
    if has_any(title, FALSE_POSITIVE_TERMS) and not title_has_tms:
        return True, "non_tms_stimulation_modality_title"
    if not modules:
        return True, "no_training_platform_module_match"
    return False, ""


def priority_and_decision(row: dict[str, str], modules: list[str], anchors: set[str]) -> tuple[str, str, str]:
    false_positive, false_reason = likely_false_positive(row, modules)
    if false_positive:
        return "5", "exclude_low_priority", false_reason

    pubtypes = row["pubtypes"].lower()
    lanes = row["query_lanes"].lower()
    title = row["title"].lower()
    pmid = row["pmid"]

    if pmid in anchors:
        return "1", "include_claim_extraction", "curated_anchor_source"

    high_level = (
        "guideline" in pubtypes
        or "consensus" in pubtypes
        or "systematic review" in pubtypes
        or "meta-analysis" in pubtypes
        or "review" in pubtypes
        or "guidelines_consensus_reviews" in lanes
    )
    if high_level:
        return "2", "include_claim_extraction", "review_guideline_consensus_or_meta_analysis"

    trial_like = (
        row["is_clinical_trial"] == "True"
        or row["is_randomized_trial"] == "True"
        or "randomized" in title
        or "trial" in title
    )
    if trial_like:
        return "3", "include_targeted_extraction", "clinical_trial_or_protocol_evidence"

    if any(module in modules for module in ["safety_side_effects", "state_factors", "technician_workflow"]):
        return "3", "include_targeted_extraction", "operational_or_patient_faq_relevance"

    if any(module in modules for module in ["mechanisms", "protocol_literacy", "measurement_expansion"]):
        return "4", "background_index", "background_mechanism_protocol_or_measurement_record"

    return "5", "exclude_low_priority", "outside_platform_scope_after_screening"


def write_csv(path: Path, rows: list[dict[str, str]], fieldnames: list[str]) -> None:
    with path.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)


def main() -> int:
    anchors = load_anchor_pmids()
    screened: list[dict[str, str]] = []
    module_counter: Counter[str] = Counter()
    decision_counter: Counter[str] = Counter()
    priority_counter: Counter[str] = Counter()

    with RECORDS_PATH.open(newline="", encoding="utf-8") as handle:
        for row in csv.DictReader(handle):
            modules = assign_modules(row)
            priority, decision, reason = priority_and_decision(row, modules, anchors)
            for module in modules:
                module_counter[module] += 1
            decision_counter[decision] += 1
            priority_counter[priority] += 1
            screened.append(
                {
                    "pmid": row["pmid"],
                    "title": row["title"],
                    "year": row["year"],
                    "journal": row["journal"],
                    "pubtypes": row["pubtypes"],
                    "query_lanes": row["query_lanes"],
                    "modules": "; ".join(modules),
                    "priority": priority,
                    "screening_decision": decision,
                    "screening_reason": reason,
                    "claim_extraction_candidate": str(decision in {"include_claim_extraction", "include_targeted_extraction"}),
                    "pubmed_url": row["pubmed_url"],
                }
            )

    fields = [
        "pmid",
        "title",
        "year",
        "journal",
        "pubtypes",
        "query_lanes",
        "modules",
        "priority",
        "screening_decision",
        "screening_reason",
        "claim_extraction_candidate",
        "pubmed_url",
    ]
    write_csv(SCREENED_PATH, screened, fields)
    write_csv(
        CLAIM_SOURCE_PATH,
        [row for row in screened if row["screening_decision"] == "include_claim_extraction"],
        fields,
    )
    write_csv(
        TARGETED_SOURCE_PATH,
        [row for row in screened if row["screening_decision"] == "include_targeted_extraction"],
        fields,
    )

    with SUMMARY_PATH.open("w", encoding="utf-8") as handle:
        handle.write("# Screening Summary\n\n")
        handle.write("Screening method: deterministic title, publication-type, query-lane, and module-rule screening over the full PubMed corpus. This is a complete first-pass screen of every PMID in `pubmed_records.csv`, with priority tiers designed for claim extraction and later manual QA.\n\n")
        handle.write(f"Total screened records: {len(screened)}\n\n")
        handle.write("## Screening Decisions\n\n")
        for key, value in decision_counter.most_common():
            handle.write(f"- `{key}`: {value}\n")
        handle.write("\n## Priority Tiers\n\n")
        handle.write("- `1`: curated anchor source for immediate claim extraction\n")
        handle.write("- `2`: review, guideline, consensus, or meta-analysis source for claim extraction\n")
        handle.write("- `3`: clinical trial, protocol, safety, state-factor, or technician workflow source for targeted extraction\n")
        handle.write("- `4`: background mechanism, protocol, or measurement source retained for lookup\n")
        handle.write("- `5`: excluded or low-priority for this training-platform scope\n\n")
        for key, value in sorted(priority_counter.items()):
            handle.write(f"- Priority `{key}`: {value}\n")
        handle.write("\n## Module Assignments\n\n")
        for key, value in module_counter.most_common():
            handle.write(f"- `{key}`: {value}\n")
        handle.write("\n## Caveat\n\n")
        handle.write("This pass proves that every PubMed record has been triaged, not that every article has undergone full-text systematic-review adjudication. The claim table uses curated anchor and high-priority sources for training content, while lower-priority records remain searchable background evidence.\n")

    print(f"Wrote {SCREENED_PATH}")
    print(f"Wrote {CLAIM_SOURCE_PATH}")
    print(f"Wrote {TARGETED_SOURCE_PATH}")
    print(f"Wrote {SUMMARY_PATH}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
