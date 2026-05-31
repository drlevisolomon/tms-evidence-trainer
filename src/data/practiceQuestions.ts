import type { PracticeQuestion } from "../types";

export const practiceQuestions: PracticeQuestion[] = [
  {
    id: "TMS-PQ-001",
    module: "Patient FAQ",
    blueprint: "Daily state consistency",
    claim_ids: ["FAQ-002", "FAQ-003", "FAQ-004"],
    source_pmids: ["41346487", "36911138", "34872405", "39756660", "33243615"],
    prompt: "Caffeine, sleep, and medication consistency",
    stem:
      "A patient says they usually drink one cup of coffee, but today they had three because they slept poorly. They ask whether extra caffeine will make the session work better. What is the best technician-level response?",
    choices: [
      {
        id: "A",
        text: "Encourage the extra caffeine because higher alertness should improve stimulation response.",
      },
      {
        id: "B",
        text: "Recommend keeping caffeine near their usual pattern, document today's change, and route sleep or medication concerns through the clinic workflow.",
      },
      {
        id: "C",
        text: "Tell them caffeine must be stopped during the full course unless the treatment intensity is lowered.",
      },
      {
        id: "D",
        text: "Ignore the caffeine change unless the patient has a headache after the session.",
      },
    ],
    correct_choice_id: "B",
    explanation:
      "The evidence-linked training message is consistency rather than optimization. Caffeine, sleep, medication, and substance changes can affect treatment-day brain state, tolerability, and safety screening, but technicians should not prescribe caffeine targets or medication changes.",
    key_clue:
      "The patient changed a usual state variable on the treatment day and is asking for an efficacy recommendation.",
    choice_analysis: {
      A: "Incorrect. This overstates the evidence and turns a consistency topic into an unsupported performance strategy.",
      B: "Correct. It reinforces usual patterns, documents a meaningful change, and keeps clinical decisions within the treatment team.",
      C: "Incorrect. The current claim set supports consistency and reporting, not a universal caffeine ban.",
      D: "Incorrect. Daily state changes are worth documenting before they become tolerability or interpretation problems.",
    },
    educational_objective:
      "Coach stable treatment conditions without implying that technicians can optimize caffeine, sleep, or medication variables for response.",
    technician_takeaway:
      "Use the same script each day: usual caffeine, usual prescribed medications, report poor sleep or major changes, and document what changed.",
  },
  {
    id: "TMS-PQ-002",
    module: "Patient FAQ",
    blueprint: "Medication boundary",
    claim_ids: ["FAQ-004", "TEC-004"],
    source_pmids: ["33243615", "19833552", "28541649", "41949547"],
    prompt: "Medication questions and RMT flags",
    stem:
      "A patient says, 'I skipped my antidepressant this morning because I thought TMS might work better without it.' Which response best fits technician scope and the evidence-based workflow?",
    choices: [
      {
        id: "A",
        text: "Agree, because fewer medications usually lower interference with neuromodulation.",
      },
      {
        id: "B",
        text: "Tell the patient to restart the medication immediately in the chair before stimulation.",
      },
      {
        id: "C",
        text: "Explain that medications should be taken as prescribed unless the prescriber changes them, document the missed dose, and alert the clinician per protocol.",
      },
      {
        id: "D",
        text: "Proceed without documenting the change because it was only one dose.",
      },
    ],
    correct_choice_id: "C",
    explanation:
      "Medication changes can affect symptoms, safety screening, seizure threshold, and motor-threshold interpretation. The technician should not advise medication stopping or restarting independently; the right move is documentation and clinician review through the local protocol.",
    key_clue:
      "The patient independently changed a prescribed medication to influence TMS response.",
    choice_analysis: {
      A: "Incorrect. It gives unsupported medication advice and implies a mechanism the evidence does not support.",
      B: "Incorrect. It still gives medication direction without prescriber input.",
      C: "Correct. It preserves medication-as-prescribed guidance and escalates the change appropriately.",
      D: "Incorrect. Even a single missed or changed dose may matter for documentation and clinical review.",
    },
    educational_objective:
      "Separate patient education from prescribing decisions when medication changes arise during a TMS course.",
    technician_takeaway:
      "Never coach medication changes for TMS response. Document, reassure within scope, and route to the prescriber or clinician.",
  },
  {
    id: "TMS-PQ-003",
    module: "Safety and Side Effects",
    blueprint: "Expected sensation versus escalation",
    claim_ids: ["FAQ-001", "FAQ-013", "FAQ-017", "FAQ-024"],
    source_pmids: ["33243615", "19833552", "28541649", "27090022"],
    prompt: "Tapping, twitching, pain, and headache",
    stem:
      "During the first minute of stimulation, a patient says the tapping feels rhythmic and strange but tolerable. There is mild forehead twitching near the coil and no spreading pain or neurologic symptoms. What is the best response?",
    choices: [
      {
        id: "A",
        text: "Normalize expected tapping and nearby muscle activation, keep monitoring, and invite the patient to report sharp, escalating, unusual, or spreading symptoms.",
      },
      {
        id: "B",
        text: "Stop the course permanently because any twitching means the coil is damaging tissue.",
      },
      {
        id: "C",
        text: "Increase intensity quickly because more sensation means stronger treatment.",
      },
      {
        id: "D",
        text: "Tell the patient that discomfort proves the treatment is working.",
      },
    ],
    correct_choice_id: "A",
    explanation:
      "Tapping and superficial twitching can occur because pulses activate scalp nerves and nearby muscles. The teaching goal is calm normalization plus active monitoring. The boundary is important: severe, unusual, escalating, spreading, or neurologic symptoms should be assessed and escalated.",
    key_clue:
      "The sensation is local, familiar with stimulation, tolerable, and not paired with red flags.",
    choice_analysis: {
      A: "Correct. It pairs accurate reassurance with a clear safety boundary.",
      B: "Incorrect. Expected local activation is not the same as tissue damage.",
      C: "Incorrect. Intensity should follow the prescribed protocol, not patient sensation.",
      D: "Incorrect. Pain or discomfort is not a reliable marker of efficacy.",
    },
    educational_objective:
      "Distinguish expected peripheral sensations from symptoms that require setup review or clinical escalation.",
    technician_takeaway:
      "Use neutral language: expected tapping can be normal, but sharp, worsening, unusual, or spreading symptoms should be reported immediately.",
  },
  {
    id: "TMS-PQ-004",
    module: "Mechanisms",
    blueprint: "Plain-language mechanism",
    claim_ids: ["FAQ-014", "MEC-010"],
    source_pmids: ["33243615", "19833552", "28541649", "27090022"],
    prompt: "How TMS works and how it differs from ECT",
    stem:
      "A patient asks, 'Is this electricity going through my scalp like ECT?' Which explanation is most accurate and least stigmatizing?",
    choices: [
      {
        id: "A",
        text: "TMS is basically a smaller version of ECT, but without the hospital setting.",
      },
      {
        id: "B",
        text: "TMS uses a rapidly changing magnetic field to induce small electric fields in targeted brain tissue; it is outpatient, nonconvulsive, and does not require anesthesia.",
      },
      {
        id: "C",
        text: "TMS sends direct electrical current through the scalp, but the current is too weak to matter.",
      },
      {
        id: "D",
        text: "TMS works by instantly raising serotonin during each pulse.",
      },
    ],
    correct_choice_id: "B",
    explanation:
      "The plain-language mechanism is magnetic induction, not direct electrical injection through the scalp. TMS is procedurally distinct from ECT: patients are awake, anesthesia is not required, and the treatment is not intended to induce a seizure. The explanation should not disparage ECT, which remains evidence-based in appropriate situations.",
    key_clue:
      "The patient is combining two misconceptions: direct scalp electricity and ECT equivalence.",
    choice_analysis: {
      A: "Incorrect. It blurs an important procedural and mechanistic distinction.",
      B: "Correct. It gives a precise mechanism and a respectful TMS-versus-ECT boundary.",
      C: "Incorrect. It reverses the core mechanism and may increase fear.",
      D: "Incorrect. It gives an oversimplified neurotransmitter claim not supported by the training evidence.",
    },
    educational_objective:
      "Explain TMS with magnetic induction language while avoiding simplistic or stigmatizing comparisons.",
    technician_takeaway:
      "Say: magnetic pulse, induced small electric fields in the target, awake outpatient treatment, not intended to cause a seizure.",
  },
  {
    id: "TMS-PQ-005",
    module: "Technician Workflow",
    blueprint: "Pre-session verification",
    claim_ids: ["TEC-001", "FAQ-009", "FAQ-010"],
    source_pmids: ["33243615", "28541649", "27090022", "11332408", "19833552"],
    prompt: "Why the same questions happen every day",
    stem:
      "A patient is annoyed and says, 'Why do you ask the same questions every day? Nothing changed.' Which technician response best supports adherence and safety?",
    choices: [
      {
        id: "A",
        text: "Apologize and skip the daily check when the patient says nothing changed.",
      },
      {
        id: "B",
        text: "Explain that repeated screening catches changes in safety status, medications, sleep, substances, symptoms, and adverse events that may matter for today's session.",
      },
      {
        id: "C",
        text: "Say the questions are only for insurance documentation and do not affect care.",
      },
      {
        id: "D",
        text: "Ask only about mood because mood is the only variable that changes session safety.",
      },
    ],
    correct_choice_id: "B",
    explanation:
      "Daily screening is active safety work. It checks identity, order/protocol details, adverse events, contraindication updates, medication/substance changes, sleep, symptoms, and other flags that can alter treatment-day risk or workflow.",
    key_clue:
      "The patient is frustrated by repetition, not refusing care or reporting an urgent symptom.",
    choice_analysis: {
      A: "Incorrect. The same-day check is part of setup fidelity and safety workflow.",
      B: "Correct. It explains the purpose while preserving the check.",
      C: "Incorrect. It minimizes the clinical value of repeated screening.",
      D: "Incorrect. Safety screening is broader than mood.",
    },
    educational_objective:
      "Frame repetitive screening as patient-facing safety practice rather than clerical repetition.",
    technician_takeaway:
      "A good daily check is brief, consistent, documented, and escalates positive answers.",
  },
  {
    id: "TMS-PQ-006",
    module: "Technician Workflow",
    blueprint: "RMT recheck triggers",
    claim_ids: ["FAQ-016", "TEC-004", "TEC-001"],
    source_pmids: ["33243615", "41949547", "42082007", "37738899", "28541649"],
    prompt: "Motor threshold as calibration",
    stem:
      "A patient asks whether a higher motor threshold means their depression is worse. They also report a new medication change and several nights of severe sleep deprivation. What is the best technician-level framing?",
    choices: [
      {
        id: "A",
        text: "Explain that RMT is a personalized dosing calibration, not a mood severity test, and flag the medication and sleep changes for protocol-based review.",
      },
      {
        id: "B",
        text: "Tell them a higher threshold means the treatment is failing.",
      },
      {
        id: "C",
        text: "Reassure them that sleep and medication changes never affect motor threshold.",
      },
      {
        id: "D",
        text: "Skip documentation unless the hand movement disappears completely.",
      },
    ],
    correct_choice_id: "A",
    explanation:
      "RMT is used to scale dose to the individual and method, not to grade depression or response. Meaningful state changes, medication changes, neurologic events, treatment gaps, or unexpected tolerability/motor findings can be reasons to escalate or recheck according to clinic SOP.",
    key_clue:
      "The patient confuses calibration with clinical severity and reports possible RMT-shifting state changes.",
    choice_analysis: {
      A: "Correct. It explains RMT accurately and routes recheck triggers through protocol.",
      B: "Incorrect. RMT is not a response or mood severity score.",
      C: "Incorrect. State and medication changes can matter and should not be dismissed.",
      D: "Incorrect. Documentation matters before the most extreme finding occurs.",
    },
    educational_objective:
      "Teach RMT as dose calibration and identify changes that should trigger clinician or SOP review.",
    technician_takeaway:
      "Document RMT method and context, and do not interpret threshold changes as patient improvement or worsening.",
  },
  {
    id: "TMS-PQ-007",
    module: "Safety and Side Effects",
    blueprint: "Rare serious events",
    claim_ids: ["FAQ-018", "FAQ-019", "FAQ-023"],
    source_pmids: ["33243615", "19833552", "34133991", "9474057", "1549231"],
    prompt: "Seizure risk and ear protection",
    stem:
      "A new technician says, 'Seizures are so rare that we probably do not need to review the emergency plan often.' What is the best teaching correction?",
    choices: [
      {
        id: "A",
        text: "Correct. Rare events can be left to the clinician because technicians will not be involved.",
      },
      {
        id: "B",
        text: "Seizures are rare when screening and guidelines are followed, but technicians still need to recognize them, stop stimulation, protect the patient, and summon help according to the clinic procedure.",
      },
      {
        id: "C",
        text: "Seizures are common enough that every patient should expect one.",
      },
      {
        id: "D",
        text: "Ear protection is the main seizure prevention step.",
      },
    ],
    correct_choice_id: "B",
    explanation:
      "The evidence-based stance is reassurance plus readiness. TMS-associated seizures are rare under guideline-based practice, but they remain the serious acute event technicians must be trained to identify and respond to. Ear protection is for coil noise and hearing safety, not seizure prevention.",
    key_clue:
      "The technician is using low incidence to justify weak emergency preparedness.",
    choice_analysis: {
      A: "Incorrect. Technicians are present during stimulation and need a practiced emergency role.",
      B: "Correct. It preserves accurate risk framing and operational readiness.",
      C: "Incorrect. This exaggerates risk and undermines patient education.",
      D: "Incorrect. Ear protection addresses acoustic exposure, not seizure risk.",
    },
    educational_objective:
      "Hold two ideas together: seizure is rare, and emergency response training is still essential.",
    technician_takeaway:
      "Know the seizure SOP before the first session: stop stimulation, keep the patient safe, call for medical help, and document according to policy.",
  },
  {
    id: "TMS-PQ-008",
    module: "Safety and Side Effects",
    blueprint: "Activation and mood safety",
    claim_ids: ["FAQ-020", "FAQ-010", "FAQ-003"],
    source_pmids: ["33243615", "28541649", "31901449", "19833552", "39756660"],
    prompt: "Possible hypomanic activation",
    stem:
      "A patient who is usually depressed reports needing only two hours of sleep for several nights, feeling unusually energized, spending impulsively, and feeling unlike themselves. What should the technician do?",
    choices: [
      {
        id: "A",
        text: "Celebrate the improvement and continue treatment without notifying anyone.",
      },
      {
        id: "B",
        text: "Document the change and escalate suspected manic, hypomanic, mixed, or unsafe activation symptoms to the treating clinician before continuing per protocol.",
      },
      {
        id: "C",
        text: "Tell the patient to take a sedating medication before the next session.",
      },
      {
        id: "D",
        text: "Ask only whether they have a headache because activation is not relevant to TMS.",
      },
    ],
    correct_choice_id: "B",
    explanation:
      "Mood switching or activation is uncommon but important to detect. Decreased need for sleep, impulsivity, agitation, unusual energy, mixed symptoms, or safety concerns should be routed to the clinician rather than framed as simple improvement.",
    key_clue:
      "Decreased need for sleep plus impulsive, energized, unlike-self behavior is a safety signal.",
    choice_analysis: {
      A: "Incorrect. Apparent improvement can still represent unsafe activation.",
      B: "Correct. It documents and escalates before continuing according to protocol.",
      C: "Incorrect. That is medication advice outside technician scope.",
      D: "Incorrect. Mood and sleep changes are relevant daily-screening variables.",
    },
    educational_objective:
      "Recognize activation symptoms that require clinician review during a TMS course.",
    technician_takeaway:
      "Do not interpret sudden energy as response without screening for sleep need, impulsivity, agitation, and safety.",
  },
  {
    id: "TMS-PQ-009",
    module: "Safety and Side Effects",
    blueprint: "Implant and metal review",
    claim_ids: ["FAQ-022", "FAQ-023", "TEC-001"],
    source_pmids: ["33243615", "19833552", "9803953", "9918361", "28541649"],
    prompt: "Implants, devices, and hardware",
    stem:
      "At the first visit, a patient mentions an implanted stimulator but cannot remember the model. Which action best matches the safety workflow?",
    choices: [
      {
        id: "A",
        text: "Proceed if the device is far from the head because model information rarely matters.",
      },
      {
        id: "B",
        text: "Document device type, location, and manufacturer/model if available, then obtain clinician clearance before stimulation according to the clinic protocol.",
      },
      {
        id: "C",
        text: "Tell the patient all implants automatically rule out TMS.",
      },
      {
        id: "D",
        text: "Ask the patient to sign a waiver and continue if they feel comfortable.",
      },
    ],
    correct_choice_id: "B",
    explanation:
      "Implanted electronic devices, ferromagnetic or conductive material, shrapnel, clips, stimulators, and hearing devices are safety-review triggers. Compatibility decisions may require device details, manuals, manufacturer information, imaging history, or specialist input.",
    key_clue:
      "There is an implanted device with incomplete identifying information.",
    choice_analysis: {
      A: "Incorrect. Distance alone is not enough for technician clearance.",
      B: "Correct. It gathers the details needed for clinician-level safety review.",
      C: "Incorrect. Some situations may be cleared, but not by the technician alone.",
      D: "Incorrect. Patient comfort does not replace a device-safety workflow.",
    },
    educational_objective:
      "Treat implants and metal as structured safety-review triggers, not as casual yes/no judgments.",
    technician_takeaway:
      "Collect specifics, stop independent clearance, and route through the prescriber or medical director process.",
  },
  {
    id: "TMS-PQ-010",
    module: "Patient FAQ",
    blueprint: "Adherence and missed sessions",
    claim_ids: ["FAQ-005", "FAQ-011", "FAQ-015", "FAQ-025"],
    source_pmids: ["28541649", "27090022", "31901449"],
    prompt: "Course adherence, stopping early, and maintenance",
    stem:
      "A patient missed two appointments and asks whether they can do two sessions tomorrow to catch up. They also say they may stop early if they feel better next week. What is the best response?",
    choices: [
      {
        id: "A",
        text: "Tell them doubling up is always fine because only the total number of pulses matters.",
      },
      {
        id: "B",
        text: "Ask them to call the clinic for the makeup plan, explain that schedule changes and early stopping are clinician decisions, and reinforce that TMS is delivered as a repeated course.",
      },
      {
        id: "C",
        text: "Tell them stopping early is recommended once they feel any improvement.",
      },
      {
        id: "D",
        text: "Explain that maintenance is mandatory for every patient after the acute course.",
      },
    ],
    correct_choice_id: "B",
    explanation:
      "TMS courses are repeated protocols, and missed sessions should follow prescriber, device, and clinic policy. Early stopping, extension, continuation, maintenance, and retreatment plans are individualized clinician decisions rather than technician promises.",
    key_clue:
      "The patient asks for schedule changes and treatment-course decisions.",
    choice_analysis: {
      A: "Incorrect. Makeups are protocol and clinic-policy decisions, not casual doubling.",
      B: "Correct. It keeps the patient engaged while routing schedule and course decisions appropriately.",
      C: "Incorrect. Feeling better should trigger team discussion, not unilateral early stopping.",
      D: "Incorrect. Maintenance exists but is not universal or standardized for every patient.",
    },
    educational_objective:
      "Use adherence counseling that respects cumulative treatment design and local protocol boundaries.",
    technician_takeaway:
      "Do not promise catch-up schedules, early-stop rules, or maintenance frequency. Route and document.",
  },
  {
    id: "TMS-PQ-011",
    module: "Protocol Literacy",
    blueprint: "Protocol humility",
    claim_ids: ["FAQ-006", "FAQ-015", "FAQ-025"],
    source_pmids: ["17573044", "28541649", "27090022", "31901449"],
    prompt: "Response timing and protocol differences",
    stem:
      "After five sessions, a patient says they do not feel better and asks whether that means TMS will not work for them. Which response is most appropriate?",
    choices: [
      {
        id: "A",
        text: "Tell them early nonresponse proves the full course will fail.",
      },
      {
        id: "B",
        text: "Explain that response often emerges over a course, encourage honest symptom reporting, and avoid predicting individual outcome from a few sessions.",
      },
      {
        id: "C",
        text: "Promise they will improve by the halfway point if they attend every appointment.",
      },
      {
        id: "D",
        text: "Suggest switching protocols without clinician review.",
      },
    ],
    correct_choice_id: "B",
    explanation:
      "Antidepressant response may emerge across the treatment course, and early nonresponse does not by itself prove failure. Technicians can support adherence and accurate symptom reporting, while clinicians handle response assessment, protocol changes, and maintenance or retreatment decisions.",
    key_clue:
      "Only a few sessions have occurred, and the patient is asking for outcome prediction.",
    choice_analysis: {
      A: "Incorrect. It overinterprets early nonresponse.",
      B: "Correct. It supports adherence and honest reporting without promising or predicting.",
      C: "Incorrect. It makes an individualized promise not supported by evidence.",
      D: "Incorrect. Protocol changes require clinician-level review.",
    },
    educational_objective:
      "Set expectations about course-level response while avoiding deterministic outcome claims.",
    technician_takeaway:
      "Use measured language: many people need multiple weeks, keep reporting symptoms, and the clinician reviews response over time.",
  },
  {
    id: "TMS-PQ-012",
    module: "Future Expansion: fNIRS, EEG, qEEG, TMS-EEG",
    blueprint: "Biomarker caution",
    claim_ids: ["TEC-001", "FAQ-016"],
    source_pmids: ["33243615", "28541649", "41949547", "42082007"],
    prompt: "Evidence boundaries for technical add-ons",
    stem:
      "A clinic is piloting qEEG and fNIRS workflows. A patient asks whether today's biomarker reading proves the TMS session will work. Which technician response is safest?",
    choices: [
      {
        id: "A",
        text: "Tell them the biomarker predicts their individual response with certainty.",
      },
      {
        id: "B",
        text: "Explain that technical measures can help research or clinic workflows when validated locally, but they should not be presented as certain individual response predictions unless the clinician and protocol support that claim.",
      },
      {
        id: "C",
        text: "Say biomarkers are useless and should never be documented.",
      },
      {
        id: "D",
        text: "Change stimulation intensity based on the reading if the technician thinks it looks abnormal.",
      },
    ],
    correct_choice_id: "B",
    explanation:
      "The app's future-expansion stance should be evidence-forward and cautious. Biomarkers, qEEG, fNIRS, and TMS-EEG workflows may be useful in research or structured clinical programs, but technicians should not convert them into unsupported individual-response promises or unsupervised treatment changes.",
    key_clue:
      "The patient asks for certainty from a technical measure in a developing workflow.",
    choice_analysis: {
      A: "Incorrect. It overclaims predictive certainty.",
      B: "Correct. It preserves the value of technical workflows while respecting validation and clinician boundaries.",
      C: "Incorrect. It dismisses potentially useful data rather than explaining its limits.",
      D: "Incorrect. Treatment changes require protocol and clinician authority.",
    },
    educational_objective:
      "Apply evidence-boundary language to emerging TMS-adjacent measurement tools.",
    technician_takeaway:
      "For technical add-ons, say what is measured, why it is being collected, and what it cannot prove for the individual patient.",
  },
];
