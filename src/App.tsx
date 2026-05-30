import React, { useState } from 'react';
import { 
  BookOpen, ShieldAlert, Brain, Activity, HelpCircle, 
  CheckCircle, ExternalLink, ChevronRight, Menu, X, Stethoscope, Zap
} from 'lucide-react';

// --- DATA STRUCTURES ---

const LEARNING_MODULES = [
  {
    id: 1,
    title: "Mechanism of Action & Faraday's Law",
    icon: <Brain className="w-6 h-6 text-blue-600" />,
    content: "TMS utilizes Faraday's principle of electromagnetic induction. A brief, high-current electrical pulse (up to 5000 amps) is sent through a wire coil, generating a rapidly fluctuating magnetic field (typically 1.5 to 3 Tesla) perpendicular to the coil. This magnetic field easily passes through the scalp and skull without resistance. Once it reaches the conductive brain tissue, it induces a secondary electrical current (eddy current) that depolarizes superficial cortical neurons, leading to action potentials.",
    citations: [
      { text: "Barker et al., 1985 (First demonstration of TMS)", url: "https://pubmed.ncbi.nlm.nih.gov/4004901/" },
      { text: "Hallett, 2007 (Transcranial magnetic stimulation and the human brain)", url: "https://pubmed.ncbi.nlm.nih.gov/17627400/" }
    ]
  },
  {
    id: 2,
    title: "Safety, Seizures & Contraindications",
    icon: <ShieldAlert className="w-6 h-6 text-red-600" />,
    content: "The primary severe risk of TMS is the induction of a seizure (incidence <0.01% with standard parameters). Absolute contraindications include non-removable ferromagnetic metal in or near the head (excluding dental work). Technicians must screen daily for changes in seizure thresholds, including alcohol withdrawal, missed sleep, or medication changes (especially Bupropion/Wellbutrin). Hearing protection is mandatory due to the acoustic artifact (click) which can exceed 100dB.",
    citations: [
      { text: "Rossi et al., 2021 (Safety, ethical considerations, and application guidelines)", url: "https://pubmed.ncbi.nlm.nih.gov/33031751/" }
    ]
  },
  {
    id: 3,
    title: "Motor Threshold Determination",
    icon: <Zap className="w-6 h-6 text-yellow-500" />,
    content: "The resting Motor Threshold (rMT) is the fundamental unit of dosing in TMS. It is defined as the minimum machine intensity required to elicit a Motor Evoked Potential (MEP) of at least 50µV in the target muscle (usually the Abductor Pollicis Brevis or First Dorsal Interosseous) in 5 out of 10 consecutive trials. Accurate rMT determination is critical; an rMT that is erroneously high could lead to accidental overstimulation and seizure risk.",
    citations: [
      { text: "Awiszus, 2003 (TMS and threshold hunting)", url: "https://pubmed.ncbi.nlm.nih.gov/14690367/" }
    ]
  },
  {
    id: 4,
    title: "Targeting Methods: Beam F3 vs. 5cm Rule",
    icon: <Activity className="w-6 h-6 text-green-600" />,
    content: "Historically, the DLPFC was targeted by finding the motor hotspot and moving 5cm anteriorly. This '5cm rule' has been largely abandoned as it often stimulates the premotor cortex instead of the DLPFC, leading to poor clinical outcomes. The modern standard is the 'Beam F3' method, which uses three skull measurements (Nasion-Inion, Tragus-Tragus, Head Circumference) to calculate the precise F3 EEG coordinate, significantly improving treatment efficacy.",
    citations: [
      { text: "Beam et al., 2009 (An efficient and accurate new method for locating the F3 position)", url: "https://pubmed.ncbi.nlm.nih.gov/19201014/" }
    ]
  }
];

const CLINICAL_PROTOCOLS = [
  {
    name: "Standard MDD (High Frequency Left)",
    target: "Left DLPFC (F3)",
    parameters: "10 Hz frequency, 120% of Motor Threshold (MT)",
    trains: "4 seconds ON, 26 seconds OFF. 75 trains total.",
    pulses: "3,000 pulses per session",
    duration: "37.5 minutes (can be shortened to 19 mins with 11s OFF)",
    citation: "O'Reardon et al., 2007 (Efficacy and Safety of TMS in Acute MDD)"
  },
  {
    name: "Intermittent Theta Burst (iTBS)",
    target: "Left DLPFC (F3)",
    parameters: "Triplets of 50 Hz pulses repeated at 5 Hz, 120% of MT",
    trains: "2 seconds ON, 8 seconds OFF.",
    pulses: "600 pulses per session",
    duration: "3 minutes, 9 seconds",
    citation: "Blumberger et al., 2018 (THREE-D Trial for treatment-resistant depression)"
  },
  {
    name: "OCD Protocol (Deep TMS)",
    target: "Medial Prefrontal Cortex / ACC",
    parameters: "20 Hz frequency, 100% of Leg Motor Threshold",
    trains: "2 seconds ON, 20 seconds OFF.",
    pulses: "2,000 pulses per session",
    duration: "18.5 minutes (REQUIRES 5-minute symptom provocation prior)",
    citation: "Carmi et al., 2019 (Efficacy and Safety of Deep TMS for OCD)"
  }
];

const EQUIPMENT_DATA = {
  manufacturers: [
    {
      name: "NeuroStar (Neuronetics)",
      description: "The first FDA-cleared device for MDD (2008). Utilizes a proprietary solid-core iron coil and contact sensing technology. Features built-in MT determination software and uses the MT assist accessory.",
      models: ["Advanced Therapy System"]
    },
    {
      name: "MagVenture",
      description: "Known for active liquid cooling systems allowing for continuous, high-throughput protocols like iTBS without overheating. Was the pivotal device used in the THREE-D iTBS trial.",
      models: ["MagPro R30", "MagPro X100"]
    },
    {
      name: "Brainsway",
      description: "Utilizes proprietary H-Coils designed for Deep TMS. Instead of focal stimulation, these helmets stimulate larger, deeper brain volumes (e.g., the insula or anterior cingulate cortex for OCD and Smoking Cessation).",
      models: ["Deep TMS Helmet Systems"]
    },
    {
      name: "Nexstim",
      description: "The gold standard for Navigated TMS (nTMS). Uses a 3D MRI rendering of the patient's specific brain and an infrared camera tracking system to ensure millimeter-perfect coil placement on the exact gyri every single pulse.",
      models: ["NBT System", "NBS System"]
    }
  ],
  coils: [
    {
      type: "Figure-8 (Butterfly) Coil",
      features: "Most common. Creates a focal magnetic field at the intersection of the two loops. Ideal for precise targeting of the dorsolateral prefrontal cortex (DLPFC). Depth: ~1.5 - 2 cm."
    },
    {
      type: "H-Coil",
      features: "Housed in a helmet. Wraps around the head to create a summation of magnetic fields, penetrating deeper into the cortex at the sacrifice of focality. Depth: ~3 - 4 cm."
    },
    {
      type: "Sham Coils",
      features: "Used in double-blind clinical trials. They mimic the loud acoustic click and often deliver a small electrical shock to the scalp to mimic muscle twitching, but emit no magnetic field into the brain."
    }
  ]
};

const QUIZ_QUESTIONS = [
  {
    question: "Which of the following is an ABSOLUTE contraindication for receiving standard TMS?",
    options: [
      "A history of mild concussions",
      "Cochlear implants",
      "Taking an SSRI antidepressant",
      "Titanium dental fillings"
    ],
    answer: 1,
    explanation: "Cochlear implants contain ferromagnetic material and sensitive electronics located near the head. They can heat up, move, or malfunction due to the magnetic field. Dental fillings are generally safe as they are not strongly ferromagnetic."
  },
  {
    question: "According to standard safety guidelines (Rossi et al.), what is the estimated risk of inducing a seizure during standard rTMS?",
    options: ["<0.01%", "1%", "5%", "10%"],
    answer: 0,
    explanation: "When safety guidelines regarding frequency, intensity, and train duration are followed, the risk of a crude seizure is extremely low, estimated at less than 1 in 10,000 sessions."
  },
  {
    question: "Why must patients and technicians wear earplugs during a TMS session?",
    options: [
      "To prevent electromagnetic interference with the auditory nerve",
      "To block out clinic noise to help the patient sleep",
      "To protect against the acoustic artifact (click) caused by coil wire expansion",
      "It is only recommended, not strictly required"
    ],
    answer: 2,
    explanation: "The rapid pulse of electricity through the coil causes the wires to momentarily expand and contract, producing a loud acoustic click that can exceed 100 dB, which can cause transient or permanent hearing threshold shifts."
  },
  {
    question: "A patient comes in for treatment 15 and mentions they started taking Wellbutrin (Bupropion) yesterday. What is the correct action?",
    options: [
      "Proceed with treatment as normal.",
      "Lower the intensity by 10% just to be safe.",
      "Stop. Do not treat. The Motor Threshold must be re-evaluated and the physician consulted.",
      "Only use the right-sided low-frequency protocol."
    ],
    answer: 2,
    explanation: "Bupropion (Wellbutrin) significantly lowers the seizure threshold. The patient's resting motor threshold has likely changed. Treating them at their old intensity is a major seizure risk. The MT must be re-mapped."
  },
  {
    question: "Why is the '5cm rule' for finding the DLPFC no longer the gold standard?",
    options: [
      "It takes too long to measure.",
      "It is uncomfortable for the patient.",
      "It fails to account for varying head sizes, often stimulating the premotor cortex instead of the DLPFC.",
      "It requires an MRI for every patient."
    ],
    answer: 2,
    explanation: "The 5cm rule assumes all heads are the same size. In larger heads, moving 5cm forward from the motor strip lands the coil on the premotor cortex. Beam F3 accounts for individual skull proportions."
  },
  {
    question: "During the OCD protocol with an H-Coil, what MUST happen before the magnet is turned on?",
    options: [
      "The patient must be asleep.",
      "The patient must undergo a 5-minute symptom provocation (internalizing the obsessive thought).",
      "The patient must take an anxiolytic.",
      "The coil must be chilled to freezing temperatures."
    ],
    answer: 1,
    explanation: "The Carmi pivotal trial demonstrated that for the medial prefrontal cortex to be receptive to plasticity changes, the relevant neural circuits must be active. Provoking the OCD symptom prior to stimulation is an FDA requirement for this protocol."
  }
];

const FAQS = {
  technicians: [
    { q: "What do I do if I reach 100% machine output and still can't find a Motor Threshold?", a: "Ensure perfect coil contact and angle (45 degrees to the midline). Ensure the patient is not tensing their hand or neck. Check if the patient is on heavily sedating medications (like high-dose benzodiazepines). If it's a true high MT, consult the physician—some patients cannot be effectively treated if their MT exceeds the machine's capacity to deliver 120%." },
    { q: "The patient fainted in the chair. Was it a seizure?", a: "Syncope (fainting) is usually vasovagal, often caused by anxiety or pain, and involves sudden paleness, sweating, and slumping over. A generalized tonic-clonic seizure involves loss of consciousness followed by rigid stiffening (tonic phase) and rhythmic jerking (clonic phase). Always follow your clinic's emergency protocol." },
    { q: "Can a patient fall asleep during treatment?", a: "It is strongly discouraged. Sleep drastically alters cortical excitability and EEG rhythms (shifting into delta/theta waves). The efficacy of protocols like 10Hz or iTBS rely on the brain being in an awake, alert state." },
    { q: "What should I do if the patient twitches heavily in their face during treatment?", a: "Facial twitching is common due to the stimulation of superficial facial nerves. If it is painful for the patient, you may need to adjust the coil angle slightly, ensuring you maintain contact with the targeted DLPFC location, or use a bite guard." },
    { q: "How often should Motor Threshold (MT) be re-evaluated?", a: "MT should be checked before the first treatment and ideally re-checked periodically (e.g., every 10 sessions), or immediately if the patient starts a new medication, stops a medication, or experiences a significant change in sleep patterns." }
  ],
  participants: [
    { q: "Does TMS hurt?", a: "TMS can cause mild to moderate scalp discomfort or tapping sensations during the pulse trains. It can also cause twitching of facial or jaw muscles. This usually improves after the first week of treatment as the superficial nerves acclimate." },
    { q: "Will TMS change my personality?", a: "No. TMS is highly focal and targets specific mood-regulating networks. It does not alter your core personality, memories, or cognitive abilities. Most patients report feeling 'more like themselves' once depression lifts." },
    { q: "Can I drive home after my session?", a: "Yes. Unlike ECT (Electroconvulsive Therapy), TMS does not require anesthesia or sedation. You are fully awake and can resume normal activities immediately." }
  ]
};

// --- COMPONENTS ---

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'modules', label: 'Learning Modules' },
    { id: 'protocols', label: 'Clinical Protocols' },
    { id: 'equipment', label: 'Equipment & Coils' },
    { id: 'quiz', label: 'Knowledge Check' },
    { id: 'faq', label: 'FAQs' }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'home': return <HomeView setTab={setActiveTab} />;
      case 'modules': return <ModulesView />;
      case 'protocols': return <ProtocolsView />;
      case 'equipment': return <EquipmentView />;
      case 'quiz': return <QuizView />;
      case 'faq': return <FAQView />;
      default: return <HomeView setTab={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      {/* Navigation */}
      <nav className="bg-blue-900 text-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2 font-bold text-xl cursor-pointer" onClick={() => setActiveTab('home')}>
              <Brain className="w-8 h-8 text-blue-300" />
              <span className="hidden sm:inline">TMS Evidence Trainer</span>
              <span className="sm:hidden">TMS Trainer</span>
            </div>
            
            {/* Desktop Nav */}
            <div className="hidden lg:flex space-x-2">
              {navItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === item.id ? 'bg-blue-800 text-white' : 'text-blue-100 hover:bg-blue-800 hover:text-white'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Mobile Nav Toggle */}
            <div className="lg:hidden">
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-blue-200 hover:text-white">
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Nav Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-blue-800 pb-3 px-2 pt-2 space-y-1 shadow-inner border-t border-blue-700">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium ${
                  activeTab === item.id ? 'bg-blue-900 text-white' : 'text-blue-100 hover:bg-blue-700'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        )}
      </nav>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderContent()}
      </main>

      <footer className="bg-slate-900 text-slate-400 py-8 text-center text-sm">
        <p>© 2026 TMS Technician Education Initiative. Dedicated to patient safety and evidence-based practice.</p>
        <p className="mt-2 text-xs">Note: This is an educational tool. Always refer to your clinic's medical director and specific device manuals.</p>
      </footer>
    </div>
  );
}

// --- VIEWS ---

function HomeView({ setTab }: { setTab: (tab: string) => void }) {
  return (
    <div className="space-y-12">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 md:p-12 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-400 to-indigo-600"></div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight">Elevating the Standard of TMS Care</h1>
        <p className="text-xl text-slate-600 max-w-3xl mx-auto mb-10 leading-relaxed">
          An evidence-based learning hub dedicated to the theoretical inner workings, comprehensive safety protocols, and technical mastery of Transcranial Magnetic Stimulation.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button onClick={() => setTab('modules')} className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg">
            Access Modules <ChevronRight className="w-5 h-5" />
          </button>
          <button onClick={() => setTab('protocols')} className="bg-white hover:bg-slate-50 text-blue-700 border-2 border-blue-100 hover:border-blue-200 px-8 py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all">
            Clinical Protocols <Activity className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:border-blue-100 transition-colors">
          <ShieldAlert className="w-12 h-12 text-blue-600 mb-6 bg-blue-50 p-2 rounded-lg" />
          <h3 className="text-xl font-bold text-slate-900 mb-3">Patient Safety First</h3>
          <p className="text-slate-600 leading-relaxed">Understand the critical contraindications, seizure thresholds, and safety monitoring required to prevent harm during treatments.</p>
        </div>
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:border-blue-100 transition-colors">
          <BookOpen className="w-12 h-12 text-blue-600 mb-6 bg-blue-50 p-2 rounded-lg" />
          <h3 className="text-xl font-bold text-slate-900 mb-3">Evidence-Based</h3>
          <p className="text-slate-600 leading-relaxed">Every module is backed by peer-reviewed literature, providing technicians with a deep understanding rather than just "button-pushing."</p>
        </div>
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:border-blue-100 transition-colors">
          <Zap className="w-12 h-12 text-blue-600 mb-6 bg-blue-50 p-2 rounded-lg" />
          <h3 className="text-xl font-bold text-slate-900 mb-3">Technical Mastery</h3>
          <p className="text-slate-600 leading-relaxed">Explore the mechanics behind Faraday's law, coil designs, and how different parameters (rTMS, iTBS) affect the targeted cortex.</p>
        </div>
      </div>
    </div>
  );
}

function ModulesView() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="border-b border-slate-200 pb-6">
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Learning Modules</h2>
        <p className="text-lg text-slate-600">Comprehensive breakdowns of core TMS concepts.</p>
      </div>

      <div className="grid gap-8">
        {LEARNING_MODULES.map((module) => (
          <div key={module.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden group">
            <div className="bg-slate-50 border-b border-slate-100 p-6 flex items-center gap-4">
              <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-100">
                {module.icon}
              </div>
              <h3 className="text-2xl font-bold text-slate-900">{module.title}</h3>
            </div>
            <div className="p-6 md:p-8">
              <p className="text-slate-700 text-lg leading-relaxed mb-8">{module.content}</p>
              
              <div className="bg-blue-50/50 rounded-xl p-5 border border-blue-100">
                <h4 className="text-sm font-bold text-blue-900 mb-3 uppercase tracking-wider flex items-center gap-2">
                  <BookOpen className="w-4 h-4" /> Supporting Evidence
                </h4>
                <ul className="space-y-3">
                  {module.citations.map((cite, idx) => (
                    <li key={idx}>
                      <a 
                        href={cite.url} 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-blue-700 hover:text-blue-900 font-medium flex items-start gap-2 group/link"
                      >
                        <ExternalLink className="w-5 h-5 mt-0.5 shrink-0 text-blue-400 group-hover/link:text-blue-600 transition-colors" />
                        <span className="underline decoration-blue-200 underline-offset-4 group-hover/link:decoration-blue-400">{cite.text}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProtocolsView() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="border-b border-slate-200 pb-6">
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Clinical Protocols</h2>
        <p className="text-lg text-slate-600">Standardized, FDA-cleared stimulation parameters and methodologies.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {CLINICAL_PROTOCOLS.map((protocol, idx) => (
          <div key={idx} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col">
            <h3 className="text-xl font-bold text-slate-900 mb-4 pb-4 border-b border-slate-100">
              {protocol.name}
            </h3>
            
            <div className="space-y-4 flex-grow mb-6">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Target</p>
                <p className="text-slate-800 font-medium flex items-center gap-2">
                  <Stethoscope className="w-4 h-4 text-blue-500" /> {protocol.target}
                </p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Parameters</p>
                <p className="text-slate-800">{protocol.parameters}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Train Structure</p>
                <p className="text-slate-800">{protocol.trains}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total Pulses</p>
                  <p className="text-slate-800 font-semibold">{protocol.pulses}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Duration</p>
                  <p className="text-slate-800 font-semibold">{protocol.duration}</p>
                </div>
              </div>
            </div>

            <div className="mt-auto pt-4 border-t border-slate-100">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Pivotal Trial</p>
              <p className="text-sm text-blue-700 font-medium">{protocol.citation}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function EquipmentView() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
       <div className="border-b border-slate-200 pb-6">
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Equipment & Coils</h2>
        <p className="text-lg text-slate-600">Hardware breakdowns across major manufacturers.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Manufacturers */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-slate-50 border-b border-slate-100 p-6 flex items-center gap-3">
            <Activity className="w-6 h-6 text-blue-600" />
            <h3 className="text-2xl font-bold text-slate-900">Major Manufacturers</h3>
          </div>
          <div className="p-6 space-y-6">
            {EQUIPMENT_DATA.manufacturers.map((mfg, idx) => (
              <div key={idx} className="border-l-4 border-blue-500 pl-4 py-1">
                <h4 className="text-xl font-bold text-slate-900 mb-1">{mfg.name}</h4>
                <p className="text-sm text-blue-600 font-medium mb-3">Models: {mfg.models.join(', ')}</p>
                <p className="text-slate-600 leading-relaxed">{mfg.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Coils */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden h-fit">
          <div className="bg-slate-50 border-b border-slate-100 p-6 flex items-center gap-3">
            <Brain className="w-6 h-6 text-indigo-600" />
            <h3 className="text-2xl font-bold text-slate-900">Coil Varieties</h3>
          </div>
          <div className="p-6 space-y-4">
            {EQUIPMENT_DATA.coils.map((coil, idx) => (
              <div key={idx} className="bg-slate-50 rounded-xl p-5 border border-slate-100">
                <h4 className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-yellow-500" /> {coil.type}
                </h4>
                <p className="text-slate-600 leading-relaxed">{coil.features}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function QuizView() {
  const [currentQuestion, setCurrentQuestion] = useState<number>(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState<number>(0);
  const [showResults, setShowResults] = useState<boolean>(false);

  const handleAnswer = (index: number) => {
    setSelectedAnswer(index);
  };

  const nextQuestion = () => {
    if (selectedAnswer === QUIZ_QUESTIONS[currentQuestion].answer) {
      setScore(score + 1);
    }
    
    if (currentQuestion + 1 < QUIZ_QUESTIONS.length) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
    } else {
      setShowResults(true);
    }
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setScore(0);
    setShowResults(false);
  };

  if (showResults) {
    const percentage = Math.round((score / QUIZ_QUESTIONS.length) * 100);
    return (
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 p-10 text-center animate-in zoom-in-95 duration-500">
        <div className={`w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center ${percentage >= 80 ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>
          <CheckCircle className="w-12 h-12" />
        </div>
        <h2 className="text-3xl font-extrabold text-slate-900 mb-3">Knowledge Check Complete</h2>
        <p className="text-2xl text-slate-600 mb-8 font-medium">You scored {score} out of {QUIZ_QUESTIONS.length} <span className={`font-bold ${percentage >= 80 ? 'text-green-600' : 'text-amber-600'}`}>({percentage}%)</span></p>
        
        {percentage < 100 && (
          <div className="mb-8 p-5 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-left flex gap-4 items-start">
            <ShieldAlert className="w-6 h-6 shrink-0 text-amber-600" />
            <p className="leading-relaxed">A perfect score is recommended for clinical readiness. Please review the Safety and Protocols modules before treating patients.</p>
          </div>
        )}

        <button 
          onClick={resetQuiz}
          className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-4 rounded-xl font-bold transition-all shadow-md w-full sm:w-auto"
        >
          Retake Quiz
        </button>
      </div>
    );
  }

  const q = QUIZ_QUESTIONS[currentQuestion];
  const isAnswered = selectedAnswer !== null;

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in duration-500">
      <div className="mb-8 flex justify-between items-end border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Clinical Knowledge</h2>
          <p className="text-slate-500 mt-1">Test your situational readiness.</p>
        </div>
        <div className="bg-blue-100 text-blue-800 px-4 py-1.5 rounded-full font-bold text-sm">
          Question {currentQuestion + 1} of {QUIZ_QUESTIONS.length}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 md:p-10">
          <h3 className="text-xl font-bold text-slate-900 mb-8 leading-relaxed">{q.question}</h3>
          
          <div className="space-y-4">
            {q.options.map((option, idx) => {
              let buttonClass = "w-full text-left p-5 rounded-xl border-2 transition-all font-medium text-lg ";
              
              if (!isAnswered) {
                buttonClass += selectedAnswer === idx 
                  ? "border-blue-500 bg-blue-50 text-blue-900" 
                  : "border-slate-200 text-slate-700 hover:border-blue-300 hover:bg-slate-50";
              } else {
                if (idx === q.answer) {
                  buttonClass += "border-green-500 bg-green-50 text-green-900 shadow-sm"; // Correct answer
                } else if (selectedAnswer === idx) {
                  buttonClass += "border-red-500 bg-red-50 text-red-900"; // Wrong answer selected
                } else {
                  buttonClass += "border-slate-100 text-slate-400 bg-slate-50"; // Unselected
                }
              }

              return (
                <button
                  key={idx}
                  disabled={isAnswered}
                  onClick={() => handleAnswer(idx)}
                  className={buttonClass}
                >
                  <div className="flex items-center justify-between gap-4">
                    <span>{option}</span>
                    {isAnswered && idx === q.answer && <CheckCircle className="w-6 h-6 text-green-500 shrink-0" />}
                    {isAnswered && selectedAnswer === idx && idx !== q.answer && <X className="w-6 h-6 text-red-500 shrink-0" />}
                  </div>
                </button>
              );
            })}
          </div>

          {isAnswered && (
            <div className="mt-8 p-6 bg-blue-50 rounded-xl border border-blue-100 animate-in slide-in-from-top-4 duration-300">
              <h4 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                <BookOpen className="w-5 h-5" /> Clinical Explanation
              </h4>
              <p className="text-blue-900 text-lg leading-relaxed">{q.explanation}</p>
            </div>
          )}
        </div>
        
        <div className="bg-slate-50 p-6 border-t border-slate-100 flex justify-end">
          <button
            disabled={!isAnswered}
            onClick={nextQuestion}
            className={`px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-all ${
              isAnswered 
                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg' 
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            {currentQuestion + 1 === QUIZ_QUESTIONS.length ? 'See Results' : 'Next Question'} <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

function FAQView() {
  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center max-w-2xl mx-auto border-b border-slate-200 pb-8">
        <HelpCircle className="w-16 h-16 text-blue-600 mx-auto mb-6 bg-blue-50 p-3 rounded-2xl" />
        <h2 className="text-4xl font-bold text-slate-900 mb-4">Frequently Asked Questions</h2>
        <p className="text-xl text-slate-600">Real-world clinical troubleshooting and patient guidance.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Tech FAQs */}
        <div className="space-y-6">
          <div className="bg-slate-900 text-white p-4 rounded-xl flex items-center gap-3 mb-6 shadow-md">
            <Activity className="w-6 h-6 text-blue-400" />
            <h3 className="text-xl font-bold">Clinical Troubleshooting</h3>
          </div>
          {FAQS.technicians.map((faq, idx) => (
            <div key={idx} className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:border-blue-200 transition-colors">
              <h4 className="font-bold text-slate-900 text-lg mb-3">Q: {faq.q}</h4>
              <p className="text-slate-600 leading-relaxed border-l-2 border-blue-200 pl-4">{faq.a}</p>
            </div>
          ))}
        </div>

        {/* Participant FAQs */}
        <div className="space-y-6">
          <div className="bg-blue-50 text-blue-900 p-4 rounded-xl flex items-center gap-3 mb-6 shadow-sm border border-blue-100">
            <HelpCircle className="w-6 h-6 text-blue-600" />
            <h3 className="text-xl font-bold">Patient Education</h3>
          </div>
          {FAQS.participants.map((faq, idx) => (
            <div key={idx} className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:border-blue-200 transition-colors">
              <h4 className="font-bold text-slate-900 text-lg mb-3">Q: {faq.q}</h4>
              <p className="text-slate-600 leading-relaxed border-l-2 border-blue-200 pl-4">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}