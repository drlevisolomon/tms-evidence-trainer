import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BadgeCheck,
  BookMarked,
  BookOpen,
  Brain,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ClipboardCheck,
  ClipboardList,
  Copy,
  Database,
  FileText,
  Filter,
  GraduationCap,
  HelpCircle,
  Library,
  Link2,
  Search,
  RotateCcw,
  SlidersHorizontal,
  Target,
  MessageCircleQuestion,
  UserRound,
  XCircle,
} from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";
import { claimMatches, claims, modules, parseSources } from "./data/claims";
import { faqExpansionMatches, getFaqExpansion } from "./data/faqExpansions";
import { practiceQuestions } from "./data/practiceQuestions";
import type {
  Claim,
  EvidenceStrength,
  FAQExpansion,
  PracticeConfidence,
  PracticeQuestion,
  SourceLink,
  TabId,
} from "./types";

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
      <PracticeLab
        onSelectClaim={onSelectClaim}
        onSelectModule={onSelectModule}
        setTab={setTab}
      />

      <details className="learn-drawer">
        <summary>
          <span className="section-heading">
            <BookOpen size={20} />
            <h2>Browse Evidence Modules</h2>
          </span>
          <ChevronDown size={18} />
        </summary>
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
      </details>

      <details className="learn-drawer">
        <summary>
          <span className="section-heading">
            <ClipboardList size={20} />
            <h2>Module Sequence</h2>
          </span>
          <ChevronDown size={18} />
        </summary>
        <div className="learning-panel">
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
      </details>
    </section>
  );
}

type PracticeAnswer = {
  choiceId: string;
  confidence: PracticeConfidence;
};

const confidenceOptions: Array<{
  id: PracticeConfidence;
  label: string;
  hint: string;
}> = [
  { id: "low", label: "Low", hint: "Mostly guessing" },
  { id: "medium", label: "Medium", hint: "Narrowed it down" },
  { id: "high", label: "High", hint: "Very sure" },
];

const reviewSectionLabels = ["Answer", "Clue", "Choices", "Objective", "Sources"];

function PracticeLab({
  onSelectClaim,
  onSelectModule,
  setTab,
}: {
  onSelectClaim: (claimId: string) => void;
  onSelectModule: (module: string) => void;
  setTab: (tab: TabId) => void;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, PracticeAnswer>>({});
  const [drafts, setDrafts] = useState<
    Record<string, { choiceId?: string; confidence?: PracticeConfidence }>
  >({});
  const [activeReviewIndex, setActiveReviewIndex] = useState(0);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    answer: true,
    clue: false,
    choices: false,
    objective: false,
    sources: false,
  });

  const currentQuestion = (practiceQuestions[currentIndex] ?? practiceQuestions[0]) as PracticeQuestion;
  const currentDraft = drafts[currentQuestion.id] ?? {};
  const currentAnswer = answers[currentQuestion.id];
  const selectedChoiceId = currentAnswer?.choiceId ?? currentDraft.choiceId ?? "";
  const selectedConfidence = currentAnswer?.confidence ?? currentDraft.confidence ?? null;
  const isSubmitted = Boolean(currentAnswer);
  const answeredCount = Object.keys(answers).length;
  const correctCount = practiceQuestions.filter(
    (question) => answers[question.id]?.choiceId === question.correct_choice_id,
  ).length;
  const missedQuestions = practiceQuestions.filter((question) => {
    const answer = answers[question.id];
    return answer && answer.choiceId !== question.correct_choice_id;
  });
  const highConfidenceMisses = missedQuestions.filter(
    (question) => answers[question.id]?.confidence === "high",
  );
  const unansweredQuestions = practiceQuestions.filter((question) => !answers[question.id]);
  const reviewQueue = missedQuestions.length ? missedQuestions : unansweredQuestions;
  const accuracy = answeredCount ? Math.round((correctCount / answeredCount) * 100) : 0;
  const canSubmit = Boolean(currentDraft.choiceId && currentDraft.confidence && !isSubmitted);

  function updateDraft(questionId: string, next: { choiceId?: string; confidence?: PracticeConfidence }) {
    setDrafts((previous) => ({
      ...previous,
      [questionId]: {
        ...previous[questionId],
        ...next,
      },
    }));
  }

  function submitAnswer() {
    if (!currentDraft.choiceId || !currentDraft.confidence || isSubmitted) return;
    setAnswers((previous) => ({
      ...previous,
      [currentQuestion.id]: {
        choiceId: currentDraft.choiceId as string,
        confidence: currentDraft.confidence as PracticeConfidence,
      },
    }));
  }

  function goToQuestion(index: number) {
    setCurrentIndex(Math.max(0, Math.min(practiceQuestions.length - 1, index)));
    setActiveReviewIndex(0);
  }

  function openClaim(claimId: string) {
    const claim = claims.find((item) => item.claim_id === claimId);
    if (!claim) return;
    onSelectModule(claim.module);
    onSelectClaim(claim.claim_id);
    setTab("ask");
  }

  function resetPractice() {
    setAnswers({});
    setDrafts({});
    setCurrentIndex(0);
    setActiveReviewIndex(0);
    setExpandedSections({
      answer: true,
      clue: false,
      choices: false,
      objective: false,
      sources: false,
    });
  }

  function selectReviewSection(index: number) {
    const sectionIds = ["answer", "clue", "choices", "objective", "sources"];
    const nextIndex = Math.max(0, Math.min(sectionIds.length - 1, index));
    const sectionId = sectionIds[nextIndex] ?? "answer";
    setActiveReviewIndex(nextIndex);
    setExpandedSections((previous) => ({ ...previous, [sectionId]: true }));
  }

  function toggleReviewSection(sectionId: string) {
    setExpandedSections((previous) => ({ ...previous, [sectionId]: !previous[sectionId] }));
  }

  const nextIndex = (currentIndex + 1) % practiceQuestions.length;
  const sourceClaims = currentQuestion.claim_ids
    .map((claimId) => claims.find((claim) => claim.claim_id === claimId))
    .filter(Boolean) as Claim[];

  return (
    <section className="practice-panel" aria-label="Technician practice lab">
      <div className="practice-hero">
        <div>
          <div className="section-heading">
            <GraduationCap size={21} />
            <h2>Technician Practice Lab</h2>
          </div>
          <p>
            Source-anchored single-best-answer questions for FAQ coaching, safety screening,
            workflow judgment, and evidence-boundary language.
          </p>
        </div>
        <div className="practice-metrics" aria-label="Practice progress">
          <span>
            <strong>{answeredCount}/{practiceQuestions.length}</strong>
            answered
          </span>
          <span>
            <strong>{answeredCount ? `${accuracy}%` : "--"}</strong>
            accuracy
          </span>
          <span className={highConfidenceMisses.length ? "metric-alert" : ""}>
            <strong>{highConfidenceMisses.length}</strong>
            high-confidence misses
          </span>
        </div>
      </div>

      <div className="question-slider-panel">
        <div className="slider-copy">
          <span className="practice-label">Question</span>
          <strong>
            {String(currentIndex + 1).padStart(2, "0")} / {practiceQuestions.length}
          </strong>
          <small>{currentQuestion.blueprint}</small>
        </div>
        <div className="question-slider-track">
          <input
            aria-label="Practice question slider"
            max={practiceQuestions.length - 1}
            min={0}
            onChange={(event) => goToQuestion(Number(event.target.value))}
            type="range"
            value={currentIndex}
          />
          <div className="slider-ticks" aria-label="Practice question status">
            {practiceQuestions.map((question, index) => {
              const answer = answers[question.id];
              const isCorrect = answer?.choiceId === question.correct_choice_id;
              return (
                <button
                  aria-label={`Question ${index + 1}: ${question.prompt}`}
                  className={[
                    "slider-tick",
                    index === currentIndex ? "active" : "",
                    answer ? (isCorrect ? "correct" : "missed") : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  key={question.id}
                  onClick={() => goToQuestion(index)}
                  type="button"
                >
                  {index + 1}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="practice-body">
        <article className="practice-card">
          <div className="practice-card-top">
            <span>{currentQuestion.id}</span>
            <span>{currentQuestion.module}</span>
            <span>{currentQuestion.prompt}</span>
          </div>
          <h3>{currentQuestion.stem}</h3>

          <div className="choice-list" role="radiogroup" aria-label="Answer choices">
            {currentQuestion.choices.map((choice) => {
              const isSelected = selectedChoiceId === choice.id;
              const isCorrectChoice = choice.id === currentQuestion.correct_choice_id;
              const choiceState = isSubmitted
                ? isCorrectChoice
                  ? "correct"
                  : isSelected
                    ? "incorrect"
                    : ""
                : isSelected
                  ? "selected"
                  : "";
              return (
                <button
                  aria-checked={isSelected}
                  className={["choice-option", choiceState].filter(Boolean).join(" ")}
                  disabled={isSubmitted}
                  key={choice.id}
                  onClick={() => updateDraft(currentQuestion.id, { choiceId: choice.id })}
                  role="radio"
                  type="button"
                >
                  <span>{choice.id}</span>
                  <p>{choice.text}</p>
                </button>
              );
            })}
          </div>

          <div className="confidence-block">
            <span className="practice-label">Confidence before reveal</span>
            <div className="confidence-row">
              {confidenceOptions.map((option) => (
                <button
                  className={selectedConfidence === option.id ? "confidence-chip active" : "confidence-chip"}
                  disabled={isSubmitted}
                  key={option.id}
                  onClick={() => updateDraft(currentQuestion.id, { confidence: option.id })}
                  type="button"
                >
                  <strong>{option.label}</strong>
                  <small>{option.hint}</small>
                </button>
              ))}
            </div>
          </div>

          <div className="practice-actions">
            <button className="primary-action" disabled={!canSubmit} onClick={submitAnswer} type="button">
              <CheckCircle2 size={17} />
              Submit answer
            </button>
            <button className="quiet-action" onClick={() => goToQuestion(nextIndex)} type="button">
              <ArrowRight size={17} />
              Next question
            </button>
            <button className="quiet-action" onClick={resetPractice} type="button">
              <RotateCcw size={16} />
              Reset
            </button>
          </div>
        </article>

        <PracticeReviewDock
          activeReviewIndex={activeReviewIndex}
          answer={currentAnswer}
          expandedSections={expandedSections}
          highConfidenceMisses={highConfidenceMisses}
          onOpenClaim={openClaim}
          onSelectReviewSection={selectReviewSection}
          onToggleSection={toggleReviewSection}
          onSelectQuestion={goToQuestion}
          question={currentQuestion}
          reviewQueue={reviewQueue.length ? reviewQueue : practiceQuestions}
          sourceClaims={sourceClaims}
        />
      </div>
    </section>
  );
}

function PracticeReviewDock({
  activeReviewIndex,
  answer,
  expandedSections,
  highConfidenceMisses,
  onOpenClaim,
  onSelectQuestion,
  onSelectReviewSection,
  onToggleSection,
  question,
  reviewQueue,
  sourceClaims,
}: {
  activeReviewIndex: number;
  answer?: PracticeAnswer;
  expandedSections: Record<string, boolean>;
  highConfidenceMisses: PracticeQuestion[];
  onOpenClaim: (claimId: string) => void;
  onSelectQuestion: (index: number) => void;
  onSelectReviewSection: (index: number) => void;
  onToggleSection: (sectionId: string) => void;
  question: PracticeQuestion;
  reviewQueue: PracticeQuestion[];
  sourceClaims: Claim[];
}) {
  const isCorrect = answer?.choiceId === question.correct_choice_id;
  const selectedChoice = question.choices.find((choice) => choice.id === answer?.choiceId);
  const correctChoice = question.choices.find((choice) => choice.id === question.correct_choice_id);
  const reviewSections = [
    {
      id: "answer",
      label: "Answer",
      body: answer ? (
        <div className="review-section-body">
          <p>{question.explanation}</p>
          <span>
            Correct answer: {question.correct_choice_id}
            {correctChoice ? `: ${correctChoice.text}` : ""}
          </span>
        </div>
      ) : (
        <div className="review-section-body">
          <p>Explanation available after answer reveal.</p>
        </div>
      ),
    },
    {
      id: "clue",
      label: "Clue",
      body: (
        <div className="review-section-body">
          <p>{question.key_clue}</p>
        </div>
      ),
    },
    {
      id: "choices",
      label: "Choices",
      body: (
        <div className="choice-analysis compact">
          {question.choices.map((choice) => (
            <div
              className={[
                "analysis-row",
                choice.id === question.correct_choice_id ? "correct" : "",
                answer && choice.id === answer.choiceId && !isCorrect ? "selected-miss" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              key={`analysis-${choice.id}`}
            >
              <strong>{choice.id}</strong>
              <p>{question.choice_analysis[choice.id]}</p>
            </div>
          ))}
        </div>
      ),
    },
    {
      id: "objective",
      label: "Objective",
      body: (
        <div className="review-section-body split">
          <div>
            <span className="practice-label">Educational objective</span>
            <p>{question.educational_objective}</p>
          </div>
          <div>
            <span className="practice-label">Technician takeaway</span>
            <p>{question.technician_takeaway}</p>
          </div>
        </div>
      ),
    },
    {
      id: "sources",
      label: "Sources",
      body: (
        <div className="review-section-body">
          <div className="practice-source-links compact">
            <div>
              {question.claim_ids.map((claimId) => (
                <button key={claimId} onClick={() => onOpenClaim(claimId)} type="button">
                  Review {claimId}
                </button>
              ))}
              {question.source_pmids.map((pmid) => (
                <a href={`https://pubmed.ncbi.nlm.nih.gov/${pmid}/`} key={pmid} rel="noreferrer" target="_blank">
                  PMID {pmid}
                </a>
              ))}
            </div>
          </div>
        </div>
      ),
    },
  ];

  const signalText = highConfidenceMisses.length
    ? "High-confidence miss queue active"
    : answer
      ? "Review unlocked"
      : "Awaiting answer";

  return (
    <aside className="practice-review-panel">
      <div className="review-dock-header">
        <span className="section-heading">
          <Brain size={19} />
          <h2>Review Dock</h2>
        </span>
        <small>{signalText}</small>
      </div>

      <div className={answer ? (isCorrect ? "feedback-status correct" : "feedback-status incorrect") : "feedback-status pending"}>
        {answer ? isCorrect ? <CheckCircle2 size={21} /> : <XCircle size={21} /> : <SlidersHorizontal size={21} />}
        <div>
          <strong>{answer ? (isCorrect ? "Correct" : "Review this one") : "Ready for response"}</strong>
          <span>
            {answer
              ? `Selected ${answer.choiceId}${selectedChoice ? `: ${selectedChoice.text}` : ""} - Confidence ${answer.confidence}`
              : "Confidence mark pending."}
          </span>
        </div>
      </div>

      <div className="section-slider">
        <div className="section-slider-top">
          <span className="practice-label">Review Layer</span>
          <strong>{reviewSectionLabels[activeReviewIndex]}</strong>
        </div>
        <input
          aria-label="Review section slider"
          max={reviewSections.length - 1}
          min={0}
          onChange={(event) => onSelectReviewSection(Number(event.target.value))}
          type="range"
          value={activeReviewIndex}
        />
        <div className="section-slider-labels">
          {reviewSections.map((section, index) => (
            <button
              className={index === activeReviewIndex ? "active" : ""}
              key={section.id}
              onClick={() => onSelectReviewSection(index)}
              type="button"
            >
              {section.label}
            </button>
          ))}
        </div>
      </div>

      <div className="review-accordion">
        {reviewSections.map((section, index) => (
          <section className="review-section" key={section.id}>
            <button
              aria-expanded={Boolean(expandedSections[section.id])}
              className={index === activeReviewIndex ? "active" : ""}
              onClick={() => {
                const isExpanded = Boolean(expandedSections[section.id]);
                onSelectReviewSection(index);
                if (isExpanded) onToggleSection(section.id);
              }}
              type="button"
            >
              <span>{section.label}</span>
              {expandedSections[section.id] ? <ChevronDown size={17} /> : <ChevronRight size={17} />}
            </button>
            {expandedSections[section.id] ? section.body : null}
          </section>
        ))}
      </div>

      <div className="review-stack compact">
        <span className="practice-label">Repair Queue</span>
        {reviewQueue.slice(0, 3).map((queuedQuestion) => {
          const index = practiceQuestions.findIndex((item) => item.id === queuedQuestion.id);
          return (
            <button
              className="review-row"
              key={`review-${queuedQuestion.id}`}
              onClick={() => onSelectQuestion(index)}
              type="button"
            >
              <span>{queuedQuestion.id === question.id ? "Current" : "Review next"}</span>
              <strong>{queuedQuestion.prompt}</strong>
              <small>{queuedQuestion.blueprint}</small>
            </button>
          );
        })}
      </div>

      <div className="source-claim-box">
        <span className="practice-label">Current source claims</span>
        {sourceClaims.map((claim) => (
          <button key={claim.claim_id} onClick={() => onOpenClaim(claim.claim_id)} type="button">
            <strong>{claim.claim_id}</strong>
            <span>{claim.question}</span>
          </button>
        ))}
      </div>
    </aside>
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
