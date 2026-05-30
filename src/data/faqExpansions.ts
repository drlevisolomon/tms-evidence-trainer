import expansionsJson from "../../literature_search/faq_expansions.json";
import type { FAQExpansion } from "../types";

export const faqExpansions = expansionsJson as FAQExpansion[];

const expansionByClaimId = new Map(
  faqExpansions.map((expansion) => [expansion.claim_id, expansion]),
);

export function getFaqExpansion(claimId: string): FAQExpansion | undefined {
  return expansionByClaimId.get(claimId);
}

export function faqExpansionMatches(claimId: string, query: string): boolean {
  const expansion = getFaqExpansion(claimId);
  if (!expansion) return false;

  const haystack = [
    expansion.expanded_patient_answer,
    expansion.why_it_matters,
    expansion.technician_evidence_note,
    ...expansion.technician_checklist,
    ...expansion.follow_ups.flatMap((followUp) => [
      followUp.question,
      followUp.answer,
      followUp.route_when,
    ]),
    ...expansion.evidence_pmids,
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
