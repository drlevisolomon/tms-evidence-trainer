export type EvidenceStrength =
  | "strong"
  | "moderate"
  | "limited"
  | "clinic-policy-dependent";

export type Claim = {
  claim_id: string;
  module: string;
  audience: "patient" | "technician" | "patient_and_technician";
  question: string;
  claim: string;
  patient_answer: string;
  technician_detail: string;
  evidence_strength: EvidenceStrength;
  source_pmids: string;
  source_labels: string;
  clinical_action: string;
  caveat: string;
  status: string;
};

export type TabId = "learn" | "ask" | "workflow" | "evidence";

export type SourceLink = {
  pmid: string;
  title: string;
  url: string;
};

export type FAQFollowUp = {
  question: string;
  answer: string;
  route_when: string;
};

export type FAQExpansion = {
  claim_id: string;
  expanded_patient_answer: string;
  why_it_matters: string;
  technician_evidence_note: string;
  technician_checklist: string[];
  follow_ups: FAQFollowUp[];
  evidence_pmids: string[];
};
