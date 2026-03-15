import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Github, Linkedin, Mail, Twitter, ExternalLink, X, Download, ArrowUpRight, BookOpen, GitBranch, FileText } from 'lucide-react';
import ibmDeepLearningCert from '@/assets/ibm-deep-learning-cert.png';
import mlPythonCert from '@/assets/ml-python-cert.png';
import genAiLlmsCert from '@/assets/gen-ai-llms-cert.jpg';
import ibmAiEngineeringCert from '@/assets/ibm-ai-engineering-cert.jpg';
import gdgCoLeadCert from '@/assets/gdg-colead-cert.png';

/* ─── DATA ─────────────────────────────────────────── */

const NAV_ITEMS = ['Home','About','Projects','Research','OpenSource','Certifications','Freelance','Contact'];

const TECH_MARQUEE = ['PyTorch','TensorFlow','HuggingFace','LangChain','OpenCV','Python','Gemma 3','BLIP-2','Whisper','RAG','LoRA/QLoRA','AutoML','XAI','NumPy','Pandas','SQL','Streamlit','Gradio'];

const STATS = [
  { end: 2,   suffix: '',  label: 'Papers Published' },
  { end: 6,   suffix: '+', label: 'Projects Shipped' },
  { end: 9,   suffix: '',  label: 'Certifications'   },
  { end: 500, suffix: '+', label: 'Connections'      },
];

const SKILLS: Record<string, { label: string; color: string }[]> = {
  'AI / ML': [
    { label:'PyTorch', color:'pill-lime' },{ label:'TensorFlow', color:'pill-lime' },
    { label:'HuggingFace', color:'pill-lime' },{ label:'scikit-learn', color:'pill-lime' },
    { label:'OpenCV', color:'pill-lime' },{ label:'LangChain', color:'pill-lime' },
  ],
  'GenAI Stack': [
    { label:'LLMs', color:'pill-blue' },{ label:'RAG', color:'pill-blue' },
    { label:'Fine-tuning', color:'pill-blue' },{ label:'LoRA/QLoRA', color:'pill-blue' },
    { label:'Gemma 3', color:'pill-blue' },{ label:'BLIP-2', color:'pill-blue' },
    { label:'Whisper', color:'pill-blue' },
  ],
  'Languages': [
    { label:'Python', color:'pill-amber' },{ label:'TypeScript', color:'pill-amber' },
    { label:'C++', color:'pill-amber' },{ label:'SQL', color:'pill-amber' },
  ],
  'Data & Tools': [
    { label:'NumPy', color:'pill-white' },{ label:'Pandas', color:'pill-white' },
    { label:'AutoML', color:'pill-white' },{ label:'XAI', color:'pill-white' },
    { label:'Git', color:'pill-white' },{ label:'Colab', color:'pill-white' },
    { label:'Streamlit', color:'pill-white' },
  ],
};

interface Metric { label: string; value: string; }
interface Project {
  id: string; title: string; label: string; pillColor: string;
  year: string; badge?: string; badgeColor?: string;
  short: string; detail: string; tech: string[];
  github?: string; demo?: string; metrics?: Metric[];
}
const PROJECTS: Project[] = [
  { id:'copilot', title:'Copilot for Data Science', label:'AI Agent', pillColor:'pill-lime', year:'2025', badge:'Active', badgeColor:'pill-green',
    short:'Agentic AI automating ~90% of data science workflows through natural language.',
    detail:'Transforms natural language into executable queries. Integrates XAI, AutoML, and RAG for adaptive, explainable decision-making. Supports diverse data formats with full audit trails.',
    tech:['Python','AutoML','NLP','RAG','XAI'],
    github:'https://github.com/sohamjadhav95/Copilot-For-Data-Science' },
  { id:'deeplense', title:'ML4Sci DeepLense', label:'Deep Learning', pillColor:'pill-purple', year:'2026', badge:'GSoC 2026', badgeColor:'pill-amber',
    short:'Gravitational lens detection and CAC segmentation for astrophysics pipelines.',
    detail:'ResNet18 multi-class classifier: ~92.5% val accuracy, macro AUC ~0.985. Binary lens finder with WeightedRandomSampler: ~97% test accuracy. PREDICT1: U-Net CAC segmentation on Stanford COCA, targeting Dice > 0.85.',
    tech:['PyTorch','ResNet18','U-Net','Colab'],
    github:'https://github.com/sohamjadhav95/ML4Sci-DeepLense-GSoC2026',
    metrics:[{ label:'Val Accuracy', value:'92.5%' },{ label:'Macro AUC', value:'0.985' },{ label:'Binary Acc', value:'97%' }] },
  { id:'convoease', title:'Convo-Ease', label:'Multimodal AI', pillColor:'pill-blue', year:'2025', badge:'Published', badgeColor:'pill-lime',
    short:'Real-time multimodal moderation with Gatekeeper Architecture and Policy-as-Prompt.',
    detail:'Pre-delivery validation across Text + Image + Audio. Sub-3s latency using Gemma 3 27B, BLIP-2 for captioning, Whisper for transcription. 100K synthetic training samples.',
    tech:['Gemma 3','BLIP-2','Whisper','LangChain'],
    metrics:[{ label:'Latency', value:'<3s' },{ label:'Train Data', value:'100K' },{ label:'Modalities', value:'3' }] },
  { id:'coverletter', title:'Gen-AI Cover Letter', label:'Generative AI', pillColor:'pill-amber', year:'2024',
    short:'TinyLlama (1.1B) fine-tuned via QLoRA for personalized cover letter generation.',
    detail:'Trained on resume–JD pairs with QLoRA. Semantic similarity + RAG aligns output to job requirements. Gradio web interface with cloud-ready deployment.',
    tech:['TinyLlama','QLoRA','HuggingFace','Gradio'],
    github:'https://github.com/sohamjadhav95/Cover-Letter-Tailoring-Gen-AI' },
  { id:'nexaos', title:'NexaOS Flow', label:'Automation', pillColor:'pill-rose', year:'2024',
    short:'Voice-activated OS controller executing system commands via natural language.',
    detail:'Speech Recognition + NLP intent parsing + TTS feedback + OS-level APIs. Context-aware command chains, multi-language support.',
    tech:['Python','NLP','Speech Recognition','TTS'],
    github:'https://github.com/sohamjadhav95/Neuro-Intelligence' },
  { id:'tennis', title:'Tennis Match Predictor', label:'Machine Learning', pillColor:'pill-white', year:'2024',
    short:'77% accurate ATP match predictor using Elo ratings, form, and fatigue analysis.',
    detail:'XGBoost + LightGBM ensemble with dynamic Elo, surface prefs, and fatigue modelling. Live Streamlit demo.',
    tech:['XGBoost','LightGBM','Python'],
    github:'https://github.com/sohamjadhav95/AI-Powered-Tennis-Match-Outcome-Predictor',
    demo:'https://ai-powered-tennis-match-outcome-predict.streamlit.app/',
    metrics:[{ label:'Accuracy', value:'77%' }] },
];

const PAPERS = [
  { title:'Convo-Ease: Intelligent Multi-Modal Moderation for Digital Organizational Communication',
    venue:'Cureus — Springer Nature', year:'2025', type:'Conference Paper',
    authors:'Soham S. Jadhav, Nisha D. Patil, Omkar N. Gadakh, Atharv S. Gaikwad',
    abstract:'Proposes a Gatekeeper Architecture for pre-delivery content validation across Text + Image + Audio using Policy-as-Prompt. Achieves sub-3s latency with Gemma 3, BLIP-2, and Whisper. 100K synthetic training samples generated.',
    keywords:['Multimodal AI','LLMs','Gatekeeper Architecture','Policy-as-Prompt','Enterprise Security'],
    link:'https://coursera.org/verify/specialization/4PDD1WMUR5ZD' },
  { title:'Beyond Text: A Comprehensive Survey of Multimodal Content Moderation Architectures in Enterprise Environments',
    venue:'ICIA Conference Proceedings', year:'2025', type:'Survey Paper',
    authors:'Soham S. Jadhav, Omkar N. Gadakh, Nisha D. Patil, Atharv S. Gaikwad',
    abstract:'Surveys 26+ moderation methodologies from LLM guardrails to multimodal fusion architectures. Maps the shift from reactive API-based to dynamic Policy-as-Prompt frameworks. Identifies critical gaps in latency and on-premise privacy.',
    keywords:['Survey','Content Moderation','Audio-Visual Fusion','Enterprise AI','Privacy'] },
];

const OSS = [
  { org:'ML4Sci — DeepLense', role:'GSoC 2026 Applicant', status:'Active', pillColor:'pill-purple',
    description:'Contributing gravitational lens detection and segmentation for astrophysics pipelines. Three proposals: DEEPLENSE6, DEEPLENSE7, and PREDICT1.',
    contributions:['ResNet18 multi-class classifier (~92.5% val acc, AUC 0.985)','Binary lens finder via WeightedRandomSampler (~97% test acc)','CAC segmentation on Stanford COCA (U-Net, Dice > 0.85 target)'],
    repo:'https://github.com/sohamjadhav95/ML4Sci-DeepLense-GSoC2026', tech:['PyTorch','ResNet18','U-Net'] },
  { org:'pgmpy', role:'Open Source Contributor', status:'In Progress', pillColor:'pill-green',
    description:'Improving doctest coverage across the probabilistic graphical models library under parent tracking issue #2832.',
    contributions:['Identifying and fixing failing doctests','Following established contribution patterns'],
    repo:'https://github.com/pgmpy/pgmpy', tech:['Python','Bayesian Networks'] },
];

const FREELANCE = [
  { title:'AI/ML Development', services:['Custom ML Models','LLM Integration','RAG Pipelines','AI API Development'],
    description:'End-to-end AI application development — model training, API integration, deployment.' },
  { title:'Data Science Consulting', services:['EDA & Visualization','Predictive Analytics','AutoML','Report Generation'],
    description:'Data analysis, predictive modelling, and dashboard development for business insights.' },
  { title:'Generative AI Engineering', services:['LLM Fine-tuning','RAG Systems','Prompt Engineering','AI Deployment'],
    description:'Fine-tuning LLMs with LoRA/QLoRA, building RAG systems, and deploying GenAI apps.' },
];

const CERTS = [
  { title:'IBM AI Engineering Professional', issuer:'IBM / Coursera', date:'Dec 2025', image:ibmAiEngineeringCert, link:'https://coursera.org/verify/professional-cert/IJ5Z0ADQ8EC2' },
  { title:'IBM Deep Learning — PyTorch, Keras & TF', issuer:'IBM / Coursera', date:'Jun 2025', image:ibmDeepLearningCert, link:'https://coursera.org/verify/professional-cert/LT6ZHJY82CPB' },
  { title:'Generative AI Engineering with LLMs', issuer:'IBM / Coursera', date:'Dec 2025', image:genAiLlmsCert, link:'https://coursera.org/verify/specialization/4PDD1WMUR5ZD' },
  { title:'Machine Learning with Python', issuer:'IBM / Coursera', date:'Sep 2024', image:mlPythonCert, link:'https://coursera.org/verify/CTGCLPT5MP9N' },
  { title:'Career Essentials in Generative AI', issuer:'Microsoft & LinkedIn', date:'Aug 2024', image:'https://i.postimg.cc/QCgNCV2C/Certificate-Of-Completion-Career-Essentials-in-Generative-AI-by-Microsoft-and-Linked-In.png', link:null },
  { title:'GDG AI-ML Co-Lead', issuer:'Google Developer Groups', date:'2025', image:gdgCoLeadCert, link:null },
  { title:'SQL Advanced', issuer:'HackerRank', date:'Sep 2024', image:'https://i.postimg.cc/zD4TRQ91/sql-advanced-certificate.png', link:null },
  { title:'Python', issuer:'HackerRank', date:'Aug 2024', image:mlPythonCert, link:null },
];

/* ─── HOOKS ─────────────────────────────────────────── */

function useCountUp(end: number, started: boolean, duration = 1400) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!started) return;
    const t0 = Date.now();
    const tick = () => {
      const p = Math.min((Date.now() - t0) / duration, 1);
      const e = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(e * end));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [started, end, duration]);
  return val;
}

function StatBox({ end, suffix, label }: { end: number; suffix: string; label: string }) {
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const val = useCountUp(end, started);
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setStarted(true); io.disconnect(); } }, { threshold: 0.5 });
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className="text-center px-6 py-5 card reveal">
      <div className="stat-val">{val}{suffix}</div>
      <div className="mt-1 text-xs" style={{ fontFamily:'DM Mono', color:'rgba(245,244,239,0.38)', letterSpacing:'0.06em' }}>{label}</div>
    </div>
  );
}

/* ─── COMPONENT ─────────────────────────────────────── */

export default function Index() {
  const navigate = useNavigate();
  const [active, setActive] = useState('home');
  const [expanded, setExpanded] = useState<string|null>(null);
  const [certModal, setCertModal] = useState<typeof CERTS[0]|null>(null);

  useEffect(() => {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) e.target.classList.add('in'); }), { threshold: 0.08 });
    document.querySelectorAll('.reveal').forEach(el => io.observe(el));
    const sio = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) setActive(e.target.id); }), { threshold: 0.35 });
    NAV_ITEMS.forEach(n => { const el = document.getElementById(n.toLowerCase()); if (el) sio.observe(el); });
    return () => { io.disconnect(); sio.disconnect(); };
  }, []);

  const go = (id: string) => document.getElementById(id.toLowerCase())?.scrollIntoView({ behavior:'smooth' });

  return (
    <div style={{ background:'var(--bg)', minHeight:'100vh' }}>

      {/* ── NAV ──────────────────────────── */}
      <nav style={{ background:'rgba(15,15,13,0.88)', borderBottom:'1px solid var(--border)', position:'fixed', top:0, left:0, right:0, zIndex:50, backdropFilter:'blur(16px)' }}>
        <div style={{ maxWidth:'1100px', margin:'0 auto', padding:'0 1.5rem', height:'52px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <button onClick={() => go('home')} style={{ fontFamily:'Bricolage Grotesque', fontSize:'1.1rem', fontWeight:800, color:'var(--text)', letterSpacing:'-0.02em' }}>
            Soham<span style={{ color:'var(--accent)' }}>.</span>
          </button>
          <div style={{ display:'flex', gap:'1.75rem', alignItems:'center' }}>
            {NAV_ITEMS.map(n => (
              <button key={n} onClick={() => go(n)} className={`nav-link ${active === n.toLowerCase() ? 'active' : ''}`}>
                {n.toLowerCase().replace('opensource','oss')}
              </button>
            ))}
          </div>
          <div style={{ display:'flex', gap:'0.75rem', alignItems:'center' }}>
            <button onClick={() => navigate('/readme')} className="btn-ghost" style={{ padding:'6px 14px', fontSize:'0.75rem', gap:'5px' }}>
              <FileText size={12} /> README
            </button>
            <a href="https://drive.google.com/file/d/1MuONHQJkPSyDbuyUYkUHtK257MDDGGQs/view?usp=sharing" target="_blank" rel="noopener noreferrer" className="btn-primary" style={{ padding:'6px 14px', fontSize:'0.75rem', gap:'5px' }}>
              <Download size={12} /> Resume
            </a>
          </div>
        </div>
      </nav>

      {/* ── HERO ─────────────────────────── */}
      <section id="home" style={{ minHeight:'100vh', display:'flex', alignItems:'center', paddingTop:'52px', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:'30%', right:'5%', width:'500px', height:'500px', background:'radial-gradient(circle, rgba(203,240,74,0.04), transparent 70%)', pointerEvents:'none' }} />
        <div style={{ maxWidth:'1100px', margin:'0 auto', padding:'0 1.5rem', width:'100%', paddingTop:'4rem', paddingBottom:'4rem' }}>
          <p className="section-label" style={{ animationDelay:'0s', opacity:1 }}>// Final Year AI Engineer · Nashik, India</p>
          <h1 style={{ fontFamily:'Bricolage Grotesque', fontWeight:800, fontSize:'clamp(3.5rem, 9vw, 7.5rem)', lineHeight:1.0, marginTop:'1rem', marginBottom:'1.5rem', letterSpacing:'-0.03em' }}>
            {'Building AI'.split(' ').map((w,i) => (
              <span key={w} className="hero-word" style={{ animationDelay:`${i*0.12}s`, marginRight:'0.25em' }}>{w}</span>
            ))}
            <br />
            {'that ships.'.split(' ').map((w,i) => (
              <span key={w} className="hero-word" style={{ animationDelay:`${(i+2)*0.12}s`, marginRight:'0.25em', color:'var(--accent)' }}>{w}</span>
            ))}
          </h1>
          <p className="hero-word" style={{ animationDelay:'0.5s', maxWidth:'520px', color:'rgba(245,244,239,0.5)', fontSize:'1rem', lineHeight:1.65, marginBottom:'2rem' }}>
            Deep learning, generative AI, and agentic workflows. Published researcher, GSoC 2026 applicant, open source contributor.
          </p>
          <div className="hero-word" style={{ animationDelay:'0.62s', display:'flex', gap:'0.75rem', flexWrap:'wrap', marginBottom:'2.5rem' }}>
            <span className="pill pill-lime">PyTorch</span>
            <span className="pill pill-amber">GSoC 2026</span>
            <span className="pill pill-green">2× Published</span>
            <span className="pill pill-blue">Generative AI</span>
          </div>
          <div className="hero-word" style={{ animationDelay:'0.74s', display:'flex', gap:'0.75rem', flexWrap:'wrap', marginBottom:'3rem' }}>
            <button onClick={() => go('projects')} className="btn-primary">View Work <ArrowUpRight size={14} /></button>
            <a href="mailto:soham.ai.engineer@gmail.com" className="btn-ghost">Contact Me <Mail size={14} /></a>
          </div>
          <div className="hero-word" style={{ animationDelay:'0.86s', display:'flex', gap:'0.75rem' }}>
            {[{ icon:Github, url:'https://github.com/sohamjadhav95' },{ icon:Linkedin, url:'https://linkedin.com/in/sohamjadhav95' },{ icon:Twitter, url:'https://x.com/sohamjadhav_95' }].map(({ icon:Icon, url }) => (
              <a key={url} href={url} target="_blank" rel="noopener noreferrer" style={{ padding:'8px', background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'8px', color:'rgba(245,244,239,0.45)', display:'flex', alignItems:'center', justifyContent:'center', transition:'all 0.2s ease' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(203,240,74,0.3)'; (e.currentTarget as HTMLElement).style.color = 'var(--accent)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLElement).style.color = 'rgba(245,244,239,0.45)'; }}>
                <Icon size={16} />
              </a>
            ))}
          </div>

          {/* Stats row */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'1rem', marginTop:'4rem' }}>
            {STATS.map((s,i) => <div key={s.label} style={{ transitionDelay:`${i*0.08}s` }}><StatBox {...s} /></div>)}
          </div>
        </div>
      </section>

      {/* ── MARQUEE ──────────────────────── */}
      <div style={{ borderTop:'1px solid var(--border)', borderBottom:'1px solid var(--border)', background:'var(--surface)', padding:'0.875rem 0', overflow:'hidden' }}>
        <div className="marquee-inner">
          {[...TECH_MARQUEE, ...TECH_MARQUEE].map((t, i) => (
            <span key={i} style={{ fontFamily:'DM Mono', fontSize:'0.72rem', color:'rgba(245,244,239,0.3)', letterSpacing:'0.1em', whiteSpace:'nowrap' }}>
              {t} <span style={{ color:'var(--accent)', marginLeft:'1.25rem' }}>·</span>
            </span>
          ))}
        </div>
      </div>

      {/* ── ABOUT ────────────────────────── */}
      <section id="about" style={{ padding:'6rem 1.5rem', position:'relative', overflow:'hidden' }}>
        <div style={{ maxWidth:'1100px', margin:'0 auto', position:'relative' }}>
          <span className="ghost-num">01</span>
          <div className="section-inner">
            <div className="divider reveal" />
            <p className="reveal section-label" style={{ transitionDelay:'0.05s' }}>01 / about</p>
            <h2 className="reveal" style={{ fontFamily:'Bricolage Grotesque', fontSize:'clamp(2rem, 5vw, 3.5rem)', fontWeight:800, marginBottom:'3rem', transitionDelay:'0.1s' }}>Who I Am</h2>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'4rem', alignItems:'start' }}>
              <div className="reveal" style={{ transitionDelay:'0.15s' }}>
                <p style={{ color:'rgba(245,244,239,0.55)', lineHeight:1.8, marginBottom:'1.25rem' }}>
                  Final-year B.E. in AI & Data Science at MET's Institute of Engineering, Nashik. I design and ship intelligent systems — from gravitational lens classifiers to multimodal content moderation frameworks.
                </p>
                <p style={{ color:'rgba(245,244,239,0.55)', lineHeight:1.8, marginBottom:'2rem' }}>
                  Two peer-reviewed papers published. AI-ML Co-Lead at GDG. Applying for GSoC 2026 with ML4Sci. I build AI to work in production, not for demos.
                </p>
                <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'8px', padding:'1rem 1.25rem', fontFamily:'DM Mono', fontSize:'0.78rem', lineHeight:1.8 }}>
                  <span style={{ color:'rgba(245,244,239,0.25)' }}>const </span>
                  <span style={{ color:'var(--accent)' }}>mission</span>
                  <span style={{ color:'rgba(245,244,239,0.25)' }}> = </span>
                  <span style={{ color:'rgba(245,244,239,0.5)' }}>"Ship AI that actually works."</span>
                </div>
              </div>
              <div className="reveal" style={{ transitionDelay:'0.2s' }}>
                <div style={{ display:'flex', flexDirection:'column', gap:'0.625rem' }}>
                  {[['Degree','B.E. Artificial Intelligence & Data Science'],['College',"MET's Institute of Engineering, Nashik"],['Duration','Oct 2022 – Jul 2026'],['Location','Nashik, Maharashtra, India'],['Status','Open to Work ✦'],['Email','soham.ai.engineer@gmail.com']].map(([l,v]) => (
                    <div key={l} style={{ display:'flex', gap:'1.5rem', fontSize:'0.85rem', paddingBottom:'0.5rem', borderBottom:'1px solid rgba(245,244,239,0.04)' }}>
                      <span style={{ fontFamily:'DM Mono', fontSize:'0.72rem', color:'rgba(245,244,239,0.28)', minWidth:'72px', flexShrink:0, paddingTop:'2px' }}>{l}</span>
                      <span style={{ color: l==='Status' ? 'var(--accent)' : 'rgba(245,244,239,0.62)' }}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="reveal" style={{ marginTop:'3rem', transitionDelay:'0.25s' }}>
              <p style={{ fontFamily:'DM Mono', fontSize:'0.68rem', color:'rgba(245,244,239,0.2)', letterSpacing:'0.1em', marginBottom:'1.25rem' }}>// TECH STACK</p>
              <div style={{ display:'flex', flexDirection:'column', gap:'0.875rem' }}>
                {Object.entries(SKILLS).map(([cat, items]) => (
                  <div key={cat} style={{ display:'flex', gap:'1rem', alignItems:'flex-start', flexWrap:'wrap' }}>
                    <span style={{ fontFamily:'DM Mono', fontSize:'0.68rem', color:'rgba(245,244,239,0.25)', minWidth:'88px', flexShrink:0, paddingTop:'4px', letterSpacing:'0.04em' }}>{cat}</span>
                    <div style={{ display:'flex', flexWrap:'wrap', gap:'0.5rem' }}>
                      {items.map(s => <span key={s.label} className={`pill ${s.color}`}>{s.label}</span>)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PROJECTS ─────────────────────── */}
      <section id="projects" style={{ padding:'6rem 1.5rem', background:'var(--surface)', position:'relative', overflow:'hidden' }}>
        <div style={{ maxWidth:'1100px', margin:'0 auto', position:'relative' }}>
          <span className="ghost-num">02</span>
          <div className="section-inner">
            <div className="divider reveal" />
            <p className="reveal section-label" style={{ transitionDelay:'0.05s' }}>02 / projects</p>
            <h2 className="reveal" style={{ fontFamily:'Bricolage Grotesque', fontSize:'clamp(2rem,5vw,3.5rem)', fontWeight:800, marginBottom:'3rem', transitionDelay:'0.1s' }}>What I've Built</h2>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'1rem' }}>
              {PROJECTS.map((p,i) => (
                <div key={p.id} className="card card-accent-top reveal" style={{ padding:'1.5rem', cursor:'pointer', transitionDelay:`${i*0.06}s` }}
                  onClick={() => setExpanded(expanded===p.id?null:p.id)}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'0.875rem' }}>
                    <div style={{ display:'flex', gap:'0.5rem', flexWrap:'wrap' }}>
                      <span className={`pill ${p.pillColor}`}>{p.label}</span>
                      {p.badge && <span className={`pill ${p.badgeColor||'pill-white'}`}>{p.badge}</span>}
                    </div>
                    <span style={{ fontFamily:'DM Mono', fontSize:'0.65rem', color:'rgba(245,244,239,0.22)' }}>{p.year}</span>
                  </div>
                  <h3 style={{ fontFamily:'Bricolage Grotesque', fontSize:'1rem', fontWeight:700, marginBottom:'0.5rem', color:'var(--text)' }}>{p.title}</h3>
                  <p style={{ fontSize:'0.82rem', color:'rgba(245,244,239,0.45)', lineHeight:1.65, marginBottom:'1rem' }}>{p.short}</p>
                  {expanded===p.id && (
                    <div style={{ borderTop:'1px solid var(--border)', paddingTop:'1rem', marginBottom:'1rem' }}>
                      <p style={{ fontSize:'0.82rem', color:'rgba(245,244,239,0.58)', lineHeight:1.7, marginBottom:'1rem' }}>{p.detail}</p>
                      {p.metrics && (
                        <div style={{ display:'flex', gap:'0.75rem', flexWrap:'wrap', marginBottom:'1rem' }}>
                          {p.metrics.map(m => (
                            <div key={m.label} style={{ textAlign:'center', padding:'8px 12px', background:'rgba(203,240,74,0.06)', border:'1px solid rgba(203,240,74,0.12)', borderRadius:'6px' }}>
                              <div style={{ fontFamily:'Bricolage Grotesque', fontSize:'1.1rem', fontWeight:800, color:'var(--accent)' }}>{m.value}</div>
                              <div style={{ fontFamily:'DM Mono', fontSize:'0.62rem', color:'rgba(245,244,239,0.35)', marginTop:'2px' }}>{m.label}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                  <div style={{ display:'flex', flexWrap:'wrap', gap:'0.4rem', marginBottom:'1rem' }}>
                    {p.tech.map(t => <span key={t} className="pill pill-white" style={{ fontSize:'0.62rem' }}>{t}</span>)}
                  </div>
                  <div style={{ display:'flex', gap:'1rem', alignItems:'center' }}>
                    {p.github && <a href={p.github} target="_blank" rel="noopener noreferrer" onClick={e=>e.stopPropagation()} style={{ fontFamily:'DM Mono', fontSize:'0.72rem', color:'rgba(245,244,239,0.35)', display:'flex', alignItems:'center', gap:'4px', textDecoration:'none', transition:'color 0.2s' }} onMouseEnter={e=>(e.currentTarget.style.color='var(--accent)')} onMouseLeave={e=>(e.currentTarget.style.color='rgba(245,244,239,0.35)')}><Github size={12}/> repo</a>}
                    {p.demo && <a href={p.demo} target="_blank" rel="noopener noreferrer" onClick={e=>e.stopPropagation()} style={{ fontFamily:'DM Mono', fontSize:'0.72rem', color:'rgba(245,244,239,0.35)', display:'flex', alignItems:'center', gap:'4px', textDecoration:'none', transition:'color 0.2s' }} onMouseEnter={e=>(e.currentTarget.style.color='#fbbf24')} onMouseLeave={e=>(e.currentTarget.style.color='rgba(245,244,239,0.35)')}><ExternalLink size={12}/> demo</a>}
                    <button onClick={e=>{e.stopPropagation();setExpanded(expanded===p.id?null:p.id);}} style={{ marginLeft:'auto', fontFamily:'DM Mono', fontSize:'0.68rem', color:'rgba(203,240,74,0.45)', cursor:'pointer' }}>{expanded===p.id?'↑ less':'↓ more'}</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── RESEARCH ─────────────────────── */}
      <section id="research" style={{ padding:'6rem 1.5rem', position:'relative', overflow:'hidden' }}>
        <div style={{ maxWidth:'1100px', margin:'0 auto', position:'relative' }}>
          <span className="ghost-num">03</span>
          <div className="section-inner">
            <div className="divider reveal" style={{ background:'linear-gradient(90deg, #fbbf24, transparent)' }} />
            <p className="reveal section-label" style={{ color:'#fbbf24', transitionDelay:'0.05s' }}>03 / research</p>
            <h2 className="reveal" style={{ fontFamily:'Bricolage Grotesque', fontSize:'clamp(2rem,5vw,3.5rem)', fontWeight:800, marginBottom:'3rem', transitionDelay:'0.1s' }}>Publications</h2>
            <div style={{ display:'flex', flexDirection:'column', gap:'1.5rem' }}>
              {PAPERS.map((p,i) => (
                <div key={p.title} className="reveal" style={{ background:'var(--surface)', border:'1px solid var(--border)', borderLeft:'2px solid #fbbf24', borderRadius:'8px', padding:'2rem', transitionDelay:`${i*0.1}s` }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'1rem', flexWrap:'wrap', gap:'0.75rem' }}>
                    <div style={{ display:'flex', gap:'0.5rem', flexWrap:'wrap' }}>
                      <span className="pill pill-amber">{p.type}</span>
                      <span className="pill pill-white">{p.year}</span>
                    </div>
                    {p.link && <a href={p.link} target="_blank" rel="noopener noreferrer" style={{ fontFamily:'DM Mono', fontSize:'0.72rem', color:'#fbbf24', display:'flex', alignItems:'center', gap:'4px', textDecoration:'none' }}><ExternalLink size={11}/> verify</a>}
                  </div>
                  <h3 style={{ fontFamily:'Bricolage Grotesque', fontSize:'1.05rem', fontWeight:700, marginBottom:'0.5rem', lineHeight:1.3 }}>{p.title}</h3>
                  <p style={{ fontFamily:'DM Mono', fontSize:'0.72rem', color:'#fbbf24', marginBottom:'0.5rem', display:'flex', alignItems:'center', gap:'6px' }}><BookOpen size={11}/>{p.venue}</p>
                  <p style={{ fontFamily:'DM Mono', fontSize:'0.72rem', color:'rgba(245,244,239,0.3)', marginBottom:'1rem' }}>{p.authors}</p>
                  <p style={{ fontSize:'0.84rem', color:'rgba(245,244,239,0.52)', lineHeight:1.7, marginBottom:'1rem' }}>{p.abstract}</p>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:'0.4rem' }}>
                    {p.keywords.map(k => <span key={k} className="pill pill-amber" style={{ fontSize:'0.62rem' }}>{k}</span>)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── OPEN SOURCE ──────────────────── */}
      <section id="opensource" style={{ padding:'6rem 1.5rem', background:'var(--surface)', position:'relative', overflow:'hidden' }}>
        <div style={{ maxWidth:'1100px', margin:'0 auto', position:'relative' }}>
          <span className="ghost-num">04</span>
          <div className="section-inner">
            <div className="divider reveal" style={{ background:'linear-gradient(90deg, #34d399, transparent)' }} />
            <p className="reveal section-label" style={{ color:'#34d399', transitionDelay:'0.05s' }}>04 / open source</p>
            <h2 className="reveal" style={{ fontFamily:'Bricolage Grotesque', fontSize:'clamp(2rem,5vw,3.5rem)', fontWeight:800, marginBottom:'3rem', transitionDelay:'0.1s' }}>Contributions</h2>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1.5rem' }}>
              {OSS.map((o,i) => (
                <div key={o.org} className="reveal" style={{ background:'var(--bg)', border:'1px solid var(--border)', borderLeft:'2px solid #34d399', borderRadius:'8px', padding:'1.75rem', transitionDelay:`${i*0.1}s` }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'0.75rem' }}>
                    <div>
                      <h3 style={{ fontFamily:'Bricolage Grotesque', fontWeight:700, fontSize:'1.05rem' }}>{o.org}</h3>
                      <p style={{ fontFamily:'DM Mono', fontSize:'0.72rem', color:'rgba(245,244,239,0.3)', marginTop:'3px' }}>{o.role}</p>
                    </div>
                    <span className={`pill ${o.pillColor}`}>{o.status}</span>
                  </div>
                  <p style={{ fontSize:'0.84rem', color:'rgba(245,244,239,0.52)', lineHeight:1.65, marginBottom:'1.25rem' }}>{o.description}</p>
                  <ul style={{ listStyle:'none', marginBottom:'1.25rem', display:'flex', flexDirection:'column', gap:'6px' }}>
                    {o.contributions.map(c => <li key={c} style={{ fontSize:'0.82rem', color:'rgba(245,244,239,0.45)', display:'flex', gap:'8px', alignItems:'flex-start' }}><span style={{ color:'#34d399', flexShrink:0, marginTop:'2px' }}>→</span>{c}</li>)}
                  </ul>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <div style={{ display:'flex', gap:'0.4rem', flexWrap:'wrap' }}>
                      {o.tech.map(t => <span key={t} className="pill pill-green" style={{ fontSize:'0.62rem' }}>{t}</span>)}
                    </div>
                    <a href={o.repo} target="_blank" rel="noopener noreferrer" style={{ fontFamily:'DM Mono', fontSize:'0.72rem', color:'rgba(245,244,239,0.3)', display:'flex', alignItems:'center', gap:'4px', textDecoration:'none', transition:'color 0.2s', marginLeft:'0.75rem', flexShrink:0 }} onMouseEnter={e=>(e.currentTarget.style.color='#34d399')} onMouseLeave={e=>(e.currentTarget.style.color='rgba(245,244,239,0.3)')}><GitBranch size={12}/> repo</a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CERTIFICATIONS ───────────────── */}
      <section id="certifications" style={{ padding:'6rem 1.5rem', position:'relative', overflow:'hidden' }}>
        <div style={{ maxWidth:'1100px', margin:'0 auto', position:'relative' }}>
          <span className="ghost-num">05</span>
          <div className="section-inner">
            <div className="divider reveal" />
            <p className="reveal section-label" style={{ transitionDelay:'0.05s' }}>05 / certifications</p>
            <h2 className="reveal" style={{ fontFamily:'Bricolage Grotesque', fontSize:'clamp(2rem,5vw,3.5rem)', fontWeight:800, marginBottom:'3rem', transitionDelay:'0.1s' }}>Credentials</h2>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'1rem' }}>
              {CERTS.map((c,i) => (
                <div key={c.title} className="reveal" style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'8px', overflow:'hidden', cursor:'pointer', transition:'all 0.25s ease', transitionDelay:`${i*0.05}s` }}
                  onClick={() => setCertModal(c)}
                  onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.borderColor='rgba(203,240,74,0.2)';(e.currentTarget as HTMLElement).style.transform='translateY(-3px)';}}
                  onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.borderColor='var(--border)';(e.currentTarget as HTMLElement).style.transform='translateY(0)';}}>
                  <div style={{ aspectRatio:'16/9', overflow:'hidden', background:'#0a0a08' }}>
                    <img src={c.image} alt={c.title} style={{ width:'100%', height:'100%', objectFit:'cover', transition:'transform 0.4s ease' }} loading="lazy"
                      onMouseEnter={e=>(e.currentTarget.style.transform='scale(1.04)')} onMouseLeave={e=>(e.currentTarget.style.transform='scale(1)')} />
                  </div>
                  <div style={{ padding:'0.875rem' }}>
                    <p style={{ fontFamily:'Bricolage Grotesque', fontSize:'0.82rem', fontWeight:600, lineHeight:1.3, marginBottom:'4px' }}>{c.title}</p>
                    <p style={{ fontFamily:'DM Mono', fontSize:'0.65rem', color:'rgba(245,244,239,0.3)' }}>{c.issuer}</p>
                    <p style={{ fontFamily:'DM Mono', fontSize:'0.65rem', color:'var(--accent)', marginTop:'3px' }}>{c.date}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="reveal" style={{ fontFamily:'DM Mono', fontSize:'0.68rem', color:'rgba(245,244,239,0.2)', textAlign:'center', marginTop:'1.25rem', transitionDelay:'0.5s' }}>click to enlarge</p>
          </div>
        </div>
      </section>

      {/* ── FREELANCE ────────────────────── */}
      <section id="freelance" style={{ padding:'6rem 1.5rem', background:'var(--surface)', position:'relative', overflow:'hidden' }}>
        <div style={{ maxWidth:'1100px', margin:'0 auto', position:'relative' }}>
          <span className="ghost-num">06</span>
          <div className="section-inner">
            <div className="divider reveal" style={{ background:'linear-gradient(90deg, #34d399, transparent)' }} />
            <p className="reveal section-label" style={{ color:'#34d399', transitionDelay:'0.05s' }}>06 / freelance</p>
            <h2 className="reveal" style={{ fontFamily:'Bricolage Grotesque', fontSize:'clamp(2rem,5vw,3.5rem)', fontWeight:800, marginBottom:'1rem', transitionDelay:'0.1s' }}>Available for Hire</h2>
            <p className="reveal" style={{ color:'rgba(245,244,239,0.4)', marginBottom:'3rem', transitionDelay:'0.15s' }}>Open to freelance projects, consulting, and short-term AI/ML contracts.</p>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'1rem', marginBottom:'2rem' }}>
              {FREELANCE.map((f,i) => (
                <div key={f.title} className="reveal" style={{ background:'var(--bg)', border:'1px solid var(--border)', borderLeft:'2px solid #34d399', borderRadius:'8px', padding:'1.75rem', transitionDelay:`${i*0.1}s` }}>
                  <h3 style={{ fontFamily:'Bricolage Grotesque', fontWeight:700, fontSize:'1rem', marginBottom:'0.625rem' }}>{f.title}</h3>
                  <p style={{ fontSize:'0.82rem', color:'rgba(245,244,239,0.45)', lineHeight:1.65, marginBottom:'1.25rem' }}>{f.description}</p>
                  <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
                    {f.services.map(s => <div key={s} style={{ fontSize:'0.82rem', color:'rgba(245,244,239,0.52)', display:'flex', alignItems:'center', gap:'8px' }}><span style={{ color:'#34d399' }}>✓</span>{s}</div>)}
                  </div>
                </div>
              ))}
            </div>
            <div className="reveal" style={{ textAlign:'center', padding:'2.5rem', background:'rgba(203,240,74,0.04)', border:'1px solid rgba(203,240,74,0.1)', borderRadius:'12px', transitionDelay:'0.3s' }}>
              <p style={{ fontFamily:'Bricolage Grotesque', fontSize:'1.3rem', fontWeight:700, marginBottom:'0.5rem' }}>Got a project in mind?</p>
              <p style={{ color:'rgba(245,244,239,0.45)', marginBottom:'1.5rem', fontSize:'0.9rem' }}>Available part-time alongside studies. Typical turnaround 1–3 weeks.</p>
              <a href="mailto:soham.ai.engineer@gmail.com" className="btn-primary">
                <Mail size={15}/> soham.ai.engineer@gmail.com
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── CONTACT ──────────────────────── */}
      <section id="contact" style={{ padding:'6rem 1.5rem', position:'relative', overflow:'hidden' }}>
        <div style={{ maxWidth:'1100px', margin:'0 auto', position:'relative' }}>
          <span className="ghost-num">07</span>
          <div className="section-inner">
            <div className="divider reveal" />
            <p className="reveal section-label" style={{ transitionDelay:'0.05s' }}>07 / contact</p>
            <h2 className="reveal" style={{ fontFamily:'Bricolage Grotesque', fontSize:'clamp(2rem,5vw,3.5rem)', fontWeight:800, marginBottom:'3rem', transitionDelay:'0.1s' }}>Let's Connect</h2>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'3rem' }}>
              <div className="reveal" style={{ display:'flex', flexDirection:'column', gap:'0.75rem', transitionDelay:'0.15s' }}>
                {[{ icon:Mail, l:'Email', v:'soham.ai.engineer@gmail.com', href:'mailto:soham.ai.engineer@gmail.com' },{ icon:Github, l:'GitHub', v:'github.com/sohamjadhav95', href:'https://github.com/sohamjadhav95' },{ icon:Linkedin, l:'LinkedIn', v:'linkedin.com/in/sohamjadhav95', href:'https://linkedin.com/in/sohamjadhav95' },{ icon:Twitter, l:'Twitter', v:'@sohamjadhav_95', href:'https://x.com/sohamjadhav_95' }].map(({ icon:Icon, l, v, href }) => (
                  <a key={l} href={href} target="_blank" rel="noopener noreferrer" className="card" style={{ display:'flex', alignItems:'center', gap:'1rem', padding:'1.125rem 1.25rem', textDecoration:'none' }}>
                    <div style={{ background:'rgba(203,240,74,0.08)', border:'1px solid rgba(203,240,74,0.15)', borderRadius:'8px', padding:'8px', flexShrink:0 }}><Icon size={14} style={{ color:'var(--accent)' }}/></div>
                    <div>
                      <p style={{ fontFamily:'DM Mono', fontSize:'0.65rem', color:'rgba(245,244,239,0.28)' }}>{l}</p>
                      <p style={{ fontSize:'0.84rem', color:'rgba(245,244,239,0.65)', marginTop:'1px' }}>{v}</p>
                    </div>
                    <ArrowUpRight size={13} style={{ color:'rgba(203,240,74,0.25)', marginLeft:'auto' }}/>
                  </a>
                ))}
              </div>
              <div className="reveal card" style={{ padding:'1.75rem', transitionDelay:'0.2s' }}>
                <p style={{ fontFamily:'DM Mono', fontSize:'0.65rem', color:'rgba(245,244,239,0.22)', letterSpacing:'0.1em', marginBottom:'1.25rem' }}>// OPEN TO</p>
                {[['AI/ML Engineer','Full-time'],['Deep Learning Engineer','Full-time / Internship'],['Generative AI Engineer','Full-time / Internship'],['Research Internship','Remote / On-site'],['Freelance AI Projects','Part-time']].map(([role,type]) => (
                  <div key={role} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'0.625rem 0', borderBottom:'1px solid rgba(245,244,239,0.04)' }}>
                    <span style={{ fontFamily:'Bricolage Grotesque', fontSize:'0.88rem', fontWeight:600 }}>{role}</span>
                    <span className="pill pill-green" style={{ fontSize:'0.62rem' }}>{type}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────── */}
      <footer style={{ borderTop:'1px solid var(--border)', padding:'1.5rem', background:'var(--surface)' }}>
        <div style={{ maxWidth:'1100px', margin:'0 auto', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'1rem' }}>
          <span style={{ fontFamily:'DM Mono', fontSize:'0.72rem', color:'rgba(245,244,239,0.2)' }}>© 2025 Soham Jadhav — Built with React + Vite + Tailwind</span>
          <button onClick={() => navigate('/readme')} style={{ fontFamily:'DM Mono', fontSize:'0.72rem', color:'var(--accent)', display:'flex', alignItems:'center', gap:'6px', cursor:'pointer' }}>
            <FileText size={12}/> View GitHub README →
          </button>
        </div>
      </footer>

      {/* ── CERT MODAL ───────────────────── */}
      {certModal && (
        <div className="modal-backdrop" onClick={() => setCertModal(null)}>
          <div style={{ position:'relative', maxWidth:'760px', width:'100%' }} onClick={e => e.stopPropagation()}>
            <button onClick={() => setCertModal(null)} style={{ position:'absolute', top:'-2.25rem', right:0, color:'rgba(245,244,239,0.45)', cursor:'pointer', display:'flex' }}><X size={18}/></button>
            <div style={{ background:'var(--surface)', border:'1px solid rgba(203,240,74,0.15)', borderRadius:'10px', overflow:'hidden' }}>
              <img src={certModal.image} alt={certModal.title} style={{ width:'100%', display:'block' }}/>
              <div style={{ padding:'1rem 1.25rem', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'0.75rem' }}>
                <div>
                  <p style={{ fontFamily:'Bricolage Grotesque', fontWeight:700, fontSize:'0.95rem' }}>{certModal.title}</p>
                  <p style={{ fontFamily:'DM Mono', fontSize:'0.7rem', color:'rgba(245,244,239,0.35)', marginTop:'3px' }}>{certModal.issuer} · {certModal.date}</p>
                </div>
                {certModal.link && (
                  <a href={certModal.link} target="_blank" rel="noopener noreferrer" className="btn-primary" style={{ padding:'7px 16px', fontSize:'0.78rem', gap:'5px' }}>
                    <ExternalLink size={12}/> Verify
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
