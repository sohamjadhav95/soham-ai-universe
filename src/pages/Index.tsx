import { useState, useEffect } from 'react';
import { Github, Linkedin, Mail, Twitter, ExternalLink, X, Download, ArrowUpRight, BookOpen, GitBranch } from 'lucide-react';
import ibmDeepLearningCert from '@/assets/ibm-deep-learning-cert.png';
import mlPythonCert from '@/assets/ml-python-cert.png';
import genAiLlmsCert from '@/assets/gen-ai-llms-cert.jpg';
import ibmAiEngineeringCert from '@/assets/ibm-ai-engineering-cert.jpg';
import gdgCoLeadCert from '@/assets/gdg-colead-cert.png';

const NAV = ['Home','About','Projects','Research','OpenSource','Certifications','Freelance','Contact'];

const SKILLS: Record<string, string[]> = {
  'Core AI/ML': ['PyTorch','TensorFlow','HuggingFace','scikit-learn','OpenCV','LangChain'],
  'Languages': ['Python','TypeScript','C++','SQL'],
  'GenAI Stack': ['LLMs','RAG','Fine-tuning','LoRA/QLoRA','Gemma','BLIP-2','Whisper'],
  'Data': ['NumPy','Pandas','AutoML','XAI','Data Engineering','PostgreSQL'],
  'Tools': ['Git','Jupyter','Colab','Streamlit','Gradio'],
};

const STATS = [
  { value: '2', label: 'Papers Published', sub: 'Springer Nature · ICIA' },
  { value: '6+', label: 'Projects Shipped', sub: 'Deployed & documented' },
  { value: '9', label: 'Certifications', sub: 'IBM · Microsoft · GDG' },
  { value: '500+', label: 'Connections', sub: 'LinkedIn network' },
];

interface Metric { label: string; value: string; }
interface Project {
  id: string; title: string; type: string; tagColor: string; year: string;
  status: string; description: string; details: string; tech: string[];
  github?: string; liveDemo?: string; metrics?: Metric[];
}

const PROJECTS: Project[] = [
  { id: 'copilot', title: 'Copilot for Data Science', type: 'AI Agent', tagColor: 'tag-cyan', year: '2025', status: 'Active',
    description: 'Agentic AI system that automates ~90% of data science and analytics workflows using natural language.',
    details: 'Transforms natural language instructions into executable queries and analysis pipelines. Integrates XAI, AutoML, and RAG for scalable, explainable decision-making. Supports diverse data formats and produces human-readable insights with minimal manual intervention.',
    tech: ['Python','AutoML','NLP','RAG','XAI','Parallel Processing'],
    github: 'https://github.com/sohamjadhav95/Copilot-For-Data-Science' },
  { id: 'deeplense', title: 'ML4Sci DeepLense', type: 'Deep Learning', tagColor: 'tag-purple', year: '2026', status: 'GSoC 2026',
    description: 'Gravitational lens detection and CAC segmentation for astrophysics data pipelines.',
    details: 'ResNet18 multi-class lens classifier ~92.5% val accuracy, macro AUC ~0.985. Binary lens finder using WeightedRandomSampler at ~97% test accuracy. PREDICT1: CAC segmentation with U-Net on Stanford COCA dataset targeting Dice > 0.85.',
    tech: ['PyTorch','ResNet18','U-Net','WeightedRandomSampler','Colab'],
    github: 'https://github.com/sohamjadhav95/ML4Sci-DeepLense-GSoC2026',
    metrics: [{ label: 'Val Acc', value: '92.5%' }, { label: 'AUC', value: '0.985' }, { label: 'Binary Acc', value: '97%' }] },
  { id: 'convoease', title: 'Convo-Ease', type: 'Multimodal AI', tagColor: 'tag-amber', year: '2025', status: 'Published',
    description: 'Real-time multimodal content moderation with Gatekeeper Architecture and Policy-as-Prompt.',
    details: 'Pre-delivery content validation across Text + Image + Audio. Gemma 3 27B for policy enforcement, BLIP-2 for image captioning, Whisper for audio transcription. Validates under 3 seconds with 100K synthetic training examples.',
    tech: ['Gemma 3','BLIP-2','Whisper','LangChain','PostgreSQL','Streamlit'],
    metrics: [{ label: 'Latency', value: '<3s' }, { label: 'Train Data', value: '100K' }, { label: 'Modalities', value: '3' }] },
  { id: 'coverletter', title: 'Gen-AI Cover Letter Tailoring', type: 'Gen AI', tagColor: 'tag-green', year: '2024', status: 'Complete',
    description: 'TinyLlama (1.1B) fine-tuned with QLoRA to generate personalized cover letters from resume + JD.',
    details: 'Fine-tuned TinyLlama on high-quality resume-JD pairs using QLoRA. Semantic similarity engine + RAG to align documents to job requirements. Gradio web interface with cloud-ready deployment.',
    tech: ['PyTorch','TinyLlama','QLoRA','HuggingFace','Gradio','RAG'],
    github: 'https://github.com/sohamjadhav95/Cover-Letter-Tailoring-Gen-AI' },
  { id: 'nexaos', title: 'NexaOS Flow', type: 'AI Automation', tagColor: 'tag-rose', year: '2024', status: 'Complete',
    description: 'Voice-activated OS controller executing system commands via natural language.',
    details: 'Spoken natural language to system-level automation commands. Integrates Speech Recognition, NLP intent parsing, TTS feedback, and OS-level APIs. Context-aware command chains and multi-language support.',
    tech: ['Python','NLP','Speech Recognition','TTS','OS APIs'],
    github: 'https://github.com/sohamjadhav95/Neuro-Intelligence' },
  { id: 'tennis', title: 'Tennis Match Predictor', type: 'Machine Learning', tagColor: 'tag-cyan', year: '2024', status: 'Complete',
    description: 'Ensemble ML model predicting ATP match outcomes at 77% accuracy using Elo, form, and fatigue.',
    details: 'Dynamic Elo ratings, surface preferences, fatigue modelling, and head-to-head stats. XGBoost + LightGBM ensemble with custom feature engineering. Live Streamlit demo.',
    tech: ['XGBoost','LightGBM','Python','Elo Ratings','Feature Engineering'],
    github: 'https://github.com/sohamjadhav95/AI-Powered-Tennis-Match-Outcome-Predictor',
    liveDemo: 'https://ai-powered-tennis-match-outcome-predict.streamlit.app/',
    metrics: [{ label: 'Accuracy', value: '77%' }] },
];

interface Paper { title: string; venue: string; year: string; type: string; authors: string; abstract: string; keywords: string[]; link?: string; }
const PAPERS: Paper[] = [
  { title: 'Convo-Ease: Intelligent Multi-Modal Moderation for Digital Organizational Communication',
    venue: 'Cureus — Springer Nature', year: '2025', type: 'Conference Paper',
    authors: 'Soham S. Jadhav, Nisha D. Patil, Omkar N. Gadakh, Atharv S. Gaikwad',
    abstract: 'Proposes a Gatekeeper Architecture for pre-delivery content validation across text, image, and audio using Policy-as-Prompt with Gemma 3, BLIP-2, and Whisper. Achieves sub-3-second latency with 100K synthetic training samples.',
    keywords: ['Multimodal AI','LLMs','Gatekeeper Architecture','Policy-as-Prompt','Enterprise Security'],
    link: 'https://coursera.org/verify/specialization/4PDD1WMUR5ZD' },
  { title: 'Beyond Text: A Comprehensive Survey of Multimodal Content Moderation Architectures in Enterprise Environments',
    venue: 'ICIA Conference Proceedings', year: '2025', type: 'Survey Paper',
    authors: 'Soham S. Jadhav, Omkar N. Gadakh, Nisha D. Patil, Atharv S. Gaikwad',
    abstract: 'Surveys 26+ content moderation methodologies from LLM guardrails to multimodal fusion architectures. Examines the shift from reactive API-based to dynamic Policy-as-Prompt frameworks. Identifies critical gaps in latency management and on-premise privacy preservation.',
    keywords: ['Survey','Content Moderation','Audio-Visual Fusion','Enterprise AI','Privacy'] },
];

interface OssItem { org: string; role: string; status: string; description: string; contributions: string[]; repo: string; tech: string[]; tagColor: string; }
const OSS: OssItem[] = [
  { org: 'ML4Sci — DeepLense', role: 'GSoC 2026 Applicant', status: 'Active', tagColor: 'tag-purple',
    description: 'Contributing gravitational lens detection and segmentation models for astrophysics data pipelines. Three-proposal strategy: DEEPLENSE6, DEEPLENSE7, and PREDICT1.',
    contributions: ['ResNet18 multi-class lens classifier (~92.5% val accuracy, macro AUC 0.985)','Binary lens finder with WeightedRandomSampler (~97% test accuracy)','CAC segmentation on Stanford COCA dataset targeting Dice > 0.85'],
    repo: 'https://github.com/sohamjadhav95/ML4Sci-DeepLense-GSoC2026', tech: ['PyTorch','ResNet18','U-Net','Colab'] },
  { org: 'pgmpy', role: 'Open Source Contributor', status: 'In Progress', tagColor: 'tag-green',
    description: 'Contributing to the probabilistic graphical models Python library. Working on doctest coverage improvements under parent tracking issue #2832.',
    contributions: ['Identifying and fixing failing doctests across the package','Following established contribution pattern from issue #2832'],
    repo: 'https://github.com/pgmpy/pgmpy', tech: ['Python','Bayesian Networks','Probability'] },
];

interface FreelanceItem { title: string; description: string; services: string[]; }
const FREELANCE: FreelanceItem[] = [
  { title: 'AI/ML Solutions Development', description: 'End-to-end AI application development including model training, API integration, and deployment. NLP pipelines, computer vision systems, and agentic workflows.',
    services: ['Custom ML Models','LLM Integration','RAG Pipelines','AI API Development'] },
  { title: 'Data Science Consulting', description: 'Data analysis, predictive modelling, and dashboard development. AutoML pipeline design and feature engineering for structured datasets.',
    services: ['EDA & Visualization','Predictive Analytics','AutoML Pipelines','Report Generation'] },
  { title: 'Generative AI Engineering', description: 'Fine-tuning LLMs with QLoRA/LoRA, building RAG systems, prompt engineering, and deploying generative AI applications.',
    services: ['LLM Fine-tuning','RAG Systems','Prompt Engineering','AI App Deployment'] },
];

interface Cert { title: string; issuer: string; date: string; image: string; link: string | null; }
const CERTS: Cert[] = [
  { title: 'IBM AI Engineering Professional', issuer: 'IBM / Coursera', date: 'Dec 2025', image: ibmAiEngineeringCert, link: 'https://coursera.org/verify/professional-cert/IJ5Z0ADQ8EC2' },
  { title: 'IBM Deep Learning — PyTorch, Keras & TF', issuer: 'IBM / Coursera', date: 'Jun 2025', image: ibmDeepLearningCert, link: 'https://coursera.org/verify/professional-cert/LT6ZHJY82CPB' },
  { title: 'Generative AI Engineering with LLMs', issuer: 'IBM / Coursera', date: 'Dec 2025', image: genAiLlmsCert, link: 'https://coursera.org/verify/specialization/4PDD1WMUR5ZD' },
  { title: 'Machine Learning with Python', issuer: 'IBM / Coursera', date: 'Sep 2024', image: mlPythonCert, link: 'https://coursera.org/verify/CTGCLPT5MP9N' },
  { title: 'Career Essentials in Generative AI', issuer: 'Microsoft & LinkedIn', date: 'Aug 2024', image: 'https://i.postimg.cc/QCgNCV2C/Certificate-Of-Completion-Career-Essentials-in-Generative-AI-by-Microsoft-and-Linked-In.png', link: null },
  { title: 'GDG AI-ML Co-Lead', issuer: 'Google Developer Groups', date: '2025', image: gdgCoLeadCert, link: null },
  { title: 'SQL Advanced', issuer: 'HackerRank', date: 'Sep 2024', image: 'https://i.postimg.cc/zD4TRQ91/sql-advanced-certificate.png', link: null },
  { title: 'Python', issuer: 'HackerRank', date: 'Aug 2024', image: mlPythonCert, link: null },
];

// ─── TINY STYLE HELPERS ──────────────────────────────────────────────
const C = { bg: '#080810', surface: '#0f0f1a', border: 'rgba(0,229,255,0.08)', cyan: '#00e5ff', amber: '#ffb347', green: '#00ff80', text: '#f0ece0', muted: 'rgba(240,236,224,0.45)' };
const mono = { fontFamily: 'JetBrains Mono' };
const syne = { fontFamily: 'Syne' };
const cardStyle = { background: C.surface, border: `1px solid ${C.border}`, borderRadius: '3px' };

export default function Index() {
  const [activeSection, setActiveSection] = useState('home');
  const [expandedProject, setExpandedProject] = useState<string | null>(null);
  const [certModal, setCertModal] = useState<Cert | null>(null);

  useEffect(() => {
    const io = new IntersectionObserver(entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); }), { threshold: 0.1 });
    document.querySelectorAll('.reveal').forEach(el => io.observe(el));

    const sio = new IntersectionObserver(entries => entries.forEach(e => { if (e.isIntersecting) setActiveSection(e.target.id); }), { threshold: 0.35 });
    NAV.forEach(n => { const el = document.getElementById(n.toLowerCase()); if (el) sio.observe(el); });

    return () => { io.disconnect(); sio.disconnect(); };
  }, []);

  const go = (id: string) => document.getElementById(id.toLowerCase())?.scrollIntoView({ behavior: 'smooth' });

  return (
    <div style={{ background: C.bg, minHeight: '100vh' }} className="grid-bg">

      {/* NAV */}
      <nav style={{ background: 'rgba(8,8,16,0.88)', borderBottom: `1px solid ${C.border}` }} className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <button onClick={() => go('home')} style={{ ...mono, color: C.cyan, fontWeight: 700, fontSize: '0.85rem', letterSpacing: '0.1em' }}>
            SJ<span style={{ color: C.amber }}>.</span>
          </button>
          <div className="hidden md:flex items-center gap-7">
            {NAV.map(n => (
              <button key={n} onClick={() => go(n)} style={{ ...mono, fontSize: '0.68rem', letterSpacing: '0.12em', color: activeSection === n.toLowerCase() ? C.cyan : 'rgba(240,236,224,0.4)', position: 'relative', textTransform: 'lowercase' }}>
                {activeSection === n.toLowerCase() && <span style={{ position: 'absolute', left: '-10px', top: '50%', transform: 'translateY(-50%)', width: '4px', height: '4px', background: C.cyan, borderRadius: '50%', boxShadow: `0 0 6px ${C.cyan}` }} />}
                {n.toLowerCase().replace('opensource', 'open_source')}
              </button>
            ))}
          </div>
          <a href="https://drive.google.com/file/d/1MuONHQJkPSyDbuyUYkUHtK257MDDGGQs/view?usp=sharing" target="_blank" rel="noopener noreferrer"
            className="hidden md:flex items-center gap-2"
            style={{ ...mono, fontSize: '0.68rem', border: `1px solid rgba(0,229,255,0.25)`, color: C.cyan, padding: '5px 14px', borderRadius: '3px' }}>
            <Download size={11} /> resume
          </a>
        </div>
      </nav>

      {/* HERO */}
      <section id="home" className="min-h-screen flex items-center pt-14 relative overflow-hidden">
        <div style={{ position: 'absolute', top: '20%', left: '20%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(0,229,255,0.06), transparent)', borderRadius: '50%', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '20%', right: '15%', width: '280px', height: '280px', background: 'radial-gradient(circle, rgba(255,179,71,0.05), transparent)', borderRadius: '50%', pointerEvents: 'none' }} />
        <div className="max-w-6xl mx-auto px-6 w-full">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="reveal section-label mb-6">// AI Engineer & Researcher</p>
              <h1 className="reveal text-6xl md:text-7xl font-bold leading-none mb-1" style={syne}>Soham</h1>
              <h1 className="reveal text-6xl md:text-7xl font-bold leading-none mb-8 cursor text-glow" style={{ ...syne, color: C.cyan, transitionDelay: '0.1s' }}>Jadhav</h1>
              <p className="reveal text-xs leading-relaxed mb-8 max-w-md" style={{ ...mono, color: C.muted, transitionDelay: '0.2s' }}>
                Building AI systems that solve real problems — deep learning, generative AI, and agentic workflows. Final-year AI & DS student, published researcher, GSoC 2026 applicant.
              </p>
              <div className="reveal flex flex-wrap gap-2 mb-8" style={{ transitionDelay: '0.3s' }}>
                <span className="tag tag-cyan">PyTorch</span>
                <span className="tag tag-amber">GSoC 2026</span>
                <span className="tag tag-green">2x Published</span>
                <span className="tag tag-purple">Generative AI</span>
              </div>
              <div className="reveal flex gap-3 flex-wrap mb-8" style={{ transitionDelay: '0.4s' }}>
                <button onClick={() => go('projects')} style={{ ...syne, background: `linear-gradient(135deg, ${C.cyan}, #0099bb)`, color: C.bg, padding: '8px 20px', borderRadius: '3px', fontSize: '0.78rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  View My Work <ArrowUpRight size={13} />
                </button>
                <a href="mailto:soham.ai.engineer@gmail.com" style={{ ...syne, border: `1px solid rgba(255,179,71,0.35)`, color: C.amber, padding: '8px 20px', borderRadius: '3px', fontSize: '0.78rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Mail size={13} /> Contact
                </a>
              </div>
              <div className="reveal flex gap-3" style={{ transitionDelay: '0.5s' }}>
                {[{ icon: Github, url: 'https://github.com/sohamjadhav95' }, { icon: Linkedin, url: 'https://linkedin.com/in/sohamjadhav95' }, { icon: Twitter, url: 'https://x.com/sohamjadhav_95' }, { icon: Mail, url: 'mailto:soham.ai.engineer@gmail.com' }].map(({ icon: Icon, url }) => (
                  <a key={url} href={url} target="_blank" rel="noopener noreferrer" className="card-hover" style={{ color: 'rgba(240,236,224,0.3)', border: `1px solid ${C.border}`, borderRadius: '4px', padding: '6px' }}>
                    <Icon size={15} />
                  </a>
                ))}
              </div>
            </div>
            <div className="reveal grid grid-cols-2 gap-3" style={{ transitionDelay: '0.3s' }}>
              {STATS.map(s => (
                <div key={s.label} className="card-hover p-5" style={cardStyle}>
                  <div className="stat-num">{s.value}</div>
                  <div className="text-xs font-semibold mt-1 mb-1" style={{ ...syne, color: C.text }}>{s.label}</div>
                  <div className="text-xs" style={{ ...mono, color: 'rgba(240,236,224,0.3)' }}>{s.sub}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" className="py-24" style={{ background: 'rgba(15,15,26,0.55)' }}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="reveal divider-line" />
          <p className="reveal section-label">01 / about</p>
          <h2 className="reveal text-4xl font-bold mb-10" style={{ ...syne, transitionDelay: '0.1s' }}>Who I Am</h2>
          <div className="grid md:grid-cols-3 gap-10">
            <div className="md:col-span-2 space-y-4 reveal" style={{ transitionDelay: '0.2s' }}>
              <p className="text-xs leading-relaxed" style={{ ...mono, color: C.muted }}>I'm a final-year AI & Data Science Engineering student at MET's Institute of Engineering, Nashik. I design and ship intelligent systems across deep learning, generative AI, and agentic workflows — from gravitational lens classifiers to multimodal content moderation frameworks.</p>
              <p className="text-xs leading-relaxed" style={{ ...mono, color: C.muted }}>Two peer-reviewed papers published with Springer Nature and the ICIA conference. Co-Lead of the AI & ML domain at Google Developer Groups. Currently applying for GSoC 2026 with ML4Sci. I build AI to work, not for demos.</p>
              <div className="p-4 rounded-sm mt-4" style={{ background: 'rgba(0,229,255,0.04)', border: `1px solid rgba(0,229,255,0.1)` }}>
                <p className="text-xs" style={{ ...mono, color: C.cyan }}>
                  <span style={{ color: 'rgba(240,236,224,0.3)' }}>const </span>
                  <span style={{ color: C.amber }}>mission</span>
                  <span style={{ color: 'rgba(240,236,224,0.3)' }}> = </span>
                  <span style={{ color: 'rgba(240,236,224,0.55)' }}>"Ship AI that actually works. No fluff."</span>
                </p>
              </div>
            </div>
            <div className="space-y-3 reveal" style={{ transitionDelay: '0.3s' }}>
              {[['Degree','B.E. AI & Data Science'],['College',"MET's Institute of Eng."],['Location','Nashik, Maharashtra'],['Status','Open to Work'],['Email','soham.ai.engineer@gmail.com']].map(([l, v]) => (
                <div key={l} className="flex gap-3 text-xs" style={mono}>
                  <span style={{ color: 'rgba(240,236,224,0.28)', minWidth: '60px', flexShrink: 0 }}>{l}</span>
                  <span style={{ color: l === 'Status' ? C.green : C.muted }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-12 reveal" style={{ transitionDelay: '0.4s' }}>
            <p className="text-xs mb-5" style={{ ...mono, color: 'rgba(240,236,224,0.25)' }}>// tech stack</p>
            <div className="space-y-3">
              {Object.entries(SKILLS).map(([cat, items]) => (
                <div key={cat} className="flex gap-4 items-start flex-wrap">
                  <span className="text-xs pt-0.5 flex-shrink-0" style={{ ...mono, color: 'rgba(240,236,224,0.28)', width: '100px' }}>{cat}</span>
                  <div className="flex flex-wrap gap-1.5">{items.map(s => <span key={s} className="tag tag-cyan">{s}</span>)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* PROJECTS */}
      <section id="projects" className="py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="reveal divider-line" />
          <p className="reveal section-label">02 / projects</p>
          <h2 className="reveal text-4xl font-bold mb-10" style={{ ...syne, transitionDelay: '0.1s' }}>What I've Built</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {PROJECTS.map((p, i) => (
              <div key={p.id} className="reveal card-hover p-5 cursor-pointer" style={{ ...cardStyle, transitionDelay: `${i * 0.07}s` }}
                onClick={() => setExpandedProject(expandedProject === p.id ? null : p.id)}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex gap-2 flex-wrap">
                    <span className={`tag ${p.tagColor}`}>{p.type}</span>
                    {(p.status === 'GSoC 2026') && <span className="tag tag-amber">{p.status}</span>}
                    {(p.status === 'Published') && <span className="tag tag-green">{p.status}</span>}
                    {(p.status === 'Active') && <span className="tag tag-cyan">{p.status}</span>}
                  </div>
                  <span className="text-xs" style={{ ...mono, color: 'rgba(240,236,224,0.25)' }}>{p.year}</span>
                </div>
                <h3 className="text-sm font-bold mb-2" style={{ ...syne, color: C.text }}>{p.title}</h3>
                <p className="text-xs mb-3 leading-relaxed" style={{ ...mono, color: 'rgba(240,236,224,0.5)' }}>{p.description}</p>
                {expandedProject === p.id && (
                  <div className="mt-2 pt-3" style={{ borderTop: `1px solid ${C.border}` }}>
                    <p className="text-xs leading-relaxed mb-3" style={{ ...mono, color: 'rgba(240,236,224,0.6)' }}>{p.details}</p>
                    {p.metrics && (
                      <div className="flex gap-2 mb-3 flex-wrap">
                        {p.metrics.map(m => (
                          <div key={m.label} className="text-center px-3 py-1.5 rounded-sm" style={{ background: 'rgba(0,229,255,0.06)', border: `1px solid rgba(0,229,255,0.12)` }}>
                            <div className="text-sm font-bold" style={{ ...syne, color: C.cyan }}>{m.value}</div>
                            <div className="text-xs" style={{ ...mono, color: 'rgba(240,236,224,0.35)' }}>{m.label}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {p.tech.slice(0, 4).map(t => <span key={t} className="tag" style={{ background: 'rgba(240,236,224,0.03)', borderColor: 'rgba(240,236,224,0.08)', color: 'rgba(240,236,224,0.38)', fontSize: '0.62rem' }}>{t}</span>)}
                </div>
                <div className="flex gap-3 items-center">
                  {p.github && <a href={p.github} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} className="flex items-center gap-1 text-xs" style={{ ...mono, color: 'rgba(240,236,224,0.35)' }} onMouseEnter={e => (e.currentTarget.style.color = C.cyan)} onMouseLeave={e => (e.currentTarget.style.color = 'rgba(240,236,224,0.35)')}><Github size={11} /> repo</a>}
                  {p.liveDemo && <a href={p.liveDemo} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} className="flex items-center gap-1 text-xs" style={{ ...mono, color: 'rgba(240,236,224,0.35)' }} onMouseEnter={e => (e.currentTarget.style.color = C.amber)} onMouseLeave={e => (e.currentTarget.style.color = 'rgba(240,236,224,0.35)')}><ExternalLink size={11} /> demo</a>}
                  <button onClick={e => { e.stopPropagation(); setExpandedProject(expandedProject === p.id ? null : p.id); }} className="ml-auto text-xs" style={{ ...mono, color: 'rgba(0,229,255,0.4)' }}>{expandedProject === p.id ? '↑ less' : '↓ more'}</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* RESEARCH */}
      <section id="research" className="py-24" style={{ background: 'rgba(15,15,26,0.55)' }}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="reveal divider-line" style={{ background: `linear-gradient(90deg, ${C.amber}, transparent)` }} />
          <p className="reveal section-label" style={{ color: C.amber }}>03 / research</p>
          <h2 className="reveal text-4xl font-bold mb-4" style={{ ...syne, transitionDelay: '0.1s' }}>Publications</h2>
          <p className="reveal text-xs mb-10" style={{ ...mono, color: 'rgba(240,236,224,0.35)', transitionDelay: '0.15s' }}>Peer-reviewed papers in multimodal AI and enterprise communication security</p>
          <div className="space-y-5">
            {PAPERS.map((p, i) => (
              <div key={p.title} className="reveal paper-card p-6 rounded-sm" style={{ ...cardStyle, transitionDelay: `${i * 0.12}s` }}>
                <div className="flex items-start justify-between gap-3 mb-3 flex-wrap">
                  <div className="flex gap-2"><span className="tag tag-amber">{p.type}</span><span className="tag" style={{ background: 'rgba(240,236,224,0.03)', borderColor: 'rgba(240,236,224,0.08)', color: 'rgba(240,236,224,0.35)' }}>{p.year}</span></div>
                  {p.link && <a href={p.link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs" style={{ ...mono, color: C.amber }}><ExternalLink size={11} /> verify</a>}
                </div>
                <h3 className="text-sm font-bold mb-1 leading-snug" style={{ ...syne, color: C.text }}>{p.title}</h3>
                <p className="text-xs mb-2 flex items-center gap-1.5" style={{ ...mono, color: C.amber }}><BookOpen size={10} />{p.venue}</p>
                <p className="text-xs mb-3" style={{ ...mono, color: 'rgba(240,236,224,0.35)' }}>{p.authors}</p>
                <p className="text-xs leading-relaxed mb-4" style={{ ...mono, color: 'rgba(240,236,224,0.55)' }}>{p.abstract}</p>
                <div className="flex flex-wrap gap-2">{p.keywords.map(k => <span key={k} className="tag tag-amber" style={{ fontSize: '0.62rem' }}>{k}</span>)}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* OPEN SOURCE */}
      <section id="opensource" className="py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="reveal divider-line" style={{ background: `linear-gradient(90deg, ${C.green}, transparent)` }} />
          <p className="reveal section-label" style={{ color: C.green }}>04 / open source</p>
          <h2 className="reveal text-4xl font-bold mb-10" style={{ ...syne, transitionDelay: '0.1s' }}>Contributions</h2>
          <div className="grid md:grid-cols-2 gap-5">
            {OSS.map((o, i) => (
              <div key={o.org} className="reveal oss-card p-6 rounded-sm" style={{ ...cardStyle, transitionDelay: `${i * 0.12}s` }}>
                <div className="flex items-start justify-between mb-3">
                  <div><h3 className="text-sm font-bold" style={{ ...syne, color: C.text }}>{o.org}</h3><p className="text-xs mt-0.5" style={{ ...mono, color: 'rgba(240,236,224,0.35)' }}>{o.role}</p></div>
                  <span className={`tag ${o.tagColor}`}>{o.status}</span>
                </div>
                <p className="text-xs leading-relaxed mb-4" style={{ ...mono, color: 'rgba(240,236,224,0.55)' }}>{o.description}</p>
                <ul className="space-y-2 mb-4">
                  {o.contributions.map(c => <li key={c} className="flex gap-2 text-xs" style={{ ...mono, color: 'rgba(240,236,224,0.45)' }}><span style={{ color: C.green, flexShrink: 0 }}>→</span>{c}</li>)}
                </ul>
                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap gap-1.5">{o.tech.map(t => <span key={t} className="tag tag-green" style={{ fontSize: '0.62rem' }}>{t}</span>)}</div>
                  <a href={o.repo} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs ml-3 flex-shrink-0" style={{ ...mono, color: 'rgba(240,236,224,0.35)' }} onMouseEnter={e => (e.currentTarget.style.color = C.green)} onMouseLeave={e => (e.currentTarget.style.color = 'rgba(240,236,224,0.35)')}><GitBranch size={11} /> repo</a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CERTIFICATIONS */}
      <section id="certifications" className="py-24" style={{ background: 'rgba(15,15,26,0.55)' }}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="reveal divider-line" />
          <p className="reveal section-label">05 / certifications</p>
          <h2 className="reveal text-4xl font-bold mb-10" style={{ ...syne, transitionDelay: '0.1s' }}>Credentials</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {CERTS.map((c, i) => (
              <div key={c.title} className="reveal cert-card card-hover cursor-pointer rounded-sm overflow-hidden" style={{ ...cardStyle, transitionDelay: `${i * 0.06}s` }} onClick={() => setCertModal(c)}>
                <div className="aspect-video overflow-hidden" style={{ background: '#0a0a14' }}>
                  <img src={c.image} alt={c.title} className="w-full h-full object-cover" loading="lazy" />
                </div>
                <div className="p-3">
                  <p className="text-xs font-semibold leading-snug mb-0.5" style={{ ...syne, color: C.text }}>{c.title}</p>
                  <p className="text-xs" style={{ ...mono, color: 'rgba(240,236,224,0.3)' }}>{c.issuer}</p>
                  <p className="text-xs mt-1" style={{ ...mono, color: C.cyan }}>{c.date}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="reveal text-xs text-center mt-5" style={{ ...mono, color: 'rgba(240,236,224,0.25)', transitionDelay: '0.5s' }}>click any certificate to enlarge</p>
        </div>
      </section>

      {/* FREELANCE */}
      <section id="freelance" className="py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="reveal divider-line" style={{ background: `linear-gradient(90deg, ${C.green}, transparent)` }} />
          <p className="reveal section-label" style={{ color: C.green }}>06 / freelance</p>
          <h2 className="reveal text-4xl font-bold mb-4" style={{ ...syne, transitionDelay: '0.1s' }}>Available for Hire</h2>
          <p className="reveal text-xs mb-10" style={{ ...mono, color: 'rgba(240,236,224,0.35)', transitionDelay: '0.15s' }}>Open to freelance projects, consulting, and short-term AI/ML contracts</p>
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            {FREELANCE.map((f, i) => (
              <div key={f.title} className="reveal freelance-card p-6 rounded-sm" style={{ ...cardStyle, transitionDelay: `${i * 0.1}s` }}>
                <h3 className="text-sm font-bold mb-2" style={{ ...syne, color: C.text }}>{f.title}</h3>
                <p className="text-xs leading-relaxed mb-4" style={{ ...mono, color: 'rgba(240,236,224,0.5)' }}>{f.description}</p>
                <div className="space-y-1.5">
                  {f.services.map(s => <div key={s} className="flex items-center gap-2 text-xs" style={mono}><span style={{ color: C.green }}>✓</span><span style={{ color: 'rgba(240,236,224,0.55)' }}>{s}</span></div>)}
                </div>
              </div>
            ))}
          </div>
          <div className="reveal text-center p-8 rounded-sm" style={{ background: 'rgba(0,229,255,0.03)', border: `1px solid rgba(0,229,255,0.1)`, transitionDelay: '0.35s' }}>
            <p className="text-sm font-bold mb-2" style={{ ...syne, color: C.text }}>Got a project in mind?</p>
            <p className="text-xs mb-5" style={{ ...mono, color: C.muted }}>Available for part-time contracts alongside studies. Typical turnaround 1–3 weeks.</p>
            <a href="mailto:soham.ai.engineer@gmail.com" className="inline-flex items-center gap-2 text-sm font-semibold" style={{ ...syne, background: 'rgba(0,229,255,0.08)', border: `1px solid rgba(0,229,255,0.25)`, color: C.cyan, padding: '9px 22px', borderRadius: '3px' }}>
              <Mail size={13} /> Get in Touch
            </a>
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="py-24" style={{ background: 'rgba(15,15,26,0.55)' }}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="reveal divider-line" />
          <p className="reveal section-label">07 / contact</p>
          <h2 className="reveal text-4xl font-bold mb-10" style={{ ...syne, transitionDelay: '0.1s' }}>Let's Connect</h2>
          <div className="grid md:grid-cols-2 gap-10">
            <div className="reveal space-y-3" style={{ transitionDelay: '0.2s' }}>
              {[{ label: 'Email', value: 'soham.ai.engineer@gmail.com', href: 'mailto:soham.ai.engineer@gmail.com', icon: Mail }, { label: 'GitHub', value: 'github.com/sohamjadhav95', href: 'https://github.com/sohamjadhav95', icon: Github }, { label: 'LinkedIn', value: 'linkedin.com/in/sohamjadhav95', href: 'https://linkedin.com/in/sohamjadhav95', icon: Linkedin }, { label: 'Twitter', value: '@sohamjadhav_95', href: 'https://x.com/sohamjadhav_95', icon: Twitter }].map(({ label, value, href, icon: Icon }) => (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer" className="card-hover flex items-center gap-4 p-4 rounded-sm" style={{ ...cardStyle, textDecoration: 'none' }}>
                  <div style={{ background: 'rgba(0,229,255,0.07)', border: `1px solid rgba(0,229,255,0.15)`, borderRadius: '4px', padding: '7px' }}><Icon size={13} style={{ color: C.cyan }} /></div>
                  <div><p className="text-xs" style={{ ...mono, color: 'rgba(240,236,224,0.3)' }}>{label}</p><p className="text-xs" style={{ ...mono, color: C.muted }}>{value}</p></div>
                  <ArrowUpRight size={11} style={{ color: 'rgba(0,229,255,0.25)', marginLeft: 'auto' }} />
                </a>
              ))}
            </div>
            <div className="reveal" style={{ transitionDelay: '0.3s' }}>
              <div className="p-6 rounded-sm h-full" style={cardStyle}>
                <p className="text-xs mb-5" style={{ ...mono, color: 'rgba(240,236,224,0.25)' }}>// currently open to</p>
                {[['AI/ML Engineer','Full-time'],['Deep Learning Engineer','Full-time / Internship'],['Generative AI Engineer','Full-time / Internship'],['Research Internship','Remote / On-site'],['Freelance AI Projects','Part-time']].map(([role, type]) => (
                  <div key={role} className="flex items-center justify-between py-3" style={{ borderBottom: `1px solid rgba(240,236,224,0.04)` }}>
                    <span className="text-xs font-semibold" style={{ ...syne, color: C.text }}>{role}</span>
                    <span className="tag tag-green" style={{ fontSize: '0.6rem' }}>{type}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-7" style={{ borderTop: `1px solid ${C.border}` }}>
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between flex-wrap gap-3">
          <span className="text-xs" style={{ ...mono, color: 'rgba(240,236,224,0.2)' }}>© 2025 Soham Jadhav — Built with React + Vite + Tailwind</span>
          <span className="text-xs" style={{ ...mono, color: 'rgba(0,229,255,0.35)' }}>soham.ai.engineer@gmail.com</span>
        </div>
      </footer>

      {/* CERT MODAL */}
      {certModal && (
        <div className="modal-bg" onClick={() => setCertModal(null)}>
          <div className="relative max-w-3xl w-full" onClick={e => e.stopPropagation()}>
            <button onClick={() => setCertModal(null)} style={{ position: 'absolute', top: '-36px', right: '0', color: 'rgba(240,236,224,0.5)', cursor: 'pointer' }}><X size={18} /></button>
            <div className="rounded-sm overflow-hidden" style={{ border: `1px solid rgba(0,229,255,0.15)` }}>
              <img src={certModal.image} alt={certModal.title} className="w-full" />
              <div className="p-4 flex items-center justify-between flex-wrap gap-3" style={{ background: 'rgba(15,15,26,0.97)' }}>
                <div>
                  <p className="text-sm font-bold" style={{ ...syne, color: C.text }}>{certModal.title}</p>
                  <p className="text-xs" style={{ ...mono, color: 'rgba(240,236,224,0.35)' }}>{certModal.issuer} · {certModal.date}</p>
                </div>
                {certModal.link && (
                  <a href={certModal.link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs" style={{ ...mono, background: 'rgba(0,229,255,0.07)', border: `1px solid rgba(0,229,255,0.22)`, color: C.cyan, padding: '5px 12px', borderRadius: '3px' }}>
                    <ExternalLink size={11} /> Verify
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
