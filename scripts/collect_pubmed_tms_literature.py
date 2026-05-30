#!/usr/bin/env python3
"""Collect a broad PubMed evidence map for the TMS training platform.

The script searches PubMed across topic lanes, saves query counts, stores PMID
lane membership, and downloads compact article metadata for deduped records.
"""

from __future__ import annotations

import argparse
import csv
import json
import re
import time
from datetime import date
from pathlib import Path
from typing import Any
from urllib.parse import urlencode

import requests


EUTILS_BASE = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils"
SEARCH_DATE = date.today().isoformat()
PROJECT_ROOT = Path(__file__).resolve().parents[1]
OUT_DIR = PROJECT_ROOT / "literature_search"

CORE_TMS = (
    '("Transcranial Magnetic Stimulation"[Mesh] '
    'OR "transcranial magnetic stimulation"[tiab] '
    'OR "transcranial magnetic stimulations"[tiab] '
    'OR "repetitive transcranial magnetic stimulation"[tiab] '
    'OR "repetitive TMS"[tiab] '
    'OR rTMS[tiab] '
    'OR "theta burst stimulation"[tiab] '
    'OR "intermittent theta burst stimulation"[tiab] '
    'OR iTBS[tiab] '
    'OR cTBS[tiab] '
    'OR "deep transcranial magnetic stimulation"[tiab] '
    'OR dTMS[tiab]) '
    "NOT (animals[mh] NOT humans[mh])"
)

PUBMED_QUERIES = {
    "master_tms_not_animal_only": CORE_TMS,
    "mechanisms_neuroplasticity": (
        f"{CORE_TMS} AND "
        "(mechanism*[tiab] OR neuroplasticity[tiab] OR plasticity[tiab] "
        'OR "cortical excitability"[tiab] OR "synaptic plasticity"[tiab] '
        'OR "long-term potentiation"[tiab] OR LTP[tiab] '
        'OR "long-term depression"[tiab] OR LTD[tiab] '
        "OR network*[tiab] OR connectivity[tiab] "
        'OR "electric field"[tiab] OR E-field[tiab])'
    ),
    "safety_side_effects_sensations": (
        f"{CORE_TMS} AND "
        "(safety[tiab] OR adverse[tiab] OR adverse-effects[tiab] "
        'OR "side effect"[tiab] OR "side effects"[tiab] '
        "OR seizure*[tiab] OR headache[tiab] OR pain[tiab] "
        "OR discomfort[tiab] OR tolerability[tiab] OR hearing[tiab] "
        "OR mania[tiab] OR syncope[tiab] OR sensation*[tiab])"
    ),
    "patient_experience_adherence_state": (
        f"{CORE_TMS} AND "
        "(adherence[tiab] OR compliance[tiab] OR dropout[tiab] "
        "OR acceptability[tiab] OR expectancy[tiab] "
        'OR "patient education"[tiab] OR "patient experience"[tiab] '
        "OR anxiety[tiab] OR comfort[tiab] OR tolerability[tiab] "
        'OR "treatment protocol"[tiab])'
    ),
    "medication_sleep_caffeine_state": (
        f"{CORE_TMS} AND "
        "(caffeine[tiab] OR sleep[tiab] OR insomnia[tiab] "
        "OR medication*[tiab] OR antidepressant*[tiab] "
        "OR benzodiazepine*[tiab] OR anticonvulsant*[tiab] "
        "OR antiepileptic*[tiab] OR nicotine[tiab] OR alcohol[tiab] "
        'OR "cortical excitability"[tiab] OR "motor threshold"[tiab])'
    ),
    "technician_equipment_localization": (
        f"{CORE_TMS} AND "
        '("motor threshold"[tiab] OR "resting motor threshold"[tiab] '
        "OR RMT[tiab] OR coil[tiab] OR neuronavigation[tiab] "
        "OR localization[tiab] OR localisation[tiab] "
        'OR "Beam F3"[tiab] OR "5 cm"[tiab] OR scalp[tiab] '
        "OR DLPFC[tiab] OR target*[tiab] "
        'OR "stimulation intensity"[tiab] OR operator[tiab] '
        "OR technician[tiab] OR training[tiab])"
    ),
    "dosing_protocol_variants": (
        f"{CORE_TMS} AND "
        "(dose[tiab] OR dosing[tiab] OR protocol*[tiab] "
        'OR "high frequency"[tiab] OR "low frequency"[tiab] '
        "OR bilateral[tiab] OR accelerated[tiab] "
        'OR "theta burst"[tiab] OR iTBS[tiab] OR cTBS[tiab] '
        'OR "deep TMS"[tiab] OR dTMS[tiab])'
    ),
    "fnirs_eeg_qeeg_biomarkers": (
        f"{CORE_TMS} AND "
        '(fNIRS[tiab] OR "functional near-infrared spectroscopy"[tiab] '
        'OR "near infrared spectroscopy"[tiab] OR EEG[tiab] '
        'OR qEEG[tiab] OR "quantitative EEG"[tiab] '
        'OR "TMS-EEG"[tiab] OR biomarker*[tiab] OR neuroimaging[tiab])'
    ),
    "guidelines_consensus_reviews": (
        f"{CORE_TMS} AND "
        "(guideline[pt] OR practice-guideline[pt] OR review[pt] "
        "OR systematic-review[pt] OR meta-analysis[pt] "
        "OR guideline*[tiab] OR consensus[tiab] "
        'OR "clinical practice"[tiab])'
    ),
    "clinical_depression_protocols": (
        f"{CORE_TMS} AND "
        '(depression[MeSH Terms] OR depressive[tiab] '
        'OR "major depressive disorder"[tiab] OR MDD[tiab]) AND '
        "(trial[tiab] OR randomized[tiab] OR randomised[tiab] "
        "OR meta-analysis[pt] OR review[pt] "
        "OR guideline*[tiab] OR consensus[tiab] OR protocol*[tiab])"
    ),
    "psychiatric_indications": (
        f"{CORE_TMS} AND "
        '(depression[tiab] OR depressive[tiab] OR MDD[tiab] '
        'OR "obsessive compulsive"[tiab] OR OCD[tiab] '
        'OR PTSD[tiab] OR anxiety[tiab] OR "substance use"[tiab] '
        'OR smoking[tiab] OR tinnitus[tiab] OR migraine[tiab] '
        "OR pain[tiab]) AND "
        "(treatment[tiab] OR therapeutic[tiab] OR trial[tiab] "
        "OR guideline*[tiab] OR review[tiab])"
    ),
}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--out-dir",
        type=Path,
        default=OUT_DIR,
        help="Directory for CSV and JSON outputs.",
    )
    parser.add_argument(
        "--no-metadata",
        action="store_true",
        help="Only write counts and PMID lane membership.",
    )
    parser.add_argument(
        "--max-records",
        type=int,
        default=0,
        help="Optional cap on deduped PMIDs for metadata fetches.",
    )
    parser.add_argument(
        "--sleep",
        type=float,
        default=0.34,
        help="Delay between NCBI requests. Keep >=0.34 without an API key.",
    )
    return parser.parse_args()


def request_json(endpoint: str, params: dict[str, Any], method: str = "GET") -> dict[str, Any]:
    url = f"{EUTILS_BASE}/{endpoint}"
    headers = {"User-Agent": "tms-training-literature-map/0.1"}
    last_error: Exception | None = None
    for attempt in range(4):
        try:
            if method == "POST":
                response = requests.post(url, data=params, headers=headers, timeout=60)
            else:
                response = requests.get(url, params=params, headers=headers, timeout=60)
            response.raise_for_status()
            return response.json()
        except Exception as exc:  # noqa: BLE001
            last_error = exc
            time.sleep(1.5 * (attempt + 1))
    raise RuntimeError(f"NCBI request failed for {endpoint}: {last_error}")


def pubmed_search_url(term: str) -> str:
    return f"{EUTILS_BASE}/esearch.fcgi?{urlencode({'db': 'pubmed', 'term': term})}"


def esearch_result(
    term: str,
    sleep_seconds: float,
    *,
    mindate: int | None = None,
    maxdate: int | None = None,
    retmax: int = 0,
) -> dict[str, Any]:
    params: dict[str, Any] = {
        "db": "pubmed",
        "term": term,
        "retmode": "json",
        "retmax": retmax,
    }
    if mindate is not None and maxdate is not None:
        params.update({"datetype": "pdat", "mindate": str(mindate), "maxdate": str(maxdate)})
    time.sleep(sleep_seconds)
    return request_json("esearch.fcgi", params)["esearchresult"]


def esearch_count(
    term: str, sleep_seconds: float, mindate: int | None = None, maxdate: int | None = None
) -> int:
    result = esearch_result(term, sleep_seconds, mindate=mindate, maxdate=maxdate, retmax=0)
    return int(result["count"])


def esearch_ids_for_range(
    term: str, sleep_seconds: float, mindate: int, maxdate: int
) -> list[str]:
    count = esearch_count(term, sleep_seconds, mindate, maxdate)
    if count == 0:
        return []
    if count > 9_999 and mindate == maxdate:
        raise RuntimeError(
            f"PubMed range {mindate} has {count} records, above the 9,999 ESearch limit."
        )
    if count > 9_999:
        midpoint = (mindate + maxdate) // 2
        return esearch_ids_for_range(term, sleep_seconds, mindate, midpoint) + esearch_ids_for_range(
            term, sleep_seconds, midpoint + 1, maxdate
        )

    result = esearch_result(
        term,
        sleep_seconds,
        mindate=mindate,
        maxdate=maxdate,
        retmax=count,
    )
    ids = result.get("idlist", [])
    if len(ids) != count:
        print(f"Warning: PubMed returned {len(ids)} IDs for {mindate}-{maxdate}, expected {count}")
    return ids


def esearch_all_pmids(term: str, sleep_seconds: float) -> tuple[int, list[str], str]:
    first = request_json(
        "esearch.fcgi",
        {"db": "pubmed", "term": term, "retmode": "json", "retmax": 0},
    )
    result = first["esearchresult"]
    count = int(result["count"])
    translation = result.get("querytranslation", "")

    if count <= 9_999:
        ids = esearch_ids_for_range(term, sleep_seconds, 1900, date.today().year)
    else:
        ids = esearch_ids_for_range(term, sleep_seconds, 1900, date.today().year)
    ids = sorted(set(ids), key=int, reverse=True)
    if len(ids) != count:
        print(f"Warning: PubMed reported {count} records, collected {len(ids)} IDs")
    return count, ids, translation


def article_id(article_ids: list[dict[str, Any]], idtype: str) -> str:
    for item in article_ids:
        if item.get("idtype") == idtype:
            return item.get("value", "")
    return ""


def year_from_summary(summary: dict[str, Any]) -> str:
    for field in ("sortpubdate", "pubdate", "epubdate"):
        match = re.search(r"\b(19|20)\d{2}\b", str(summary.get(field, "")))
        if match:
            return match.group(0)
    return ""


def parse_pubtypes(pubtypes: list[str]) -> dict[str, str]:
    lowered = {item.lower() for item in pubtypes}
    return {
        "is_review": str(any("review" in item for item in lowered)),
        "is_guideline": str(any("guideline" in item for item in lowered)),
        "is_meta_analysis": str(any("meta-analysis" in item for item in lowered)),
        "is_clinical_trial": str(any("clinical trial" in item for item in lowered)),
        "is_randomized_trial": str(any("randomized" in item for item in lowered)),
    }


def summarize_record(pmid: str, summary: dict[str, Any], lanes: set[str]) -> dict[str, str]:
    authors = [item.get("name", "") for item in summary.get("authors", [])]
    pubtypes = summary.get("pubtype", [])
    article_ids = summary.get("articleids", [])
    row = {
        "pmid": pmid,
        "title": summary.get("title", ""),
        "year": year_from_summary(summary),
        "pubdate": summary.get("pubdate", ""),
        "epubdate": summary.get("epubdate", ""),
        "journal": summary.get("fulljournalname") or summary.get("source", ""),
        "source_abbrev": summary.get("source", ""),
        "volume": summary.get("volume", ""),
        "issue": summary.get("issue", ""),
        "pages": summary.get("pages", ""),
        "doi": article_id(article_ids, "doi"),
        "pmc": article_id(article_ids, "pmc"),
        "authors": "; ".join(authors[:12]),
        "author_count": str(len(authors)),
        "last_author": summary.get("lastauthor", ""),
        "pubtypes": "; ".join(pubtypes),
        "query_lanes": "; ".join(sorted(lanes)),
        "pubmed_url": f"https://pubmed.ncbi.nlm.nih.gov/{pmid}/",
    }
    row.update(parse_pubtypes(pubtypes))
    return row


def fetch_summaries(pmids: list[str], sleep_seconds: float) -> dict[str, dict[str, Any]]:
    summaries: dict[str, dict[str, Any]] = {}
    batch_size = 200
    for start in range(0, len(pmids), batch_size):
        batch = pmids[start : start + batch_size]
        time.sleep(sleep_seconds)
        data = request_json(
            "esummary.fcgi",
            {"db": "pubmed", "retmode": "json", "id": ",".join(batch)},
            method="POST",
        )
        result = data.get("result", {})
        for pmid in result.get("uids", []):
            summaries[pmid] = result[pmid]
        print(f"Fetched metadata {min(start + batch_size, len(pmids))}/{len(pmids)}")
    return summaries


def write_csv(path: Path, rows: list[dict[str, str]], fieldnames: list[str]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)


def main() -> int:
    args = parse_args()
    out_dir = args.out_dir
    out_dir.mkdir(parents=True, exist_ok=True)

    query_rows: list[dict[str, str]] = []
    pmid_lanes: dict[str, set[str]] = {}

    for lane, term in PUBMED_QUERIES.items():
        print(f"Searching {lane}")
        count, ids, translation = esearch_all_pmids(term, args.sleep)
        for pmid in ids:
            pmid_lanes.setdefault(pmid, set()).add(lane)
        query_rows.append(
            {
                "search_date": SEARCH_DATE,
                "database": "PubMed",
                "lane": lane,
                "count_reported": str(count),
                "pmids_returned": str(len(ids)),
                "query": term,
                "query_translation": translation,
                "search_url": pubmed_search_url(term),
            }
        )

    write_csv(
        out_dir / "pubmed_query_counts.csv",
        query_rows,
        [
            "search_date",
            "database",
            "lane",
            "count_reported",
            "pmids_returned",
            "query",
            "query_translation",
            "search_url",
        ],
    )

    membership_rows = [
        {
            "pmid": pmid,
            "query_lanes": "; ".join(sorted(lanes)),
            "lane_count": str(len(lanes)),
            "pubmed_url": f"https://pubmed.ncbi.nlm.nih.gov/{pmid}/",
        }
        for pmid, lanes in sorted(pmid_lanes.items(), key=lambda item: int(item[0]), reverse=True)
    ]
    write_csv(
        out_dir / "pubmed_pmids_by_lane.csv",
        membership_rows,
        ["pmid", "query_lanes", "lane_count", "pubmed_url"],
    )

    with (out_dir / "pubmed_queries.json").open("w", encoding="utf-8") as handle:
        json.dump(
            {
                "search_date": SEARCH_DATE,
                "database": "PubMed",
                "queries": PUBMED_QUERIES,
            },
            handle,
            indent=2,
        )

    if args.no_metadata:
        print(f"Done. Unique PMIDs: {len(pmid_lanes)}")
        return 0

    pmids = list(pmid_lanes)
    pmids.sort(key=int, reverse=True)
    if args.max_records > 0:
        pmids = pmids[: args.max_records]

    summaries = fetch_summaries(pmids, args.sleep)
    metadata_rows = [
        summarize_record(pmid, summaries.get(pmid, {}), pmid_lanes[pmid])
        for pmid in pmids
    ]
    metadata_rows.sort(key=lambda row: (row["year"], row["pmid"]), reverse=True)
    fields = [
        "pmid",
        "title",
        "year",
        "pubdate",
        "epubdate",
        "journal",
        "source_abbrev",
        "volume",
        "issue",
        "pages",
        "doi",
        "pmc",
        "authors",
        "author_count",
        "last_author",
        "pubtypes",
        "is_review",
        "is_guideline",
        "is_meta_analysis",
        "is_clinical_trial",
        "is_randomized_trial",
        "query_lanes",
        "pubmed_url",
    ]
    write_csv(out_dir / "pubmed_records.csv", metadata_rows, fields)

    high_level_rows = [
        row
        for row in metadata_rows
        if row["is_review"] == "True"
        or row["is_guideline"] == "True"
        or row["is_meta_analysis"] == "True"
        or "guidelines_consensus_reviews" in row["query_lanes"]
    ]
    write_csv(out_dir / "pubmed_reviews_guidelines.csv", high_level_rows, fields)

    print(f"Done. Unique PMIDs: {len(pmid_lanes)}")
    print(f"Wrote {out_dir / 'pubmed_records.csv'}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
