import claimsCsv from "../../literature_search/evidence_claims.csv?raw";
import type { Claim, SourceLink } from "../types";
import { parseCsv } from "../utils/csv";

export const claims = parseCsv(claimsCsv) as Claim[];

export const modules = Array.from(new Set(claims.map((claim) => claim.module)));

export const strengths = Array.from(
  new Set(claims.map((claim) => claim.evidence_strength)),
);

export function parseSources(claim: Claim): SourceLink[] {
  const titles = claim.source_labels.split(" | ");
  return claim.source_pmids
    .split(";")
    .map((pmid) => pmid.trim())
    .filter(Boolean)
    .map((pmid) => {
      const match = titles.find((title) => title.startsWith(`${pmid}:`));
      return {
        pmid,
        title: match ? match.replace(`${pmid}:`, "").trim() : "PubMed source",
        url: `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`,
      };
    });
}

export function claimMatches(claim: Claim, query: string): boolean {
  const haystack = [
    claim.claim_id,
    claim.module,
    claim.audience,
    claim.question,
    claim.claim,
    claim.patient_answer,
    claim.technician_detail,
    claim.evidence_strength,
    claim.source_pmids,
    claim.clinical_action,
    claim.caveat,
  ]
    .join(" ")
    .toLowerCase();

  const normalizedQuery = query.trim().toLowerCase();
  const tokens = normalizedQuery.split(/\s+/).filter(Boolean);

  return (
    haystack.includes(normalizedQuery) ||
    (tokens.length > 0 && tokens.every((token) => haystack.includes(token)))
  );
}
