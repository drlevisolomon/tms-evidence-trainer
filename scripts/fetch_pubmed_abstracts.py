#!/usr/bin/env python3
"""Fetch PubMed abstracts for selected evidence sources."""

from __future__ import annotations

import argparse
import csv
import time
import xml.etree.ElementTree as ET
from pathlib import Path
from typing import Any

import requests


PROJECT_ROOT = Path(__file__).resolve().parents[1]
LIT_DIR = PROJECT_ROOT / "literature_search"
EUTILS_BASE = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils"


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("--source", type=Path, default=LIT_DIR / "pubmed_anchor_sources.csv")
    parser.add_argument("--out", type=Path, default=LIT_DIR / "pubmed_anchor_abstracts.csv")
    parser.add_argument("--sleep", type=float, default=0.34)
    return parser.parse_args()


def text_of(element: ET.Element | None) -> str:
    if element is None:
        return ""
    return " ".join(part.strip() for part in element.itertext() if part and part.strip())


def fetch_xml(pmids: list[str], sleep_seconds: float) -> ET.Element:
    time.sleep(sleep_seconds)
    response = requests.post(
        f"{EUTILS_BASE}/efetch.fcgi",
        data={
            "db": "pubmed",
            "id": ",".join(pmids),
            "retmode": "xml",
        },
        headers={"User-Agent": "tms-training-literature-map/0.1"},
        timeout=60,
    )
    response.raise_for_status()
    return ET.fromstring(response.text)


def parse_article(article: ET.Element) -> dict[str, str]:
    pmid = text_of(article.find(".//PMID"))
    article_title = text_of(article.find(".//ArticleTitle"))
    journal = text_of(article.find(".//Journal/Title"))
    pubtypes = [text_of(node) for node in article.findall(".//PublicationType")]
    abstract_parts = []
    for node in article.findall(".//AbstractText"):
        label = node.attrib.get("Label")
        text = text_of(node)
        if label and text:
            abstract_parts.append(f"{label}: {text}")
        elif text:
            abstract_parts.append(text)
    mesh_terms = [text_of(node.find("DescriptorName")) for node in article.findall(".//MeshHeading")]
    return {
        "pmid": pmid,
        "title": article_title,
        "journal": journal,
        "pubtypes": "; ".join(item for item in pubtypes if item),
        "abstract": " ".join(abstract_parts),
        "mesh_terms": "; ".join(item for item in mesh_terms if item),
        "pubmed_url": f"https://pubmed.ncbi.nlm.nih.gov/{pmid}/" if pmid else "",
    }


def main() -> int:
    args = parse_args()
    with args.source.open(newline="", encoding="utf-8") as handle:
        pmids = [row["pmid"] for row in csv.DictReader(handle)]

    rows: list[dict[str, str]] = []
    for start in range(0, len(pmids), 100):
        root = fetch_xml(pmids[start : start + 100], args.sleep)
        for article in root.findall(".//PubmedArticle"):
            rows.append(parse_article(article))

    fields = ["pmid", "title", "journal", "pubtypes", "abstract", "mesh_terms", "pubmed_url"]
    with args.out.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=fields)
        writer.writeheader()
        writer.writerows(rows)

    print(f"Wrote {args.out} rows={len(rows)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
