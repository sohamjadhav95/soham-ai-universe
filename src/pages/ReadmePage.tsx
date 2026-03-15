import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Github, ExternalLink, Copy, Check } from 'lucide-react';

const README_URL = 'https://raw.githubusercontent.com/sohamjadhav95/sohamjadhav95/main/README.md';
const GITHUB_MARKDOWN_API = 'https://api.github.com/markdown';

export default function ReadmePage() {
  const navigate = useNavigate();
  const [html, setHtml] = useState('');
  const [raw, setRaw] = useState('');
  const [view, setView] = useState<'preview'|'raw'>('preview');
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const mdRes = await fetch(README_URL);
        const md = await mdRes.text();
        setRaw(md);
        const htmlRes = await fetch(GITHUB_MARKDOWN_API, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/vnd.github.v3+json' },
          body: JSON.stringify({ text: md, mode: 'gfm', context: 'sohamjadhav95/sohamjadhav95' }),
        });
        if (htmlRes.ok) {
          setHtml(await htmlRes.text());
        } else {
          // Fallback: basic markdown rendering
          setHtml(basicMdToHtml(md));
        }
      } catch {
        setHtml('<p style="color:rgba(245,244,239,0.4)">Could not load README. Check your connection.</p>');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const copy = () => {
    navigator.clipboard.writeText(raw);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ background:'var(--bg)', minHeight:'100vh' }}>
      {/* Header */}
      <div style={{ background:'rgba(15,15,13,0.92)', borderBottom:'1px solid var(--border)', position:'sticky', top:0, zIndex:50, backdropFilter:'blur(16px)' }}>
        <div style={{ maxWidth:'900px', margin:'0 auto', padding:'0 1.5rem', height:'52px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <button onClick={() => navigate('/')} style={{ display:'flex', alignItems:'center', gap:'8px', fontFamily:'DM Mono', fontSize:'0.75rem', color:'rgba(245,244,239,0.5)', transition:'color 0.2s', cursor:'pointer' }}
            onMouseEnter={e=>(e.currentTarget.style.color='var(--text)')} onMouseLeave={e=>(e.currentTarget.style.color='rgba(245,244,239,0.5)')}>
            <ArrowLeft size={14}/> Back to Portfolio
          </button>
          <div style={{ display:'flex', alignItems:'center', gap:'1rem' }}>
            <div style={{ display:'flex', background:'var(--surface2, #1e1e1a)', border:'1px solid var(--border)', borderRadius:'6px', overflow:'hidden' }}>
              {(['preview','raw'] as const).map(v => (
                <button key={v} onClick={() => setView(v)} style={{ padding:'5px 14px', fontFamily:'DM Mono', fontSize:'0.7rem', transition:'all 0.2s', cursor:'pointer', background: view===v ? 'var(--accent)' : 'transparent', color: view===v ? 'var(--bg)' : 'rgba(245,244,239,0.4)' }}>
                  {v}
                </button>
              ))}
            </div>
            {view==='raw' && (
              <button onClick={copy} style={{ display:'flex', alignItems:'center', gap:'5px', fontFamily:'DM Mono', fontSize:'0.7rem', color:'rgba(245,244,239,0.4)', cursor:'pointer', transition:'color 0.2s' }}
                onMouseEnter={e=>(e.currentTarget.style.color='var(--accent)')} onMouseLeave={e=>(e.currentTarget.style.color='rgba(245,244,239,0.4)')}>
                {copied ? <><Check size={12}/> Copied!</> : <><Copy size={12}/> Copy</>}
              </button>
            )}
            <a href="https://github.com/sohamjadhav95" target="_blank" rel="noopener noreferrer" style={{ display:'flex', alignItems:'center', gap:'5px', fontFamily:'DM Mono', fontSize:'0.7rem', color:'rgba(245,244,239,0.4)', textDecoration:'none', transition:'color 0.2s' }}
              onMouseEnter={e=>(e.currentTarget.style.color='var(--accent)')} onMouseLeave={e=>(e.currentTarget.style.color='rgba(245,244,239,0.4)')}>
              <Github size={12}/> View on GitHub <ExternalLink size={10}/>
            </a>
          </div>
        </div>
      </div>

      {/* Breadcrumb */}
      <div style={{ maxWidth:'900px', margin:'0 auto', padding:'1.25rem 1.5rem 0' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', fontFamily:'DM Mono', fontSize:'0.7rem', color:'rgba(245,244,239,0.28)' }}>
          <span>sohamjadhav95</span><span>/</span>
          <span style={{ color:'var(--text)' }}>sohamjadhav95</span><span>/</span>
          <span style={{ color:'var(--accent)' }}>README.md</span>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth:'900px', margin:'0 auto', padding:'2rem 1.5rem 5rem' }}>
        {loading ? (
          <div style={{ display:'flex', flexDirection:'column', gap:'1rem', paddingTop:'2rem' }}>
            {[100,75,88,60,95,70].map((w,i) => (
              <div key={i} style={{ height:'16px', background:'var(--surface)', borderRadius:'4px', width:`${w}%`, animation:'pulse 1.5s ease-in-out infinite', animationDelay:`${i*0.1}s`, opacity:0.5 }}/>
            ))}
            <style>{`@keyframes pulse { 0%,100%{opacity:.3} 50%{opacity:.6} }`}</style>
          </div>
        ) : view === 'preview' ? (
          <div className="readme-prose" style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'10px', padding:'2.5rem' }}
            dangerouslySetInnerHTML={{ __html: html }} />
        ) : (
          <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'10px', padding:'1.5rem', position:'relative' }}>
            <pre style={{ fontFamily:'DM Mono', fontSize:'0.78rem', color:'rgba(245,244,239,0.6)', lineHeight:1.7, whiteSpace:'pre-wrap', wordBreak:'break-word', overflowX:'auto' }}>
              {raw}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}

/* Basic fallback markdown → HTML (used if GitHub API rate-limits) */
function basicMdToHtml(md: string): string {
  return md
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/```[\s\S]*?```/gm, m => `<pre><code>${m.slice(m.indexOf('\n')+1, m.lastIndexOf('\n'))}</code></pre>`)
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1"/>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>\n?)+/g, m => `<ul>${m}</ul>`)
    .replace(/^(?!<[hup]).+$/gm, m => m.trim() ? `<p>${m}</p>` : '')
    .replace(/\n{3,}/g, '\n');
}
