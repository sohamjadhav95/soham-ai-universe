import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Github, Linkedin, Mail, Twitter, ExternalLink, X, Download, ArrowUpRight, BookOpen, GitBranch, ArrowRight } from 'lucide-react';
import ibmDeepLearningCert from '@/assets/ibm-deep-learning-cert.png';
import mlPythonCert from '@/assets/ml-python-cert.png';
import genAiLlmsCert from '@/assets/gen-ai-llms-cert.jpg';
import ibmAiEngineeringCert from '@/assets/ibm-ai-engineering-cert.jpg';
import gdgCoLeadCert from '@/assets/gdg-colead-cert.png';


/* ─── PARTICLE CANVAS ──────────────────────────────── */
interface Particle {
  // Current rendered position
  x: number;
  y: number;
  // Base orbit centre (stays fixed)
  cx: number;
  cy: number;
  // Orbital motion params
  rx: number;        // orbit x-radius
  ry: number;        // orbit y-radius
  phase: number;     // current angle in orbit (radians)
  speed: number;     // orbital speed (rad/frame)
  tiltAngle: number; // rotation of the orbit ellipse
  // Visual
  isDash: boolean;
  dashLen: number;
  dashAngle: number;  // visual angle of the dash (slow rotation)
  dashRotSpeed: number;
  radius: number;
  isBlue: boolean;
  baseAlpha: number;
  // Mouse repulsion state — smooth offset from orbit centre
  offX: number;
  offY: number;
}

function ParticleCanvas() {
  const canvasRef   = useRef<HTMLCanvasElement>(null);
  const ptRef       = useRef<Particle[]>([]);
  const mouseRef    = useRef({ x: -99999, y: -99999 });
  const rafRef      = useRef<number>(0);
  const scrollYRef  = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    /* ── constants ────────────────────────────────── */
    const INFLUENCE = 160;    // px — mouse influence radius
    const PUSH      = 0.018;  // how strongly mouse pushes (smooth, not violent)
    const SETTLE    = 0.06;   // how fast offset drifts back to 0
    const DAMP      = 0.88;   // damp the offset velocity

    let offVX: number[] = [];
    let offVY: number[] = [];

    /* ── build grid of particles ─────────────────── */
    const build = () => {
      canvas.width  = window.innerWidth;
      canvas.height = Math.max(document.body.scrollHeight, window.innerHeight);
      const W = canvas.width, H = canvas.height;
      ptRef.current = [];
      offVX = [];
      offVY = [];

      // Grid spacing — gives even distribution
      const spacing = 72;
      const cols = Math.ceil(W / spacing) + 1;
      const rows = Math.ceil(H / spacing) + 1;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          // Jitter within each cell so it doesn't look like a grid
          const cx = c * spacing + (Math.random() - 0.5) * spacing * 0.9;
          const cy = r * spacing + (Math.random() - 0.5) * spacing * 0.9;
          const isBlue  = Math.random() < 0.75;
          const isDash  = Math.random() < 0.75;

          ptRef.current.push({
            x: cx, y: cy, cx, cy,
            rx: Math.random() * 14 + 4,
            ry: Math.random() * 8  + 2,
            phase: Math.random() * Math.PI * 2,
            speed: (Math.random() * 0.008 + 0.004) * (Math.random() < 0.5 ? 1 : -1),
            tiltAngle: Math.random() * Math.PI,
            isDash,
            dashLen: Math.random() * 6 + 4,
            dashAngle: Math.random() * Math.PI,
            dashRotSpeed: (Math.random() - 0.5) * 0.004,
            radius: isDash ? 0 : Math.random() * 5 + 3,
            isBlue,
            baseAlpha: Math.random() * 1 + 0.5,
            offX: 0, offY: 0,
          });
          offVX.push(0);
          offVY.push(0);
        }
      }
    };

    /* ── draw one frame ───────────────────────────── */
    const draw = (t: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      for (let i = 0; i < ptRef.current.length; i++) {
        const p = ptRef.current[i];

        // Advance orbital phase
        p.phase += p.speed;

        // Orbital position (ellipse rotated by tiltAngle)
        const localX = Math.cos(p.phase) * p.rx;
        const localY = Math.sin(p.phase) * p.ry;
        const orbitX = p.cx + localX * Math.cos(p.tiltAngle) - localY * Math.sin(p.tiltAngle);
        const orbitY = p.cy + localX * Math.sin(p.tiltAngle) + localY * Math.cos(p.tiltAngle);

        // Mouse repulsion — smooth push on offset
        const dx = orbitX - mx;
        const dy = orbitY - my;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < INFLUENCE && dist > 1) {
          const strength = (1 - dist / INFLUENCE) * PUSH;
          offVX[i] += (dx / dist) * strength * 60;
          offVY[i] += (dy / dist) * strength * 60;
        }

        // Settle offset back to zero
        offVX[i] += -p.offX * SETTLE;
        offVY[i] += -p.offY * SETTLE;
        offVX[i] *= DAMP;
        offVY[i] *= DAMP;
        p.offX += offVX[i];
        p.offY += offVY[i];

        p.x = orbitX + p.offX;
        p.y = orbitY + p.offY;

        // Pulse alpha gently
        const pulseAlpha = p.baseAlpha + Math.sin(t * 0.0008 + p.phase * 3) * 0.06;
        // Boost alpha when being pushed
        const pushDist = Math.sqrt(p.offX * p.offX + p.offY * p.offY);
        const alpha = Math.min(pulseAlpha + pushDist * 0.008, 0.75);

        const blue  = `rgba(66,133,244,${alpha})`;
        const dark  = `rgba(20,20,18,${alpha * 0.55})`;
        const color = p.isBlue ? blue : dark;

        ctx.save();
        ctx.translate(p.x, p.y);

        if (p.isDash) {
          p.dashAngle += p.dashRotSpeed;
          ctx.rotate(p.dashAngle);
          ctx.strokeStyle = color;
          ctx.lineWidth   = p.isBlue ? 1.5 : 1.0;
          ctx.lineCap     = 'round';
          ctx.beginPath();
          ctx.moveTo(-p.dashLen, 0);
          ctx.lineTo( p.dashLen, 0);
          ctx.stroke();
        } else {
          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    build();
    rafRef.current = requestAnimationFrame(draw);

    const onMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY + window.scrollY };
    };
    const onLeave = () => {
      mouseRef.current = { x: -99999, y: -99999 };
    };
    const onResize = () => build();

    window.addEventListener('mousemove', onMove);
    document.addEventListener('mouseleave', onLeave);
    window.addEventListener('resize', onResize);
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseleave', onLeave);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed', top: 0, left: 0,
        width: '100%', height: '100%',
        pointerEvents: 'none', zIndex: 0,
      }}
    />
  );
}


/* ─── DATA ──────────────────────────────────────── */
const NAV = ['About','Projects','Research','OSS','Certs','Freelance','Contact'];

const MARQUEE_ITEMS = ['PyTorch','TensorFlow','HuggingFace','LangChain','OpenCV','Python','Gemma 3','BLIP-2','Whisper','RAG','LoRA','AutoML','XAI','NumPy','Pandas','Streamlit','GSoC 2026','Springer Nature'];

const STATS = [
  { end:2,   suf:'',  label:'Papers Published',   sub:'Springer · ICIA' },
  { end:6,   suf:'+', label:'Projects Shipped',    sub:'Production-ready' },
  { end:9,   suf:'',  label:'Certifications',      sub:'IBM · Microsoft · GDG' },
  { end:500, suf:'+', label:'LinkedIn Connections', sub:'Growing network' },
];

interface Metric { label:string; value:string }
interface Project {
  id:string; title:string; label:string; tagColor:string;
  year:string; badge?:string; badgeColor?:string;
  short:string; detail:string; tech:string[];
  github?:string; demo?:string; metrics?:Metric[];
}

const PROJECTS: Project[] = [
  { id:'copilot', title:'Copilot for Data Science', label:'AI Agent', tagColor:'tag-ink', year:'2025', badge:'Active', badgeColor:'tag-green',
    short:'Agentic AI that automates ~90% of data science workflows through natural language.',
    detail:'Converts natural language to executable queries and full analysis pipelines. Integrates XAI, AutoML, and RAG for adaptive, explainable decision-making across diverse data formats.',
    tech:['Python','AutoML','NLP','RAG','XAI'],
    github:'https://github.com/sohamjadhav95/Copilot-For-Data-Science' },
  { id:'deeplense', title:'ML4Sci DeepLense', label:'Deep Learning', tagColor:'tag-purple', year:'2026', badge:'GSoC 2026', badgeColor:'tag-blue',
    short:'Gravitational lens detection and cardiac segmentation for astrophysics pipelines.',
    detail:'ResNet18 multi-class classifier: ~92.5% val accuracy, macro AUC ~0.985. Binary lens finder at ~97% test accuracy. PREDICT1: U-Net CAC segmentation on Stanford COCA targeting Dice > 0.85.',
    tech:['PyTorch','ResNet18','U-Net','Colab'],
    github:'https://github.com/sohamjadhav95/ML4Sci-DeepLense-GSoC2026',
    metrics:[{label:'Val Accuracy',value:'92.5%'},{label:'Macro AUC',value:'0.985'},{label:'Binary Acc',value:'97%'}] },
  { id:'convoease', title:'Convo-Ease', label:'Multimodal AI', tagColor:'tag-blue', year:'2025', badge:'Published', badgeColor:'tag-green',
    short:'Real-time multimodal moderation with Gatekeeper Architecture and Policy-as-Prompt.',
    detail:'Pre-delivery validation across Text + Image + Audio in <3s. Gemma 3 27B + BLIP-2 + Whisper pipeline. 100K synthetic training samples for LLM fine-tuning.',
    tech:['Gemma 3','BLIP-2','Whisper','LangChain'],
    metrics:[{label:'Latency',value:'<3s'},{label:'Train Data',value:'100K'},{label:'Modalities',value:'3'}] },
  { id:'coverletter', title:'Gen-AI Cover Letter', label:'Generative AI', tagColor:'tag-amber', year:'2024',
    short:'TinyLlama (1.1B) fine-tuned via QLoRA for personalised cover letters from resume + JD.',
    detail:'Trained on resume–JD pairs with QLoRA. Semantic similarity + RAG aligns output to job requirements. Gradio web interface with cloud deployment support.',
    tech:['TinyLlama','QLoRA','HuggingFace','Gradio'],
    github:'https://github.com/sohamjadhav95/Cover-Letter-Tailoring-Gen-AI' },
  { id:'nexaos', title:'NexaOS Flow', label:'AI Automation', tagColor:'tag-rose', year:'2024',
    short:'Voice-activated OS controller executing system commands via natural language.',
    detail:'Speech Recognition + NLP intent parsing + TTS feedback + OS APIs. Context-aware command chains with multi-language support.',
    tech:['Python','NLP','Speech Recognition','TTS'],
    github:'https://github.com/sohamjadhav95/Neuro-Intelligence' },
  { id:'tennis', title:'Tennis Match Predictor', label:'Machine Learning', tagColor:'tag-ghost', year:'2024',
    short:'77% accurate ATP outcome predictor using Elo, form, and fatigue analysis.',
    detail:'XGBoost + LightGBM ensemble with dynamic Elo, surface preferences, and fatigue modelling. Live Streamlit demo.',
    tech:['XGBoost','LightGBM','Python'],
    github:'https://github.com/sohamjadhav95/AI-Powered-Tennis-Match-Outcome-Predictor',
    demo:'https://ai-powered-tennis-match-outcome-predict.streamlit.app/',
    metrics:[{label:'Accuracy',value:'77%'}] },
];

const PAPERS = [
  { title:'Convo-Ease: Intelligent Multi-Modal Moderation for Digital Organizational Communication',
    venue:'Cureus — Springer Nature', year:'2025', type:'Conference Paper',
    authors:'Soham S. Jadhav, Nisha D. Patil, Omkar N. Gadakh, Atharv S. Gaikwad',
    abstract:'Gatekeeper Architecture for pre-delivery content validation across Text + Image + Audio with Policy-as-Prompt. Sub-3s latency using Gemma 3, BLIP-2, and Whisper.',
    keywords:['Multimodal AI','LLMs','Gatekeeper','Policy-as-Prompt','Enterprise Security'],
    link:'https://coursera.org/verify/specialization/4PDD1WMUR5ZD' },
  { title:'Beyond Text: A Comprehensive Survey of Multimodal Content Moderation Architectures in Enterprise Environments',
    venue:'ICIA Conference Proceedings', year:'2025', type:'Survey Paper',
    authors:'Soham S. Jadhav, Omkar N. Gadakh, Nisha D. Patil, Atharv S. Gaikwad',
    abstract:'Survey of 26+ moderation methodologies — from LLM guardrails to multimodal fusion. Maps the shift to dynamic Policy-as-Prompt and identifies gaps in latency and on-premise privacy.',
    keywords:['Survey','Content Moderation','Audio-Visual Fusion','Enterprise AI'] },
];

const OSS = [
  { org:'ML4Sci — DeepLense', role:'GSoC 2026 Applicant', status:'Active', tag:'tag-blue',
    description:'Three-proposal strategy — DEEPLENSE6, DEEPLENSE7, and PREDICT1 — for astrophysics AI pipelines.',
    contributions:['ResNet18 classifier ~92.5% val acc, AUC 0.985','Binary lens finder via WeightedRandomSampler ~97%','U-Net CAC segmentation on Stanford COCA (Dice > 0.85)'],
    repo:'https://github.com/sohamjadhav95/ML4Sci-DeepLense-GSoC2026', tech:['PyTorch','ResNet18','U-Net'] },
  { org:'pgmpy', role:'Open Source Contributor', status:'In Progress', tag:'tag-green',
    description:'Improving doctest coverage across the probabilistic graphical models library under issue #2832.',
    contributions:['Identifying and fixing failing doctests','Following contribution patterns from issue #2832'],
    repo:'https://github.com/pgmpy/pgmpy', tech:['Python','Bayesian Networks'] },
];

const FREELANCE = [
  { title:'AI/ML Development', desc:'End-to-end AI apps — model training, API integration, deployment.', services:['Custom ML Models','LLM Integration','RAG Pipelines','AI APIs'] },
  { title:'Data Science Consulting', desc:'Analytics, predictive modelling, and dashboard development.', services:['EDA & Visualization','Predictive Analytics','AutoML','Reporting'] },
  { title:'Generative AI Engineering', desc:'Fine-tuning LLMs, building RAG systems, deploying GenAI apps.', services:['LLM Fine-tuning','RAG Systems','Prompt Engineering','Deployment'] },
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

/* ─── COUNT-UP HOOK ─────────────────────────────── */
function useCountUp(end:number, started:boolean, dur=1600) {
  const [v,setV] = useState(0);
  useEffect(()=>{
    if(!started) return;
    const t0=Date.now();
    const tick=()=>{
      const p=Math.min((Date.now()-t0)/dur,1);
      const e=1-Math.pow(1-p,4);
      setV(Math.round(e*end));
      if(p<1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  },[started,end,dur]);
  return v;
}

function StatBox({end,suf,label,sub,delay}:{end:number;suf:string;label:string;sub:string;delay:number}) {
  const [started,setStarted]=useState(false);
  const ref=useRef<HTMLDivElement>(null);
  const val=useCountUp(end,started);
  useEffect(()=>{
    const io=new IntersectionObserver(([e])=>{if(e.isIntersecting){setStarted(true);io.disconnect();}},{threshold:0.5});
    if(ref.current) io.observe(ref.current);
    return ()=>io.disconnect();
  },[]);
  return (
    <div ref={ref} className="reveal" style={{transitionDelay:`${delay}s`, textAlign:'center', padding:'2rem 1.5rem', background:'white', border:'1px solid var(--border)', borderRadius:'16px'}}>
      <div className="stat-num">{val}{suf}</div>
      <div style={{fontWeight:700, marginTop:'6px', fontSize:'0.9rem', color:'var(--ink)'}}>{label}</div>
      <div style={{fontFamily:'DM Mono', fontSize:'0.68rem', color:'var(--muted2)', marginTop:'3px'}}>{sub}</div>
    </div>
  );
}

/* ─── MAGNETIC BUTTON HOOK ──────────────────────── */
function useMagnetic(strength=0.35) {
  const ref = useRef<HTMLElement>(null);
  const onMove = useCallback((e:MouseEvent) => {
    const el = ref.current; if(!el) return;
    const r = el.getBoundingClientRect();
    const x = e.clientX - (r.left + r.width/2);
    const y = e.clientY - (r.top + r.height/2);
    el.style.transform = `translate(${x*strength}px, ${y*strength}px)`;
  },[strength]);
  const onLeave = useCallback(() => {
    if(ref.current) ref.current.style.transform = 'translate(0,0)';
  },[]);
  useEffect(()=>{
    const el = ref.current; if(!el) return;
    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseleave', onLeave);
    return ()=>{ el.removeEventListener('mousemove',onMove); el.removeEventListener('mouseleave',onLeave); };
  },[onMove,onLeave]);
  return ref;
}

/* ─── TILT CARD HOOK ────────────────────────────── */
function useTilt() {
  const ref = useRef<HTMLDivElement>(null);
  const onMove = useCallback((e:MouseEvent) => {
    const el = ref.current; if(!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `perspective(800px) rotateY(${x*10}deg) rotateX(${-y*10}deg) translateZ(4px)`;
  },[]);
  const onLeave = useCallback(() => {
    if(ref.current) ref.current.style.transform = 'perspective(800px) rotateY(0deg) rotateX(0deg) translateZ(0)';
  },[]);
  useEffect(()=>{
    const el = ref.current; if(!el) return;
    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseleave', onLeave);
    return ()=>{ el.removeEventListener('mousemove',onMove); el.removeEventListener('mouseleave',onLeave); };
  },[onMove,onLeave]);
  return ref;
}

/* ─── COMPONENT ─────────────────────────────────── */
export default function Index() {
  const navigate = useNavigate();
  const [active, setActive] = useState('');
  const [expanded, setExpanded] = useState<string|null>(null);
  const [certModal, setCertModal] = useState<typeof CERTS[0]|null>(null);
  const cursorDot  = useRef<HTMLDivElement>(null);
  const cursorRing = useRef<HTMLDivElement>(null);
  const btn1 = useMagnetic(0.3) as React.RefObject<HTMLButtonElement>;
  const btn2 = useMagnetic(0.3) as React.RefObject<HTMLAnchorElement>;

  /* Custom cursor */
  useEffect(()=>{
    const move=(e:MouseEvent)=>{
      if(cursorDot.current)  { cursorDot.current.style.left=e.clientX+'px';  cursorDot.current.style.top=e.clientY+'px'; }
      if(cursorRing.current) { cursorRing.current.style.left=e.clientX+'px'; cursorRing.current.style.top=e.clientY+'px'; }
    };
    const down=()=>document.body.classList.add('clicking');
    const up=()=>document.body.classList.remove('clicking');
    document.addEventListener('mousemove',move);
    document.addEventListener('mousedown',down);
    document.addEventListener('mouseup',up);

    const links = document.querySelectorAll('a,button,[data-hover]');
    links.forEach(l=>{ l.addEventListener('mouseenter',()=>document.body.classList.add('hovering')); l.addEventListener('mouseleave',()=>document.body.classList.remove('hovering')); });
    return ()=>{ document.removeEventListener('mousemove',move); document.removeEventListener('mousedown',down); document.removeEventListener('mouseup',up); };
  },[]);

  /* Scroll reveals + active section */
  useEffect(()=>{
    const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting)e.target.classList.add('in');}),{threshold:0.07});
    document.querySelectorAll('.reveal,.reveal-left,.reveal-scale').forEach(el=>io.observe(el));
    const sio=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting)setActive(e.target.id);}),{threshold:0.3});
    [...NAV,'home'].forEach(n=>{const el=document.getElementById(n.toLowerCase());if(el)sio.observe(el);});
    return ()=>{io.disconnect();sio.disconnect();};
  },[]);

  const go=(id:string)=>document.getElementById(id.toLowerCase())?.scrollIntoView({behavior:'smooth'});

  /* Parallax on mouse for hero */
  const heroRef = useRef<HTMLDivElement>(null);
  useEffect(()=>{
    const move=(e:MouseEvent)=>{
      const hero=heroRef.current; if(!hero) return;
      const x=(e.clientX/window.innerWidth-0.5)*20;
      const y=(e.clientY/window.innerHeight-0.5)*20;
      hero.querySelectorAll<HTMLElement>('[data-depth]').forEach(el=>{
        const d=parseFloat(el.dataset.depth||'1');
        el.style.transform=`translate(${x*d}px,${y*d}px)`;
      });
    };
    window.addEventListener('mousemove',move);
    return ()=>window.removeEventListener('mousemove',move);
  },[]);

  return (
    <div style={{background:'var(--white)',minHeight:'100vh',position:'relative'}}>
      <ParticleCanvas />
      <div style={{position:'relative',zIndex:1}}>
      {/* Custom cursor */}
      <div id="cursor-dot" ref={cursorDot} />
      <div id="cursor-ring" ref={cursorRing} />

      {/* ── NAV ──────────────────────────────────────── */}
      <nav className="nav">
        <div className="nav-inner">
          <a href="#home" className="nav-logo" onClick={e=>{e.preventDefault();go('home');}}>
            Soham<span>.</span>
          </a>
          <div className="nav-links" style={{display:'flex',gap:'1.75rem'}}>
            {NAV.map(n=>(
              <button key={n} onClick={()=>go(n)}
                className={`nav-link ${active===n.toLowerCase()||active===n.replace('OSS','opensource')?'active':''}`}
                style={{background:'none',border:'none',cursor:'none',padding:0}}>
                {n.toLowerCase().replace('oss','oss')}
              </button>
            ))}
          </div>
          <div className="nav-actions">
            <a href="https://drive.google.com/file/d/1MuONHQJkPSyDbuyUYkUHtK257MDDGGQs/view?usp=sharing" target="_blank" rel="noopener noreferrer" className="btn btn-dark" style={{padding:'7px 16px',fontSize:'0.75rem',gap:'5px'}}>
              <Download size={12}/> Resume
            </a>
          </div>
        </div>
      </nav>

      {/* ── HERO ─────────────────────────────────────── */}
      <section id="home" ref={heroRef} style={{minHeight:'100vh',display:'flex',alignItems:'center',paddingTop:'56px',position:'relative',zIndex:1,overflow:'visible',background:'transparent'}}>
        {/* Large decorative floating rings */}
        <div data-depth="0.08" className="float-a" style={{position:'absolute',top:'10%',right:'8%',width:'380px',height:'380px',borderRadius:'50%',border:'1px solid rgba(13,13,11,0.06)',pointerEvents:'none',transition:'transform 0.8s ease'}}/>
        <div data-depth="0.05" className="float-b" style={{position:'absolute',top:'18%',right:'12%',width:'260px',height:'260px',borderRadius:'50%',border:'1px solid rgba(0,87,255,0.08)',pointerEvents:'none',transition:'transform 0.8s ease'}}/>
        <div data-depth="0.12" className="float-c" style={{position:'absolute',bottom:'15%',left:'5%',width:'180px',height:'180px',borderRadius:'50%',border:'1px solid rgba(13,13,11,0.05)',pointerEvents:'none',transition:'transform 0.8s ease'}}/>
        <div data-depth="0.03" style={{position:'absolute',top:'50%',right:'3%',width:'500px',height:'500px',background:'radial-gradient(circle, rgba(0,87,255,0.04), transparent 70%)',pointerEvents:'none',transform:'translateY(-50%)',transition:'transform 0.8s ease'}}/>

        <div style={{maxWidth:'1180px',margin:'0 auto',padding:'0 2rem',width:'100%',paddingTop:'3rem',paddingBottom:'3rem'}}>
          <div style={{maxWidth:'780px'}}>
            <div className="section-label reveal" style={{marginBottom:'2rem'}}>
              Final Year AI Engineer · Nashik, India
            </div>

            <h1 style={{fontFamily:'Cabinet Grotesk',fontSize:'clamp(3.5rem,9vw,8rem)',fontWeight:900,lineHeight:0.98,letterSpacing:'-0.04em',marginBottom:'2rem'}}>
              {[{text:'Building',delay:0},{text:'AI',delay:0.1},{text:'that',delay:0.18}].map(w=>(
                <span key={w.text} className="hero-word" style={{display:'inline-block',marginRight:'0.22em',overflow:'hidden'}}>
                  <span className="hero-word-inner" style={{animationDelay:`${w.delay}s`}}>{w.text}</span>
                </span>
              ))}
              <br/>
              <span className="hero-word serif" style={{display:'inline-block',overflow:'hidden',color:'var(--accent)'}}>
                <span className="hero-word-inner" style={{animationDelay:'0.28s'}}>actually works.</span>
              </span>
            </h1>

            <p className="reveal" style={{color:'var(--muted)',fontSize:'1.1rem',lineHeight:1.65,maxWidth:'500px',marginBottom:'2.5rem',transitionDelay:'0.4s'}}>
              Deep learning, generative AI, and agentic systems. Published researcher, GSoC 2026 applicant, open source contributor.
            </p>

            <div className="reveal" style={{display:'flex',gap:'0.75rem',flexWrap:'wrap',marginBottom:'2.5rem',transitionDelay:'0.5s'}}>
              <span className="tag tag-ink">PyTorch</span>
              <span className="tag tag-blue">GSoC 2026</span>
              <span className="tag tag-green">2× Published</span>
              <span className="tag tag-purple">Generative AI</span>
            </div>

            <div className="reveal" style={{display:'flex',gap:'1rem',flexWrap:'wrap',marginBottom:'3.5rem',transitionDelay:'0.6s'}}>
              <button ref={btn1} onClick={()=>go('projects')} className="btn btn-dark magnetic" style={{cursor:'none'}}>
                View Work <ArrowRight size={15}/>
              </button>
              <a ref={btn2} href="mailto:soham.ai.engineer@gmail.com" className="btn btn-outline magnetic">
                Contact Me
              </a>
            </div>

            <div className="reveal" style={{display:'flex',gap:'1rem',transitionDelay:'0.7s'}}>
              {[{I:Github,u:'https://github.com/sohamjadhav95'},{I:Linkedin,u:'https://linkedin.com/in/sohamjadhav95'},{I:Twitter,u:'https://x.com/sohamjadhav_95'}].map(({I,u})=>(
                <a key={u} href={u} target="_blank" rel="noopener noreferrer"
                  style={{width:'40px',height:'40px',display:'flex',alignItems:'center',justifyContent:'center',border:'1px solid var(--border)',borderRadius:'50%',color:'var(--muted)',transition:'all 0.25s ease',textDecoration:'none'}}
                  onMouseEnter={e=>{(e.currentTarget as HTMLAnchorElement).style.borderColor='var(--ink)';(e.currentTarget as HTMLAnchorElement).style.color='var(--ink)';(e.currentTarget as HTMLAnchorElement).style.transform='translateY(-3px)';}}
                  onMouseLeave={e=>{(e.currentTarget as HTMLAnchorElement).style.borderColor='var(--border)';(e.currentTarget as HTMLAnchorElement).style.color='var(--muted)';(e.currentTarget as HTMLAnchorElement).style.transform='translateY(0)';}}>
                  <I size={16}/>
                </a>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'1rem',marginTop:'5rem'}}>
            {STATS.map((s,i)=><StatBox key={s.label} {...s} delay={0.1+i*0.08}/>)}
          </div>
        </div>
      </section>

      {/* ── MARQUEE ───────────────────────────────────── */}
      <div className="marquee-track" style={{borderTop:'1px solid var(--border)',borderBottom:'1px solid var(--border)',background:'rgba(247,246,243,0.9)',padding:'14px 0',overflow:'hidden',position:'relative',zIndex:1}}>
        <div className="marquee-inner">
          {[...MARQUEE_ITEMS,...MARQUEE_ITEMS].map((t,i)=>(
            <span key={i} style={{fontFamily:'DM Mono',fontSize:'0.75rem',color:'var(--muted2)',letterSpacing:'0.1em',whiteSpace:'nowrap',display:'flex',alignItems:'center',gap:'2rem'}}>
              {t} <span style={{color:'var(--muted2)',opacity:0.4}}>·</span>
            </span>
          ))}
        </div>
      </div>

      {/* ── ABOUT ────────────────────────────────────── */}
      <section id="about" style={{padding:'7rem 2rem',background:'rgba(255,255,255,0.82)',position:'relative',zIndex:1}}>
        <div style={{maxWidth:'1180px',margin:'0 auto'}}>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'5rem',alignItems:'start'}}>
            <div>
              <div className="section-label reveal" style={{marginBottom:'1.5rem'}}>01 / About</div>
              <h2 className="reveal" style={{fontSize:'clamp(2.2rem,5vw,3.8rem)',marginBottom:'2rem',transitionDelay:'0.08s'}}>
                Who I Am
              </h2>
              <p className="reveal" style={{color:'var(--muted)',lineHeight:1.8,marginBottom:'1.25rem',transitionDelay:'0.14s'}}>
                Final-year B.E. in AI & Data Science at MET's Institute of Engineering, Nashik. I design and ship intelligent systems — from gravitational lens classifiers to multimodal content moderation frameworks.
              </p>
              <p className="reveal" style={{color:'var(--muted)',lineHeight:1.8,marginBottom:'2rem',transitionDelay:'0.18s'}}>
                Two peer-reviewed papers published with Springer Nature and the ICIA conference. AI-ML Co-Lead at Google Developer Groups. GSoC 2026 applicant with ML4Sci. Open source contributor.
              </p>
              <div className="reveal" style={{background:'var(--off)',borderRadius:'10px',padding:'1.25rem 1.5rem',fontFamily:'DM Mono',fontSize:'0.8rem',lineHeight:1.8,transitionDelay:'0.22s'}}>
                <span style={{color:'var(--muted2)'}}>const </span>
                <span style={{color:'var(--accent)'}}>mission</span>
                <span style={{color:'var(--muted2)'}}> = </span>
                <span style={{color:'var(--ink)'}}>"Ship AI that actually works."</span>
              </div>
            </div>
            <div>
              <div style={{display:'flex',flexDirection:'column',gap:'0',border:'1px solid var(--border)',borderRadius:'16px',overflow:'hidden'}}>
                {[['Degree','B.E. Artificial Intelligence & Data Science'],['College',"MET's Institute of Engineering, Nashik"],['Period','Oct 2022 – Jul 2026'],['Location','Nashik, Maharashtra, India'],['Status','Open to Work'],['Email','soham.ai.engineer@gmail.com']].map(([l,v],i)=>(
                  <div key={l} className="reveal" style={{display:'flex',padding:'0.875rem 1.5rem',borderBottom:i<5?'1px solid var(--border)':'',transitionDelay:`${0.08+i*0.06}s`}}>
                    <span style={{fontFamily:'DM Mono',fontSize:'0.7rem',color:'var(--muted2)',minWidth:'80px',flexShrink:0,paddingTop:'2px'}}>{l}</span>
                    <span style={{fontSize:'0.9rem',color:l==='Status'?'#059669':l==='Email'?'var(--accent)':'var(--ink)',fontWeight:l==='Status'?600:400}}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Tech Stack */}
          <div style={{marginTop:'4rem'}}>
            <div className="line reveal" style={{marginBottom:'2rem'}}/>
            <p className="reveal" style={{fontFamily:'DM Mono',fontSize:'0.68rem',color:'var(--muted2)',letterSpacing:'0.12em',marginBottom:'1.5rem',transitionDelay:'0.05s'}}>TECH STACK</p>
            <div className="reveal" style={{display:'flex',flexWrap:'wrap',gap:'0.5rem',transitionDelay:'0.1s'}}>
              {['PyTorch','TensorFlow','HuggingFace','scikit-learn','OpenCV','LangChain','Python','TypeScript','C++','SQL','LLMs','RAG','Fine-tuning','LoRA/QLoRA','Gemma 3','BLIP-2','Whisper','NumPy','Pandas','AutoML','XAI','Streamlit','Gradio','Git','Colab'].map(t=>(
                <span key={t} className="tag tag-ghost" style={{transition:'all 0.2s ease'}}
                  onMouseEnter={e=>{(e.currentTarget as HTMLSpanElement).style.background='var(--ink)';(e.currentTarget as HTMLSpanElement).style.color='white';(e.currentTarget as HTMLSpanElement).style.borderColor='var(--ink)';}}
                  onMouseLeave={e=>{(e.currentTarget as HTMLSpanElement).style.background='var(--off)';(e.currentTarget as HTMLSpanElement).style.color='var(--muted)';(e.currentTarget as HTMLSpanElement).style.borderColor='var(--border)';}}>
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── PROJECTS ─────────────────────────────────── */}
      <section id="projects" style={{padding:'7rem 2rem',background:'rgba(247,246,243,0.82)',position:'relative',zIndex:1}}>
        <div style={{maxWidth:'1180px',margin:'0 auto'}}>
          <div className="section-label reveal" style={{marginBottom:'1.5rem'}}>02 / Projects</div>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-end',marginBottom:'3.5rem'}}>
            <h2 className="reveal" style={{fontSize:'clamp(2.2rem,5vw,3.8rem)',transitionDelay:'0.08s'}}>What I've Built</h2>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'1.25rem'}}>
            {PROJECTS.map((p,i)=>{
              const tiltRef = useTilt();
              return (
                <div key={p.id} ref={tiltRef} className="card reveal card-tilt" style={{padding:'1.75rem',cursor:'pointer',transitionDelay:`${i*0.07}s`,background:'white'}}
                  onClick={()=>setExpanded(expanded===p.id?null:p.id)}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'1rem'}}>
                    <div style={{display:'flex',gap:'0.4rem',flexWrap:'wrap'}}>
                      <span className={`tag ${p.tagColor}`}>{p.label}</span>
                      {p.badge&&<span className={`tag ${p.badgeColor||'tag-ghost'}`}>{p.badge}</span>}
                    </div>
                    <span style={{fontFamily:'DM Mono',fontSize:'0.65rem',color:'var(--muted2)'}}>{p.year}</span>
                  </div>
                  <h3 style={{fontSize:'1.05rem',fontWeight:800,marginBottom:'0.625rem',letterSpacing:'-0.02em',lineHeight:1.25}}>{p.title}</h3>
                  <p style={{fontSize:'0.84rem',color:'var(--muted)',lineHeight:1.65,marginBottom:'1.25rem'}}>{p.short}</p>

                  {expanded===p.id&&(
                    <div style={{borderTop:'1px solid var(--border)',paddingTop:'1.25rem',marginBottom:'1.25rem'}}>
                      <p style={{fontSize:'0.84rem',color:'var(--muted)',lineHeight:1.7,marginBottom:'1rem'}}>{p.detail}</p>
                      {p.metrics&&(
                        <div style={{display:'flex',gap:'0.75rem',flexWrap:'wrap',marginBottom:'1rem'}}>
                          {p.metrics.map(m=>(
                            <div key={m.label} style={{textAlign:'center',padding:'8px 14px',background:'var(--off)',border:'1px solid var(--border)',borderRadius:'10px'}}>
                              <div style={{fontFamily:'Cabinet Grotesk',fontSize:'1.2rem',fontWeight:900,color:'var(--ink)'}}>{m.value}</div>
                              <div style={{fontFamily:'DM Mono',fontSize:'0.62rem',color:'var(--muted2)',marginTop:'2px'}}>{m.label}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  <div style={{display:'flex',flexWrap:'wrap',gap:'0.4rem',marginBottom:'1.25rem'}}>
                    {p.tech.map(t=><span key={t} className="tag tag-ghost" style={{fontSize:'0.62rem'}}>{t}</span>)}
                  </div>
                  <div style={{display:'flex',gap:'1rem',alignItems:'center'}}>
                    {p.github&&<a href={p.github} target="_blank" rel="noopener noreferrer" onClick={e=>e.stopPropagation()} className="hover-ul" style={{fontFamily:'DM Mono',fontSize:'0.72rem',color:'var(--muted)',display:'flex',alignItems:'center',gap:'4px',textDecoration:'none'}}><Github size={12}/> repo</a>}
                    {p.demo&&<a href={p.demo} target="_blank" rel="noopener noreferrer" onClick={e=>e.stopPropagation()} className="hover-ul" style={{fontFamily:'DM Mono',fontSize:'0.72rem',color:'var(--muted)',display:'flex',alignItems:'center',gap:'4px',textDecoration:'none'}}><ExternalLink size={12}/> demo</a>}
                    <button onClick={e=>{e.stopPropagation();setExpanded(expanded===p.id?null:p.id);}} style={{marginLeft:'auto',fontFamily:'DM Mono',fontSize:'0.68rem',color:'var(--accent)',cursor:'none',background:'none',border:'none'}}>
                      {expanded===p.id?'↑ collapse':'↓ expand'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── RESEARCH ─────────────────────────────────── */}
      <section id="research" style={{padding:'7rem 2rem',background:'rgba(255,255,255,0.82)',position:'relative',zIndex:1}}>
        <div style={{maxWidth:'1180px',margin:'0 auto'}}>
          <div className="section-label reveal" style={{marginBottom:'1.5rem',color:'var(--muted2)'}}>03 / Research</div>
          <h2 className="reveal" style={{fontSize:'clamp(2.2rem,5vw,3.8rem)',marginBottom:'3.5rem',transitionDelay:'0.08s'}}>Publications</h2>
          <div style={{display:'flex',flexDirection:'column',gap:'1.5rem'}}>
            {PAPERS.map((p,i)=>(
              <div key={p.title} className="reveal paper-card" style={{background:'var(--white)',border:'1px solid var(--border)',borderRadius:'16px',padding:'2.25rem',transitionDelay:`${i*0.12}s`}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'1rem',flexWrap:'wrap',gap:'0.75rem'}}>
                  <div style={{display:'flex',gap:'0.5rem',flexWrap:'wrap'}}>
                    <span className="tag tag-blue">{p.type}</span>
                    <span className="tag tag-ghost">{p.year}</span>
                  </div>
                  {p.link&&<a href={p.link} target="_blank" rel="noopener noreferrer" style={{fontFamily:'DM Mono',fontSize:'0.72rem',color:'var(--accent)',display:'flex',alignItems:'center',gap:'4px',textDecoration:'none'}}><ExternalLink size={11}/> verify</a>}
                </div>
                <h3 style={{fontSize:'1.1rem',fontWeight:800,marginBottom:'0.5rem',lineHeight:1.3,letterSpacing:'-0.02em'}}>{p.title}</h3>
                <p style={{fontFamily:'DM Mono',fontSize:'0.72rem',color:'var(--accent)',marginBottom:'0.5rem',display:'flex',alignItems:'center',gap:'5px'}}><BookOpen size={11}/>{p.venue}</p>
                <p style={{fontFamily:'DM Mono',fontSize:'0.68rem',color:'var(--muted2)',marginBottom:'1.25rem'}}>{p.authors}</p>
                <p style={{fontSize:'0.875rem',color:'var(--muted)',lineHeight:1.7,marginBottom:'1.25rem'}}>{p.abstract}</p>
                <div style={{display:'flex',flexWrap:'wrap',gap:'0.4rem'}}>
                  {p.keywords.map(k=><span key={k} className="tag tag-ghost" style={{fontSize:'0.62rem'}}>{k}</span>)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── OPEN SOURCE ──────────────────────────────── */}
      <section id="oss" style={{padding:'7rem 2rem',background:'rgba(247,246,243,0.82)',position:'relative',zIndex:1}}>
        <div style={{maxWidth:'1180px',margin:'0 auto'}}>
          <div className="section-label reveal" style={{marginBottom:'1.5rem'}}>04 / Open Source</div>
          <h2 className="reveal" style={{fontSize:'clamp(2.2rem,5vw,3.8rem)',marginBottom:'3.5rem',transitionDelay:'0.08s'}}>Contributions</h2>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1.5rem'}}>
            {OSS.map((o,i)=>(
              <div key={o.org} className="reveal oss-card" style={{background:'var(--white)',border:'1px solid var(--border)',borderRadius:'16px',padding:'2rem',transitionDelay:`${i*0.12}s`}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'0.875rem'}}>
                  <div>
                    <h3 style={{fontSize:'1.1rem',fontWeight:800,letterSpacing:'-0.02em'}}>{o.org}</h3>
                    <p style={{fontFamily:'DM Mono',fontSize:'0.7rem',color:'var(--muted2)',marginTop:'3px'}}>{o.role}</p>
                  </div>
                  <span className={`tag ${o.tag}`}>{o.status}</span>
                </div>
                <p style={{fontSize:'0.875rem',color:'var(--muted)',lineHeight:1.65,marginBottom:'1.25rem'}}>{o.description}</p>
                <ul style={{listStyle:'none',marginBottom:'1.25rem',display:'flex',flexDirection:'column',gap:'6px'}}>
                  {o.contributions.map(c=>(
                    <li key={c} style={{fontSize:'0.84rem',color:'var(--muted)',display:'flex',gap:'8px',alignItems:'flex-start'}}>
                      <span style={{color:'#059669',flexShrink:0,marginTop:'2px'}}>→</span>{c}
                    </li>
                  ))}
                </ul>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                  <div style={{display:'flex',gap:'0.4rem',flexWrap:'wrap'}}>
                    {o.tech.map(t=><span key={t} className="tag tag-green" style={{fontSize:'0.62rem'}}>{t}</span>)}
                  </div>
                  <a href={o.repo} target="_blank" rel="noopener noreferrer" className="hover-ul" style={{fontFamily:'DM Mono',fontSize:'0.72rem',color:'var(--muted)',display:'flex',alignItems:'center',gap:'4px',textDecoration:'none',marginLeft:'0.75rem',flexShrink:0}}><GitBranch size={12}/> repo</a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CERTIFICATIONS ───────────────────────────── */}
      <section id="certs" style={{padding:'7rem 2rem',background:'rgba(255,255,255,0.82)',position:'relative',zIndex:1}}>
        <div style={{maxWidth:'1180px',margin:'0 auto'}}>
          <div className="section-label reveal" style={{marginBottom:'1.5rem'}}>05 / Certifications</div>
          <h2 className="reveal" style={{fontSize:'clamp(2.2rem,5vw,3.8rem)',marginBottom:'3.5rem',transitionDelay:'0.08s'}}>Credentials</h2>
          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'1rem'}}>
            {CERTS.map((c,i)=>(
              <div key={c.title} className="reveal reveal-scale" style={{background:'var(--white)',border:'1px solid var(--border)',borderRadius:'12px',overflow:'hidden',cursor:'pointer',transitionDelay:`${i*0.05}s`,transition:'all 0.3s cubic-bezier(.16,1,.3,1)'}}
                onClick={()=>setCertModal(c)}
                onMouseEnter={e=>{(e.currentTarget as HTMLDivElement).style.transform='translateY(-4px)';(e.currentTarget as HTMLDivElement).style.boxShadow='var(--shadow-md)';(e.currentTarget as HTMLDivElement).style.borderColor='rgba(13,13,11,0.15)';}}
                onMouseLeave={e=>{(e.currentTarget as HTMLDivElement).style.transform='translateY(0)';(e.currentTarget as HTMLDivElement).style.boxShadow='none';(e.currentTarget as HTMLDivElement).style.borderColor='var(--border)';}}>
                <div style={{aspectRatio:'16/9',overflow:'hidden',background:'var(--off)'}}>
                  <img src={c.image} alt={c.title} style={{width:'100%',height:'100%',objectFit:'cover',transition:'transform 0.5s ease'}} loading="lazy"
                    onMouseEnter={e=>(e.currentTarget.style.transform='scale(1.06)')} onMouseLeave={e=>(e.currentTarget.style.transform='scale(1)')}/>
                </div>
                <div style={{padding:'0.875rem'}}>
                  <p style={{fontFamily:'Cabinet Grotesk',fontSize:'0.82rem',fontWeight:700,lineHeight:1.3,marginBottom:'4px',color:'var(--ink)'}}>{c.title}</p>
                  <p style={{fontFamily:'DM Mono',fontSize:'0.65rem',color:'var(--muted2)'}}>{c.issuer}</p>
                  <p style={{fontFamily:'DM Mono',fontSize:'0.65rem',color:'var(--accent)',marginTop:'3px'}}>{c.date}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="reveal" style={{fontFamily:'DM Mono',fontSize:'0.68rem',color:'var(--muted2)',textAlign:'center',marginTop:'1.5rem',transitionDelay:'0.5s'}}>click to enlarge</p>
        </div>
      </section>

      {/* ── FREELANCE ────────────────────────────────── */}
      <section id="freelance" style={{padding:'7rem 2rem',background:'rgba(247,246,243,0.82)',position:'relative',zIndex:1}}>
        <div style={{maxWidth:'1180px',margin:'0 auto'}}>
          <div className="section-label reveal" style={{marginBottom:'1.5rem'}}>06 / Freelance</div>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-end',marginBottom:'3.5rem',flexWrap:'wrap',gap:'1rem'}}>
            <h2 className="reveal" style={{fontSize:'clamp(2.2rem,5vw,3.8rem)',transitionDelay:'0.08s'}}>Available for Hire</h2>
            <p className="reveal" style={{color:'var(--muted)',maxWidth:'320px',fontSize:'0.9rem',lineHeight:1.6,transitionDelay:'0.14s'}}>
              Open to part-time freelance contracts alongside studies. Typical turnaround 1–3 weeks.
            </p>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'1.25rem',marginBottom:'2.5rem'}}>
            {FREELANCE.map((f,i)=>(
              <div key={f.title} className="reveal fl-card" style={{background:'var(--white)',border:'1px solid var(--border)',borderRadius:'16px',padding:'2rem',transitionDelay:`${i*0.1}s`}}>
                <h3 style={{fontSize:'1.05rem',fontWeight:800,marginBottom:'0.75rem',letterSpacing:'-0.02em'}}>{f.title}</h3>
                <p style={{fontSize:'0.875rem',color:'var(--muted)',lineHeight:1.65,marginBottom:'1.5rem'}}>{f.desc}</p>
                <div style={{display:'flex',flexDirection:'column',gap:'7px'}}>
                  {f.services.map(s=>(
                    <div key={s} style={{display:'flex',alignItems:'center',gap:'8px',fontSize:'0.875rem',color:'var(--muted)'}}>
                      <span style={{color:'#d97706',fontSize:'0.75rem'}}>✓</span>{s}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="reveal" style={{textAlign:'center',padding:'3rem',background:'var(--white)',border:'1px solid var(--border)',borderRadius:'20px',transitionDelay:'0.3s'}}>
            <h3 style={{fontSize:'1.75rem',fontWeight:900,marginBottom:'0.75rem',letterSpacing:'-0.03em'}}>Got a project in mind?</h3>
            <p style={{color:'var(--muted)',marginBottom:'2rem'}}>Let's talk about what you need.</p>
            <a href="mailto:soham.ai.engineer@gmail.com" className="btn btn-accent">
              <Mail size={15}/> soham.ai.engineer@gmail.com
            </a>
          </div>
        </div>
      </section>

      {/* ── CONTACT ──────────────────────────────────── */}
      <section id="contact" style={{padding:'7rem 2rem',background:'rgba(255,255,255,0.82)',position:'relative',zIndex:1}}>
        <div style={{maxWidth:'1180px',margin:'0 auto'}}>
          <div className="section-label reveal" style={{marginBottom:'1.5rem'}}>07 / Contact</div>
          <h2 className="reveal" style={{fontSize:'clamp(2.2rem,5vw,3.8rem)',marginBottom:'3.5rem',transitionDelay:'0.08s'}}>Let's Connect</h2>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'3rem'}}>
            <div style={{display:'flex',flexDirection:'column',gap:'0.875rem'}}>
              {[{icon:Mail,l:'Email',v:'soham.ai.engineer@gmail.com',href:'mailto:soham.ai.engineer@gmail.com'},{icon:Github,l:'GitHub',v:'github.com/sohamjadhav95',href:'https://github.com/sohamjadhav95'},{icon:Linkedin,l:'LinkedIn',v:'linkedin.com/in/sohamjadhav95',href:'https://linkedin.com/in/sohamjadhav95'},{icon:Twitter,l:'Twitter',v:'@sohamjadhav_95',href:'https://x.com/sohamjadhav_95'}].map(({icon:Icon,l,v,href},i)=>(
                <a key={l} href={href} target="_blank" rel="noopener noreferrer" className="reveal card" style={{display:'flex',alignItems:'center',gap:'1rem',padding:'1.25rem 1.5rem',textDecoration:'none',transitionDelay:`${i*0.07}s`}}>
                  <div style={{width:'40px',height:'40px',background:'var(--off)',borderRadius:'10px',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                    <Icon size={16} style={{color:'var(--ink)'}}/>
                  </div>
                  <div>
                    <p style={{fontFamily:'DM Mono',fontSize:'0.68rem',color:'var(--muted2)'}}>{l}</p>
                    <p style={{fontSize:'0.9rem',color:'var(--ink)',marginTop:'1px'}}>{v}</p>
                  </div>
                  <ArrowUpRight size={14} style={{color:'var(--muted2)',marginLeft:'auto'}}/>
                </a>
              ))}
            </div>
            <div className="reveal card" style={{padding:'2rem',transitionDelay:'0.2s'}}>
              <p style={{fontFamily:'DM Mono',fontSize:'0.68rem',color:'var(--muted2)',letterSpacing:'0.1em',marginBottom:'1.5rem'}}>OPEN TO</p>
              {[['AI/ML Engineer','Full-time'],['Deep Learning Engineer','Full-time / Internship'],['Generative AI Engineer','Full-time / Internship'],['Research Internship','Remote / On-site'],['Freelance AI Projects','Part-time']].map(([role,type])=>(
                <div key={role} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'0.75rem 0',borderBottom:'1px solid var(--border)'}}>
                  <span style={{fontWeight:700,fontSize:'0.9rem'}}>{role}</span>
                  <span className="tag tag-green" style={{fontSize:'0.62rem'}}>{type}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────── */}
      <footer style={{borderTop:'1px solid var(--border)',padding:'1.75rem 2rem',background:'rgba(247,246,243,0.92)',position:'relative',zIndex:1}}>
        <div style={{maxWidth:'1180px',margin:'0 auto',display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:'1rem'}}>
          <span style={{fontFamily:'DM Mono',fontSize:'0.72rem',color:'var(--muted2)'}}>© 2025 Soham Jadhav — Built with React + Vite + Tailwind</span>
        </div>
      </footer>

      </div>
      {/* ── CERT MODAL ───────────────────────────────── */}
      {certModal&&(
        <div className="modal-overlay" onClick={()=>setCertModal(null)}>
          <div className="modal-content" style={{position:'relative',maxWidth:'780px',width:'100%'}} onClick={e=>e.stopPropagation()}>
            <button onClick={()=>setCertModal(null)} style={{position:'absolute',top:'-2.5rem',right:0,color:'var(--muted)',cursor:'none',display:'flex',alignItems:'center',background:'none',border:'none'}}>
              <X size={20}/>
            </button>
            <div style={{background:'var(--white)',border:'1px solid var(--border)',borderRadius:'16px',overflow:'hidden',boxShadow:'var(--shadow-lg)'}}>
              <img src={certModal.image} alt={certModal.title} style={{width:'100%',display:'block'}}/>
              <div style={{padding:'1.25rem 1.5rem',display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:'0.875rem'}}>
                <div>
                  <p style={{fontWeight:800,fontSize:'0.95rem',letterSpacing:'-0.02em'}}>{certModal.title}</p>
                  <p style={{fontFamily:'DM Mono',fontSize:'0.7rem',color:'var(--muted2)',marginTop:'3px'}}>{certModal.issuer} · {certModal.date}</p>
                </div>
                {certModal.link&&(
                  <a href={certModal.link} target="_blank" rel="noopener noreferrer" className="btn btn-accent" style={{padding:'8px 18px',fontSize:'0.8rem',gap:'5px'}}>
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
