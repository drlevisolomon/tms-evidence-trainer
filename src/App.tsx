import {
  Activity,
  AlertTriangle,
  BadgeCheck,
  BookMarked,
  BookOpen,
  Check,
  CheckCircle2,
  ClipboardCheck,
  ClipboardList,
  Copy,
  Database,
  FileText,
  Filter,
  HelpCircle,
  Library,
  Link2,
  Search,
  Target,
  MessageCircleQuestion,
  UserRound,
} from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";
import { claimMatches, claims, modules, parseSources } from "./data/claims";
import { faqExpansionMatches, getFaqExpansion } from "./data/faqExpansions";
import type { Claim, EvidenceStrength, FAQExpansion, SourceLink, TabId } from "./types";

const tabs: Array<{ id: TabId; label: string; icon: typeof BookOpen }> = [
  { id: "learn", label: "Learn", icon: BookOpen },
  { id: "ask", label: "Ask", icon: HelpCircle },
  { id: "workflow", label: "Workflow", icon: ClipboardCheck },
  { id: "evidence", label: "Evidence", icon: Database },
];

const strengthOrder: EvidenceStrength[] = [
  "strong",
  "moderate",
  "limited",
  "clinic-policy-dependent",
];

const workflowSteps = [
  {
    phase: "Before",
    items: [
      "Verify identity, order, protocol, target, and session number",
      "Ask about sleep, medication, caffeine, substance, and symptom changes",
      "Confirm ear protection and current contraindication status",
      "Escalate seizure-risk, implant, pregnancy, mania, or suicidality flags",
    ],
  },
  {
    phase: "During",
    items: [
      "Confirm coil placement and orientation remain stable",
      "Monitor discomfort, headache, twitching, anxiety, and unusual sensations",
      "Pause and escalate severe pain, syncope, seizure-like activity, or confusion",
      "Document ramping, interruptions, and protocol-approved comfort changes",
    ],
  },
  {
    phase: "After",
    items: [
      "Record tolerability, adverse events, and patient-state changes",
      "Route medication, safety, or clinical-response questions to the clinician",
      "Reinforce consistency around prescribed medicines, caffeine, and sleep",
      "Schedule or flag missed-session and recheck workflows",
    ],
  },
];

function App() {
  const [activeTab, setActiveTab] = useState<TabId>("ask");
  const [query, setQuery] = useState("");
  const [moduleFilter, setModuleFilter] = useState("Patient FAQ");
  const [strengthFilter, setStrengthFilter] = useState("All");
  const [audienceFilter, setAudienceFilter] = useState("All");
  const [selectedClaimId, setSelectedClaimId] = useState("FAQ-001");
  const [checkedSteps, setCheckedSteps] = useState<Record<string, boolean>>({});
  const [copied, setCopied] = useState(false);

  const filteredClaims = useMemo(() => {
    return claims.filter((claim) => {
      const matchesQuery = query
        ? claimMatches(claim, query) || faqExpansionMatches(claim.claim_id, query)
        : true;
      const matchesModule = moduleFilter === "All" || claim.module === moduleFilter;
      const matchesStrength =
        strengthFilter === "All" || claim.evidence_strength === strengthFilter;
      const matchesAudience =
        audienceFilter === "All" || claim.audience === audienceFilter;
      return matchesQuery && matchesModule && matchesStrength && matchesAudience;
    });
  }, [audienceFilter, moduleFilter, query, strengthFilter]);

  const selectedClaim =
    filteredClaims.find((claim) => claim.claim_id === selectedClaimId) ??
    filteredClaims[0] ??
    claims.find((claim) => claim.claim_id === selectedClaimId) ??
    claims[0];

  const moduleCounts = useMemo(() => {
    return modules.map((module) => ({
      module,
      count: claims.filter((claim) => claim.module === module).length,
      strong: claims.filter(
        (claim) => claim.module === module && claim.evidence_strength === "strong",
      ).length,
    }));
  }, []);

  const stats = useMemo(() => {
    return {
      claims: claims.length,
      patientFaq: claims.filter((claim) => claim.module === "Patient FAQ").length,
      workflow: claims.filter((claim) => claim.module === "Technician Workflow").length,
      strong: claims.filter((claim) => claim.evidence_strength === "strong").length,
    };
  }, []);

  async function copyPatientAnswer() {
    const expansion = getFaqExpansion(selectedClaim.claim_id);
    const followUps = expansion
      ? `\n\nLikely follow-ups:\n${expansion.follow_ups
          .map((followUp) => `- ${followUp.question} ${followUp.answer}`)
          .join("\n")}`
      : "";
    const text = `${selectedClaim.question}\n\n${selectedClaim.patient_answer}${
      expansion ? `\n\nDeeper explanation: ${expansion.expanded_patient_answer}` : ""
    }${followUps}\n\nBoundary: ${selectedClaim.caveat}\nSources: ${selectedClaim.source_pmids}`;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.setAttribute("readonly", "true");
      textarea.style.position = "fixed";
      textarea.style.left = "-9999px";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  }

  return (
    <div className="app-shell">
      <aside className="sidebar" aria-label="Primary navigation">
        <div className="brand">
          <span className="brand-mark">
            <Activity size={20} strokeWidth={2.4} />
          </span>
          <div>
            <strong>TMS Evidence Trainer</strong>
            <span>Clinical training manual</span>
          </div>
        </div>

        <nav className="nav-list">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                className={activeTab === tab.id ? "nav-item active" : "nav-item"}
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                type="button"
              >
                <Icon size={18} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="sidebar-summary">
          <span className="summary-label">Manual library</span>
          <strong>{stats.claims}</strong>
          <span>source-linked claims</span>
        </div>
      </aside>

      <main className="workspace">
        <header className="topbar">
          <div className="topbar-copy">
            <h1>{tabs.find((tab) => tab.id === activeTab)?.label}</h1>
            <p>{headerLine(activeTab, stats)}</p>
          </div>
          <div className="topbar-tools">
            <label className="global-search">
              <Search size={18} />
              <input
                aria-label="Search evidence claims"
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search questions or topics..."
                value={query}
              />
            </label>
            <div className="claims-pill" aria-label={`${stats.claims} source-linked claims`}>
              <strong>{stats.claims}</strong>
              <span>source-linked claims</span>
            </div>
          </div>
        </header>

        {activeTab === "learn" && (
          <LearnView
            moduleCounts={moduleCounts}
            onSelectClaim={setSelectedClaimId}
            onSelectModule={setModuleFilter}
            setTab={setActiveTab}
          />
        )}

        {activeTab === "ask" && (
          <AskView
            audienceFilter={audienceFilter}
            claims={filteredClaims}
            copied={copied}
            moduleFilter={moduleFilter}
            onAudienceFilter={setAudienceFilter}
            onCopy={copyPatientAnswer}
            onModuleFilter={setModuleFilter}
            onSelectClaim={setSelectedClaimId}
            onStrengthFilter={setStrengthFilter}
            selectedClaim={selectedClaim}
            strengthFilter={strengthFilter}
          />
        )}

        {activeTab === "workflow" && (
          <WorkflowView checkedSteps={checkedSteps} setCheckedSteps={setCheckedSteps} />
        )}

        {activeTab === "evidence" && (
          <EvidenceView
            claims={filteredClaims}
            moduleFilter={moduleFilter}
            onModuleFilter={setModuleFilter}
            onSelectClaim={setSelectedClaimId}
            onStrengthFilter={setStrengthFilter}
            selectedClaim={selectedClaim}
            strengthFilter={strengthFilter}
          />
        )}
      </main>
    </div>
  );
}

function headerLine(tab: TabId, stats: { claims: number; patientFaq: number; workflow: number; strong: number }) {
  if (tab === "learn") return `${modules.length} modules mapped from ${stats.claims} extracted claims`;
  if (tab === "ask") return `${stats.patientFaq} FAQ claims plus cross-module patient answers`;
  if (tab === "workflow") return `${stats.workflow} workflow claims translated into session-room checks`;
  return `${stats.strong} strong claims, source PMIDs, and extraction status`;
}

function LearnView({
  moduleCounts,
  onSelectClaim,
  onSelectModule,
  setTab,
}: {
  moduleCounts: Array<{ module: string; count: number; strong: number }>;
  onSelectClaim: (claimId: string) => void;
  onSelectModule: (module: string) => void;
  setTab: (tab: TabId) => void;
}) {
  return (
    <section className="learn-grid">
      <div className="module-rail">
        {moduleCounts.map((module) => {
          const moduleClaims = claims.filter((claim) => claim.module === module.module);
          return (
            <button
              className="module-row"
              key={module.module}
              onClick={() => {
                onSelectModule(module.module);
                onSelectClaim(moduleClaims[0].claim_id);
                setTab("ask");
              }}
              type="button"
            >
              <span>
                <strong>{module.module}</strong>
                <small>{module.strong} strong claims</small>
              </span>
              <b>{module.count}</b>
            </button>
          );
        })}
      </div>

      <div className="learning-panel">
        <div className="section-heading">
          <BookOpen size={20} />
          <h2>Module Sequence</h2>
        </div>
        <div className="module-sequence">
          {modules.map((module, index) => {
            const moduleClaims = claims.filter((claim) => claim.module === module);
            return (
              <article className="sequence-item" key={module}>
                <span className="sequence-index">{index + 1}</span>
                <div>
                  <h3>{module}</h3>
                  <p>{moduleLead(module)}</p>
                  <div className="mini-list">
                    {moduleClaims.slice(0, 3).map((claim) => (
                      <button
                        key={claim.claim_id}
                        onClick={() => {
                          onSelectModule(module);
                          onSelectClaim(claim.claim_id);
                          setTab("ask");
                        }}
                        type="button"
                      >
                        {claim.question}
                      </button>
                    ))}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function AskView({
  audienceFilter,
  claims: visibleClaims,
  copied,
  moduleFilter,
  onAudienceFilter,
  onCopy,
  onModuleFilter,
  onSelectClaim,
  onStrengthFilter,
  selectedClaim,
  strengthFilter,
}: {
  audienceFilter: string;
  claims: Claim[];
  copied: boolean;
  moduleFilter: string;
  onAudienceFilter: (value: string) => void;
  onCopy: () => void;
  onModuleFilter: (value: string) => void;
  onSelectClaim: (claimId: string) => void;
  onStrengthFilter: (value: string) => void;
  selectedClaim: Claim;
  strengthFilter: string;
}) {
  return (
    <section className="manual-view ask-layout">
      <div className="manual-spread">
        <aside className="chapter-index">
          <div className="chapter-heading">
            <BookMarked size={22} />
            <span>Chapter</span>
            <h2>{moduleFilter === "All" ? "Claim Library" : moduleFilter}</h2>
            <p>{moduleLead(moduleFilter === "All" ? selectedClaim.module : moduleFilter)}</p>
            <strong>{visibleClaims.length} questions</strong>
          </div>

          <QuestionFilters
            audienceFilter={audienceFilter}
            moduleFilter={moduleFilter}
            onAudienceFilter={onAudienceFilter}
            onModuleFilter={onModuleFilter}
            onStrengthFilter={onStrengthFilter}
            strengthFilter={strengthFilter}
          />

          <div className="question-list" aria-label="Question index">
            {visibleClaims.length ? (
              visibleClaims.map((claim, index) => (
                <button
                  className={
                    selectedClaim.claim_id === claim.claim_id ? "claim-row active" : "claim-row"
                  }
                  key={claim.claim_id}
                  onClick={() => onSelectClaim(claim.claim_id)}
                  type="button"
                >
                  <span className="claim-number">{String(index + 1).padStart(2, "0")}</span>
                  <span className="claim-row-copy">
                    <strong>{claim.question}</strong>
                    <small>{claim.module}</small>
                  </span>
                  <StrengthBadge strength={claim.evidence_strength} />
                </button>
              ))
            ) : (
              <div className="empty-state">
                <Search size={19} />
                <strong>No matching questions</strong>
                <span>Try a broader search term or reset one of the filters.</span>
              </div>
            )}
          </div>
        </aside>

        <ClaimDetail claim={selectedClaim} copied={copied} onCopy={onCopy} />
      </div>
    </section>
  );
}

function WorkflowView({
  checkedSteps,
  setCheckedSteps,
}: {
  checkedSteps: Record<string, boolean>;
  setCheckedSteps: (steps: Record<string, boolean>) => void;
}) {
  const workflowClaims = claims.filter((claim) =>
    ["Technician Workflow", "Safety and Side Effects"].includes(claim.module),
  );
  const completed = Object.values(checkedSteps).filter(Boolean).length;
  const total = workflowSteps.flatMap((phase) => phase.items).length;

  function toggleStep(step: string) {
    setCheckedSteps({ ...checkedSteps, [step]: !checkedSteps[step] });
  }

  return (
    <section className="workflow-layout">
      <div className="workflow-main">
        <div className="workflow-status">
          <div>
            <span className="summary-label">Session readiness</span>
            <strong>{completed}/{total}</strong>
          </div>
          <div className="progress-track">
            <span style={{ width: `${(completed / total) * 100}%` }} />
          </div>
        </div>

        <div className="workflow-columns">
          {workflowSteps.map((phase) => (
            <div className="workflow-column" key={phase.phase}>
              <h2>{phase.phase}</h2>
              {phase.items.map((item) => (
                <button
                  className={checkedSteps[item] ? "check-row checked" : "check-row"}
                  key={item}
                  onClick={() => toggleStep(item)}
                  type="button"
                >
                  <span>{checkedSteps[item] ? <Check size={16} /> : null}</span>
                  {item}
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>

      <aside className="escalation-panel">
        <div className="section-heading danger">
          <AlertTriangle size={20} />
          <h2>Escalation Triggers</h2>
        </div>
        {workflowClaims.slice(0, 7).map((claim) => (
          <article className="escalation-row" key={claim.claim_id}>
            <strong>{claim.question}</strong>
            <p>{claim.clinical_action}</p>
            <StrengthBadge strength={claim.evidence_strength} />
          </article>
        ))}
      </aside>
    </section>
  );
}

function EvidenceView({
  claims: visibleClaims,
  moduleFilter,
  onModuleFilter,
  onSelectClaim,
  onStrengthFilter,
  selectedClaim,
  strengthFilter,
}: {
  claims: Claim[];
  moduleFilter: string;
  onModuleFilter: (value: string) => void;
  onSelectClaim: (claimId: string) => void;
  onStrengthFilter: (value: string) => void;
  selectedClaim: Claim;
  strengthFilter: string;
}) {
  return (
    <section className="evidence-layout">
      <div className="evidence-table-panel">
        <div className="table-toolbar">
          <div className="section-heading">
            <FileText size={20} />
            <h2>Claim Registry</h2>
          </div>
          <div className="toolbar-filters">
            <SelectControl
              label="Module"
              onChange={onModuleFilter}
              options={["All", ...modules]}
              value={moduleFilter}
            />
            <SelectControl
              label="Strength"
              onChange={onStrengthFilter}
              options={["All", ...strengthOrder]}
              value={strengthFilter}
            />
          </div>
        </div>
        <div className="evidence-table" role="table" aria-label="Evidence claims">
          <div className="table-head" role="row">
            <span>Claim</span>
            <span>Module</span>
            <span>Strength</span>
            <span>PMIDs</span>
          </div>
          {visibleClaims.map((claim) => (
            <button
              aria-current={selectedClaim.claim_id === claim.claim_id ? "true" : undefined}
              className={selectedClaim.claim_id === claim.claim_id ? "table-row active" : "table-row"}
              key={claim.claim_id}
              onClick={() => onSelectClaim(claim.claim_id)}
              role="row"
              type="button"
            >
              <span>
                <b>{claim.claim_id}</b>
                {claim.question}
              </span>
              <span>{claim.module}</span>
              <span>
                <StrengthBadge strength={claim.evidence_strength} />
              </span>
              <span>{claim.source_pmids}</span>
            </button>
          ))}
        </div>
      </div>
      <ClaimDetail claim={selectedClaim} compact />
    </section>
  );
}

function QuestionFilters({
  audienceFilter,
  moduleFilter,
  onAudienceFilter,
  onModuleFilter,
  onStrengthFilter,
  strengthFilter,
}: {
  audienceFilter: string;
  moduleFilter: string;
  onAudienceFilter: (value: string) => void;
  onModuleFilter: (value: string) => void;
  onStrengthFilter: (value: string) => void;
  strengthFilter: string;
}) {
  return (
    <div className="index-filters" aria-label="Question filters">
      <div className="index-filters-title">
        <Filter size={16} />
        <span>Refine</span>
      </div>
      <SelectControl
        label="Module"
        onChange={onModuleFilter}
        options={["All", ...modules]}
        value={moduleFilter}
      />
      <SelectControl
        label="Audience"
        onChange={onAudienceFilter}
        options={["All", "patient", "patient_and_technician", "technician"]}
        value={audienceFilter}
      />
      <SelectControl
        label="Strength"
        onChange={onStrengthFilter}
        options={["All", ...strengthOrder]}
        value={strengthFilter}
      />
    </div>
  );
}

function ClaimDetail({
  claim,
  compact = false,
  copied = false,
  onCopy,
}: {
  claim: Claim;
  compact?: boolean;
  copied?: boolean;
  onCopy?: () => void;
}) {
  const sources = parseSources(claim);
  const expansion = getFaqExpansion(claim.claim_id);
  return (
    <article className={compact ? "detail-panel compact" : "detail-panel"}>
      <div className="reader-header">
        <div className="detail-kicker">
          <span>{claim.claim_id}</span>
          <span className="evidence-line">
            <BadgeCheck size={18} />
            Strength of evidence
            <StrengthBadge strength={claim.evidence_strength} />
          </span>
        </div>
        <h2>{claim.question}</h2>
        <p className="claim-text">{claim.claim}</p>
      </div>

      <div className="reader-body">
        <div className="reader-main">
          {expansion && !compact ? <FAQExpansionPanel expansion={expansion} /> : null}

          <ManualBlock icon={<UserRound size={23} />} title="Patient answer" tone="patient">
            {claim.patient_answer}
          </ManualBlock>

          <ManualBlock
            icon={<ClipboardList size={23} />}
            title="Technician detail"
            tone="technician"
          >
            {claim.technician_detail}
          </ManualBlock>

          <div className="answer-grid">
            <ManualBlock icon={<Target size={21} />} title="Clinical action" tone="action">
              {claim.clinical_action}
            </ManualBlock>
            <ManualBlock icon={<AlertTriangle size={21} />} title="Caveat" tone="caveat">
              {claim.caveat}
            </ManualBlock>
          </div>

          {onCopy ? (
            <button className="copy-button" onClick={onCopy} type="button">
              {copied ? <CheckCircle2 size={17} /> : <Copy size={17} />}
              {copied ? "Copied" : "Copy patient answer"}
            </button>
          ) : null}
        </div>

        <SourceRail sources={sources} />
      </div>
    </article>
  );
}

function SourceRail({ sources }: { sources: SourceLink[] }) {
  return (
    <aside className="source-rail" aria-label="PubMed sources">
      <span className="source-rail-title">
        <Library size={18} />
        Sources
      </span>
      <ol>
        {sources.map((source) => (
          <li key={source.pmid}>
            <a href={source.url} rel="noreferrer" target="_blank">
              <span>{source.title}</span>
              <small>
                <Link2 size={13} />
                PMID {source.pmid}
              </small>
            </a>
          </li>
        ))}
      </ol>
    </aside>
  );
}

function FAQExpansionPanel({ expansion }: { expansion: FAQExpansion }) {
  return (
    <section className="faq-expansion-panel">
      <div className="expanded-answer">
        <span>Deeper patient explanation</span>
        <p>{expansion.expanded_patient_answer}</p>
      </div>

      <div className="technician-teaching">
        <div>
          <span>Technician teaching frame</span>
          <p>{expansion.why_it_matters}</p>
        </div>
        <div>
          <span>Evidence note</span>
          <p>{expansion.technician_evidence_note}</p>
        </div>
        <ul>
          {expansion.technician_checklist.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>

      <div className="follow-up-panel">
        <span className="follow-up-heading">
          <MessageCircleQuestion size={19} />
          Likely follow-up questions
        </span>
        {expansion.follow_ups.map((followUp) => (
          <article className="follow-up-card" key={followUp.question}>
            <h3>{followUp.question}</h3>
            <p>{followUp.answer}</p>
            <small>{followUp.route_when}</small>
          </article>
        ))}
      </div>
    </section>
  );
}

function ManualBlock({
  children,
  icon,
  title,
  tone,
}: {
  children: string;
  icon: ReactNode;
  title: string;
  tone: "patient" | "technician" | "action" | "caveat";
}) {
  return (
    <section className={`manual-block ${tone}`}>
      <span className="manual-block-icon">{icon}</span>
      <div>
        <span className="manual-block-title">{title}</span>
        <p>{children}</p>
      </div>
    </section>
  );
}

function SelectControl({
  label,
  onChange,
  options,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  options: string[];
  value: string;
}) {
  return (
    <label className="select-control">
      <span>{label}</span>
      <select onChange={(event) => onChange(event.target.value)} value={value}>
        {options.map((option) => (
          <option key={option} value={option}>
            {option.replace(/_/g, " ")}
          </option>
        ))}
      </select>
    </label>
  );
}

function StrengthBadge({ strength }: { strength: EvidenceStrength }) {
  return <span className={`strength-badge ${strength}`}>{strength}</span>;
}

function moduleLead(module: string): string {
  const leads: Record<string, string> = {
    Mechanisms: "Physical mechanism, state dependence, network language, and biomarker caution.",
    "Safety and Side Effects":
      "Common effects, rare serious risks, screening, escalation, and special populations.",
    "Patient FAQ":
      "Technician-ready answers for caffeine, sleep, medication, sensations, and missed sessions.",
    "Technician Workflow":
      "Room-ready checks for setup fidelity, documentation, RMT, targeting, and scope boundaries.",
    "Protocol Literacy":
      "Protocol differences across 10 Hz, iTBS, bilateral, accelerated, deep TMS, and indications.",
    "Future Expansion: fNIRS, EEG, qEEG, TMS-EEG":
      "Readiness labels, artifact risks, data governance, and interpretation boundaries.",
  };
  return leads[module] ?? "Evidence-linked training claims.";
}

export default App;
