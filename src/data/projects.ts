// All projects, in the order they appear on the Work page.
//
// To add a real image later: put it in public/images/projects/<slug>/ and set
// `cover` (shown in lists and at the top of the project page) or add it to
// `gallery`. Until a cover exists, a drawn illustration is used instead.
// To add a live demo later: add { label: 'Live demo', href: '...' } to `links`.
// To add a screen recording: put the MP4 in public/videos/, run
// scripts/make-hls.sh public/videos/<name>.mp4, and set
// `video: { src: '/videos/<name>.mp4', stream: '/videos/<name>/index.m3u8' }`.
// It plays in a clean video frame on the project page.

export type Category = 'research' | 'engineering';

export type ProjectVideo = {
  src: string;
  webm?: string;
  /** HLS stream from scripts/make-hls.sh (`/videos/<name>/index.m3u8`); makes seeking work on any host. */
  stream?: string;
  poster?: string;
  bg?: string;
  sound?: boolean;
  speedup?: boolean;
  crop?: boolean;
  title?: string;
  /** Full-screen button; sound turns on in full screen (good for tutorials). */
  fullscreen?: boolean;
};

export type Project = {
  slug: string;
  title: string;
  org: string; // "Context" column
  services: string; // "Field" column
  year: string;
  categories: Category[];
  featured?: boolean; // shown in "Recent work" on Home
  tone: { bg: string; ink: string; accent: string }; // illustration colours
  cover?: string;
  summary: string;
  intro: { role: string; stack: string; context: string };
  links: { label: string; href: string }[];
  highlights?: { value: string; label: string }[];
  sections: { heading: string; body: string[] }[];
  flow?: { title: string; steps: { label: string; detail: string }[] };
  sample?: { title: string; code: string };
  gallery?: { src: string; alt: string; caption: string }[];
  video?: ProjectVideo;
  videos?: ProjectVideo[];
  /** A live page or PDF shown on a desktop monitor. `cover` is what phones see instead (they can't show a PDF in a page). */
  iframe?: { src: string; bg?: string; cover?: { venue: string; title: string; authors: string; href: string } };
  note?: string;
};

export const PROJECTS: Project[] = [
  {
    slug: 'multimodal-agentic-system',
    title: 'Multimodal Agentic System',
    org: 'Agentic Research',
    services: 'Multimodal AI & Research',
    year: '2026',
    categories: ['research'],
    featured: true,
    tone: { bg: '#2C3E50', ink: '#FFFFFF', accent: '#3498DB' },
    summary:
      'A research paper introducing a multimodal agentic system for real-time moderation, evaluating text, image, and audio content through a unified policy-as-prompt gatekeeper.',
    intro: {
      role: 'Lead author',
      stack: 'LLMs, BLIP-2, Whisper',
      context: 'Cureus Journal of Computer Science, Sep 2026',
    },
    links: [
      {
        label: 'Paper',
        href: 'https://www.cureusjournals.com/articles/19859-convo-ease-a-policy-as-prompt-gatekeeper-for-real-time-multimodal-moderation-in-enterprise-communication',
      },
    ],
    iframe: {
      src: 'https://assets.cureusjournals.com/artifacts/upload/original_article/pdf/19859/CureusJournals_1985920260909-72011-vl4prj.pdf',
      bg: '#ffffff',
      cover: {
        venue: 'Cureus Journal of Computer Science · Springer Nature',
        title: 'Convo-Ease: A Policy-as-Prompt Gatekeeper for Real-Time Multimodal Moderation in Enterprise Communication',
        authors: 'Soham S. Jadhav, Omkar N. Gadakh, Atharv Gaikwad, Nisha D. Patil',
        href: 'https://www.cureusjournals.com/articles/19859-convo-ease-a-policy-as-prompt-gatekeeper-for-real-time-multimodal-moderation-in-enterprise-communication',
      },
    },
    highlights: [
      { value: '46 → 77%', label: 'Recall with natural-language rules vs a generic filter' },
      { value: '15', label: 'Rule sets handled with zero retraining' },
      { value: 'p = 0.004', label: 'Statistically significant paired difference' },
    ],
    sections: [
      {
        heading: 'Abstract',
        body: [
          'Enterprise communication platforms carry text, image, and audio content across organizational contexts that public-facing moderation systems were never designed to serve. This paper contributes an applied moderation architecture defined by four design decisions and realized as a working system.',
          'A pre-delivery gatekeeper validates content structurally in the message-send path. A unified text abstraction reduces every modality to a single representation before evaluation. A Policy-as-Prompt mechanism reads organizational rules as plain-language instructions at inference time, avoiding any need for model retraining.',
        ],
      },
      {
        heading: 'Architecture',
        body: [
          'The system uses a modular separation where each modality has its own processing path, running independently behind a shared plugin interface. A unified text abstraction ensures images are captioned and audio is transcribed, allowing a single policy layer to govern all three.',
          'The architecture externalizes policy in two dimensions: rules are kept outside the model and assembled into the evaluation prompt at inference time, while a separate sensitivity setting controls enforcement intensity independently.',
        ],
      },
    ],
    flow: {
      title: 'Multimodal processing pipeline',
      steps: [
        { label: 'Ingest', detail: 'Receive text, image, or audio input' },
        { label: 'Reduce', detail: 'Convert image to caption, audio to transcript' },
        { label: 'Assemble', detail: 'Combine with natural language policy' },
        { label: 'Evaluate', detail: 'Gatekeeper allows or blocks message' },
      ],
    },
  },
  {
    slug: 'subpixel-cac-segmentation',
    title: 'Sub-pixel CAC Segmentation',
    org: 'ML4Sci · GSoC 2026',
    services: 'Research & Deep Learning',
    year: '2026',
    categories: ['research'],
    featured: true,
    tone: { bg: '#E4E2DD', ink: '#1C1D20', accent: '#455CE9' },
    cover: '/images/projects/subpixel-cac-segmentation/cover.png',
    summary:
      'My own contribution to the field: training coronary calcium models on exact sub-pixel coverage instead of pixel-snapped masks.',
    intro: {
      role: 'Contributor: research, data and models',
      stack: 'PyTorch, MONAI 3D U-Net, SimpleITK',
      context: 'ML4Sci PrediCT, Google Summer of Code 2026',
    },
    links: [{ label: 'Code', href: 'https://github.com/ML4SCI/PrediCT/tree/soham_segmentation' }],
    highlights: [
      { value: '0.03%', label: 'Label area error, down from 10.19%' },
      { value: '2.2×', label: 'Lower median Agatston error (42.97 → 19.27)' },
      { value: '83.3%', label: 'Risk-tier agreement on unseen patients, up from 77.3%' },
    ],
    sections: [
      {
        heading: 'The problem',
        body: [
          'Calcium deposits in the heart’s arteries are tiny, often only a few pixels wide on a CT slice. Radiologists outline them with smooth curves, but the standard pipeline turns each outline into a mask of whole pixels (cv2.fillPoly). Every edge pixel is forced to be fully inside or fully outside.',
          'On a lesion of ten pixels, that rounding alone can change the measured area by double digits. The calcium score that decides a patient’s risk group is built from that area, so the error travels all the way to the diagnosis.',
        ],
      },
      {
        heading: 'My idea: Approach 3',
        body: [
          'Instead of rounding, I compute exactly how much of each pixel the radiologist’s outline covers, using analytic polygon clipping (Sutherland–Hodgman) on the native scan grid. A pixel that is 47% inside the outline gets the label 0.47.',
          'A 3D U-Net trains directly on these soft coverage labels with a Tversky loss. When scoring, lesion area is the sum of probability × pixel area and is never thresholded. The model learns the true size of a lesion, not a pixel-snapped copy of it.',
        ],
      },
      {
        heading: 'Results',
        body: [
          'Training labels now match the radiologist outline to within 0.03% area error, against 10.19% for binary masks. On 66 unseen test patients the median Agatston error fell from 42.97 to 19.27 (2.2× lower), and agreement on the six-tier risk category rose from 77.3% to 83.3%.',
          'The same gain held on a 374-patient replication (70.7% → 76.7%, p = 0.038). The scoring numbers are still provisional and will be re-run with the final checkpoint.',
        ],
      },
      {
        heading: 'Groundwork',
        body: [
          'Before any training I cleaned the Stanford COCA dataset from 787 scans to 441 patients. Along the way I found and removed 14 corrupted scans with misaligned slices. I then compared three labelling approaches side by side: binary masks (A1), 2× supersampled masks (A2) and coverage fractions (A3).',
        ],
      },
    ],
    gallery: [
      {
        src: '/images/projects/subpixel-cac-segmentation/mask-vs-outline.webp',
        alt: 'CT slice comparing a pixel mask with the radiologist’s sub-pixel outline',
        caption: 'The problem in one slice. Orange: the pixel mask models usually train on. Green: where the radiologist actually drew.',
      },
      {
        src: '/images/projects/subpixel-cac-segmentation/error-comparison.webp',
        alt: 'Bar chart comparing errors of the labelling approaches',
        caption: 'Error comparison across the labelling approaches.',
      },
    ],
  },
  {
    slug: 'predict-studio',
    title: 'PrediCT Studio',
    org: 'ML4Sci · PrediCT',
    services: 'Clinical AI Software',
    year: '2026',
    categories: ['engineering'],
    featured: true,
    tone: { bg: '#1C1D20', ink: '#FFFFFF', accent: '#E5603A' },
    cover: '/images/projects/predict-studio/cover.png',
    summary:
      'An auditable workstation that turns a cardiac CT scan into a calcium score and shows the evidence behind every number.',
    intro: {
      role: 'Design and development',
      stack: 'FastAPI, PyTorch, MONAI, nnU-Net, TotalSegmentator, Three.js',
      context: 'Research software for ML4Sci PrediCT',
    },
    links: [{ label: 'Code', href: 'https://github.com/ML4SCI/PrediCT/tree/predict_software' }],
    videos: [
      { src: '/videos/predict-studio.mp4', webm: '/videos/predict-studio.webm', stream: '/videos/predict-studio/index.m3u8', bg: '#1C1D20', sound: false },
      { src: '/videos/predict-studio-2.mp4', webm: '/videos/predict-studio-2.webm', stream: '/videos/predict-studio-2/index.m3u8', bg: '#1C1D20', sound: true, speedup: true, fullscreen: true, title: 'Workflow Tutorial' }
    ],
    highlights: [
      { value: '9', label: 'Steps from raw DICOM to a full report' },
      { value: '4', label: 'Ways to review every result' },
      { value: 'SHA-256', label: 'Model weights verified before every run' },
    ],
    sections: [
      {
        heading: 'What it is',
        body: [
          'PrediCT Studio is a multi-user web workstation for Agatston scoring of cardiac CT. A researcher uploads a DICOM folder or NIfTI file, picks a model (the A1 binary model or my A3 coverage model) and gets the total calcium score, the risk tier and the evidence for every lesion.',
        ],
      },
      {
        heading: 'Built to be trusted',
        body: [
          'Its first rule: a wrong number that looks reasonable is the worst possible failure. So the pipeline stops loudly instead of guessing. Every model ships with a manifest, and its weights are checked against a SHA-256 hash before each run.',
          'Every result records what produced it: model, checkpoint hash, threshold, crop, HU window and spacing. Specks under 1 mm² are never silently dropped. They are listed in a ledger so a reviewer can see them.',
        ],
      },
      {
        heading: 'Four ways to review',
        body: [
          'Argument shows the total score, risk tier, findings and the ledger of withheld specks. Instrument is a zoomable slice viewer with lesion details. Contact Sheet shows every slice at once. Anatomy is an interactive 3D view built with Three.js.',
        ],
      },
    ],
    flow: {
      title: 'How a scan becomes a score',
      steps: [
        { label: 'Load', detail: 'DICOM or NIfTI, grouped by series' },
        { label: 'Prepare', detail: 'Resample to 0.37 × 0.37 × 3 mm' },
        { label: 'Crop', detail: 'Find the heart, add an 8 mm margin' },
        { label: 'Check', detail: 'Verify axes, spacing and model hash' },
        { label: 'Segment', detail: 'A1, A3 or nnU-Net, sliding window' },
        { label: 'Score', detail: 'Agatston per slice, 3D lesions, cross-checked totals' },
        { label: 'Report', detail: 'Score, risk tier, meshes, slices and provenance' },
      ],
    },
    sample: {
      title: 'Run it',
      code: `# web workstation
$ python -m src.backend.server
  → open http://127.0.0.1:8001

# or straight from the command line
$ python -m src.backend.run --model a3-coverage-v2`,
    },

    note: 'Research software. Not a cleared medical device.',
  },
  {
    slug: 'convo-ease',
    title: 'Convo-Ease',
    org: 'B.E. Project',
    services: 'Multimodal AI & Research',
    year: '2026',
    categories: ['research', 'engineering'],
    featured: true,
    tone: { bg: '#DCDFE5', ink: '#1C1D20', accent: '#455CE9' },
    summary:
      'A policy-as-prompt gatekeeper that checks text, image and audio messages before they are delivered. Published and peer-reviewed.',
    intro: {
      role: 'Lead author and engineer',
      stack: 'LLMs via NVIDIA NIM, BLIP-2, Whisper, Python',
      context: 'B.E. Project, Sep 2026',
    },
    links: [
      {
        label: 'Paper',
        href: 'https://www.cureusjournals.com/articles/19859-convo-ease-a-policy-as-prompt-gatekeeper-for-real-time-multimodal-moderation-in-enterprise-communication',
      },
      {
        label: 'Preprint',
        href: 'https://www.researchgate.net/publication/406281638_Convo-Ease_Intelligent_Multi-Modal_Moderation_for_Digital_Organizational_Communication',
      },
    ],
    highlights: [
      { value: '46 → 77%', label: 'Recall with company rules vs a generic filter' },
      { value: '15', label: 'Rule sets handled with zero retraining' },
      { value: '< 0.5 s', label: 'Per batch of 10 messages' },
    ],
    sections: [
      {
        heading: 'The problem',
        body: [
          'Workplace chat tools moderate after the fact, using generic safety filters that know nothing about a company’s own rules. By the time a harmful message is flagged, everyone has already read it.',
        ],
      },
      {
        heading: 'The approach',
        body: [
          'Convo-Ease sits between sender and receiver and checks every message before it is delivered. Images are captioned and audio is transcribed, so one policy layer covers text, image and audio.',
          'The company’s rules are written in plain language and given to the model as its prompt (Policy-as-Prompt). Changing a rule means editing a sentence, not retraining a model. Model backends can be swapped per content type through configuration.',
        ],
      },
      {
        heading: 'Results',
        body: [
          'On 300 human-labelled messages, company-specific rules raised recall from 46.0% to 76.7% and accuracy from 68.3% to 76.7% compared with a generic safety list (p = 0.004). It worked across 15 different rule sets with no retraining, at about 0.45 s per batch of 10 messages. The measured results cover text; image and audio follow the same path by design.',
          'A companion survey, Beyond Text, reviews enterprise moderation systems and the shift toward checking content before delivery.',
        ],
      },
    ],
    flow: {
      title: 'How a message is checked',
      steps: [
        { label: 'Message', detail: 'Text, image or audio is sent' },
        { label: 'Convert', detail: 'Image → caption, audio → transcript' },
        { label: 'Policy', detail: 'Company rules become the prompt' },
        { label: 'Decide', detail: 'Allow or block before delivery' },
      ],
    },
  },
  {
    slug: 'copilot-for-data-science',
    title: 'Copilot for Data Science',
    org: 'Personal project',
    services: 'AI Agents',
    year: '2025',
    categories: ['engineering'],
    featured: true,
    tone: { bg: '#D9E3DC', ink: '#1C1D20', accent: '#2F7D5B' },
    summary: 'An AI agent that turns plain-English questions into complete data-science pipelines.',
    intro: {
      role: 'Solo project',
      stack: 'Python, LLMs, RAG, AutoML, XAI',
      context: 'Personal project',
    },
    links: [{ label: 'Code', href: 'https://github.com/sohamjadhav95/Copilot-For-Data-Science' }],
    highlights: [{ value: '~90%', label: 'Of a typical data-science workflow automated' }],
    sections: [
      {
        heading: 'What it does',
        body: [
          'Ask a question about your data in plain English, and the agent writes and runs the query or the whole analysis pipeline for you: cleaning, modelling and charts.',
        ],
      },
      {
        heading: 'How it works',
        body: [
          'Retrieval (RAG) gives the agent the right context about your data. AutoML picks and tunes the model. Explainable-AI tools (XAI) show why the model decided what it did, so the answer comes with its reasoning. It works across different data formats.',
        ],
      },
    ],
    flow: {
      title: 'From question to answer',
      steps: [
        { label: 'Ask', detail: 'A question in plain English' },
        { label: 'Plan', detail: 'Context from your data via RAG' },
        { label: 'Build', detail: 'Code and models via AutoML' },
        { label: 'Explain', detail: 'Results with XAI reasoning' },
      ],
    },
  },
  {
    slug: 'heart-segmentation',
    title: 'Fast Heart Segmentation',
    org: 'GSoC 2026 qualifying task',
    services: 'Medical Imaging',
    year: '2026',
    categories: ['research'],
    tone: { bg: '#2A2226', ink: '#FFFFFF', accent: '#E2504C' },
    summary: 'A compact 2D U-Net that finds the whole heart in a CT scan 63× faster than TotalSegmentator.',
    intro: {
      role: 'Solo',
      stack: 'PyTorch, 2D U-Net (7.8M parameters)',
      context: 'ML4Sci PREDICT1 qualifying task, Stanford COCA',
    },
    links: [{ label: 'Code', href: 'https://github.com/sohamjadhav95/ML4Sci-DeepLense-GSoC2026' }],
    highlights: [
      { value: '0.9416', label: 'Median Dice score' },
      { value: '63×', label: 'Faster than TotalSegmentator' },
      { value: '0.6 s', label: 'Per scan, against 37.8 s' },
    ],
    sections: [
      {
        heading: 'The problem',
        body: [
          'Before calcium can be scored, the pipeline has to know where the heart is. The standard tool, TotalSegmentator, is accurate but slow: about 38 seconds per scan.',
        ],
      },
      {
        heading: 'The approach',
        body: [
          'I trained a compact 2D U-Net with 7.8 million parameters on whole-heart masks from 50 Stanford COCA scans. It is built to do one job, and do it fast.',
        ],
      },
      {
        heading: 'Results',
        body: [
          'A median Dice score of 0.9416 at about 0.6 seconds per scan, roughly 63× faster than TotalSegmentator on the same data. This was my qualifying task for the PrediCT project in Google Summer of Code 2026.',
        ],
      },
    ],
  },
  {
    slug: 'renaissance-ocr',
    title: 'RenAIssance OCR',
    org: 'HumanAI · GSoC 2026 proposal',
    services: 'Computer Vision',
    year: '2026',
    categories: ['research'],
    tone: { bg: '#E9DFCC', ink: '#3B2F2A', accent: '#9C4A2E' },
    summary: 'Reading historical Spanish documents with a CRNN: ResNet-18, a BiLSTM and CTC.',
    intro: {
      role: 'Solo',
      stack: 'PyTorch, ResNet-18, BiLSTM, CTC',
      context: 'HumanAI RenAIssance, GSoC 2026 proposal',
    },
    links: [],
    sections: [
      {
        heading: 'The problem',
        body: [
          'Historical Spanish documents use old letterforms, ligatures and faded ink that modern OCR misreads.',
        ],
      },
      {
        heading: 'The approach',
        body: [
          'A complete text-recognition pipeline. A ResNet-18 backbone reads visual features from each line of text, a bidirectional LSTM models the sequence of characters, and CTC loss lets the model learn from line-level transcriptions without needing every character aligned by hand.',
        ],
      },
    ],
    flow: {
      title: 'From page to text',
      steps: [
        { label: 'Line image', detail: 'A single line from the page' },
        { label: 'ResNet-18', detail: 'Visual features' },
        { label: 'BiLSTM', detail: 'Character sequence' },
        { label: 'CTC', detail: 'Decoded text' },
      ],
    },
  },
  {
    slug: 'tennis-match-predictor',
    title: 'Tennis Match Predictor',
    org: 'Personal project',
    services: 'Machine Learning',
    year: '2024',
    categories: ['engineering'],
    tone: { bg: '#3E6E52', ink: '#FFFFFF', accent: '#DDF247' },
    summary: 'Predicts ATP match winners with 77% accuracy from Elo, form and fatigue.',
    intro: {
      role: 'Solo',
      stack: 'Python, XGBoost, LightGBM, Streamlit',
      context: 'Personal project',
    },
    links: [
      { label: 'Live demo', href: 'https://ai-powered-tennis-match-outcome-predict.streamlit.app/' },
      { label: 'Code', href: 'https://github.com/sohamjadhav95/AI-Powered-Tennis-Match-Outcome-Predictor' },
    ],
    highlights: [{ value: '77%', label: 'Accuracy on ATP match outcomes' }],
    sections: [
      {
        heading: 'How it works',
        body: [
          'An ensemble of XGBoost and LightGBM trained on engineered features: a dynamic Elo rating for every player, surface preferences, recent form and a fatigue model based on recent match load. It runs as a live Streamlit app.',
        ],
      },
    ],
  },
  {
    slug: 'nexaos-flow',
    title: 'NexaOS Flow',
    org: 'Personal project',
    services: 'AI Automation',
    year: '2024',
    categories: ['engineering'],
    tone: { bg: '#202226', ink: '#FFFFFF', accent: '#7FDBCA' },
    summary: 'Control your computer with your voice: speech in, system commands out.',
    intro: {
      role: 'Solo',
      stack: 'Python, speech recognition, NLP, TTS',
      context: 'Personal project',
    },
    links: [{ label: 'Code', href: 'https://github.com/sohamjadhav95/Neuro-Intelligence' }],
    sections: [
      {
        heading: 'How it works',
        body: [
          'Speech recognition turns your voice into text, an NLP intent parser works out what you want, and the matching operating-system command runs, with spoken feedback through text-to-speech. Commands can be chained with context, in more than one language.',
        ],
      },
    ],
    flow: {
      title: 'From voice to action',
      steps: [
        { label: 'Speak', detail: 'A command in your own words' },
        { label: 'Transcribe', detail: 'Speech to text' },
        { label: 'Understand', detail: 'NLP intent parsing' },
        { label: 'Act', detail: 'OS command and spoken reply' },
      ],
    },
  },
];

export const getProject = (slug: string) => PROJECTS.find(p => p.slug === slug);

export const nextProject = (slug: string) => {
  const i = PROJECTS.findIndex(p => p.slug === slug);
  return PROJECTS[(i + 1) % PROJECTS.length];
};
