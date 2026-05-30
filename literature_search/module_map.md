# Training Module Map

This map turns the literature corpus into platform modules. Each module should ultimately have two layers: technician-facing operational detail and patient-facing explanation language.

## 1. Mechanisms and Treatment Rationale

Core questions:

- What is a magnetic pulse and how does it induce cortical electric fields?
- What is the difference between acute stimulation effects and repeated-session neuroplasticity?
- How should technicians explain network-level modulation without overpromising?
- What is known versus theoretical for DLPFC, sgACC connectivity, theta burst, and accelerated protocols?

Starting sources: `pubmed_anchor_sources.csv` buckets `mechanism_theta_burst`, `therapeutic_guideline`, `clinical_depression_trial`, and `accelerated_protocol`.

## 2. Patient FAQ and Counseling

Core questions:

- What sensations are normal during treatment?
- Which side effects are common, uncommon, or urgent?
- Why do clinics ask about seizure history, implanted devices, pregnancy, medications, and sleep?
- Why should patients keep caffeine, sleep, and medication routines consistent across sessions?
- How should technicians discuss missed sessions, symptom fluctuation, and time-to-response?

Starting sources: `safety_guideline`, `safety_adverse_events`, `safety_screening`, `state_caffeine`, and `state_medications`.

## 3. Technician Equipment Workflow

Core questions:

- How should technicians prepare the patient and document contraindication screening?
- How is resting motor threshold determined, and what can shift it?
- When should motor threshold be rechecked?
- How do scalp-based targeting, Beam F3, 5 cm/5.5 cm rules, neuronavigation, and circuit-guided targeting differ?
- What are the operational failure modes: coil drift, wrong orientation, missed ear protection, discomfort, and inadequate documentation?

Starting sources: `technician_motor_threshold`, `technician_localization`, `safety_guideline`, and `clinical_depression_consensus`.

## 4. Protocol Literacy

Core questions:

- How do high-frequency left DLPFC, low-frequency right DLPFC, bilateral rTMS, iTBS, cTBS, accelerated iTBS, SNT/SAINT, and deep TMS differ?
- Which protocols are best-supported for depression, OCD, smoking cessation, pain, migraine, and other indications?
- What is FDA-cleared, guideline-supported, experimental, or investigational?

Starting sources: `therapeutic_guideline`, `clinical_depression_consensus`, `clinical_depression_trial`, and `accelerated_protocol`.

## 5. Future Expansion: fNIRS, EEG, qEEG, and TMS-EEG

Core questions:

- What can each modality measure during or around TMS?
- Which measures are biomarkers, which are research tools, and which are clinic-ready?
- What artifacts and workflow burdens matter for technicians?
- Which claims should remain exploratory?

Starting sources: `fnirs_future_expansion`, `tms_eeg_future_expansion`, and `eeg_biomarkers_future_expansion`.

## Screening Priorities

1. Screen anchor sources first and extract claims into `evidence_extraction_template.csv`.
2. Screen `pubmed_reviews_guidelines.csv` by module bucket to fill consensus-level claims.
3. Use `pubmed_records.csv` to answer narrow patient FAQ and technician workflow questions.
4. Mark every answer as `strong`, `moderate`, `limited`, `theoretical`, or `clinic-policy-dependent`.
