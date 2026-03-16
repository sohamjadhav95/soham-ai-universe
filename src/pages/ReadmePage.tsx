import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Github, ExternalLink, Copy, Check } from 'lucide-react';

const RAW = 'https://raw.githubusercontent.com/sohamjadhav95/sohamjadhav95/main/README.md';
const API = 'https://api.github.com/markdown';

function basicMd(md: string) {
  return md
    .replace(/^### (.+)$/gm, '<h3>$1</h3>').replace(/^## (.+)$/gm, '<h2>$1</h2>').replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/`([^`\n]+)`/g, '<code>$1</code>')
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" style="max-width:100%"/>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
    .replace(/^[-*] (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>[\s\S]*?<\/li>\n?)+/g, m => `<ul>${m}</ul>`)
    .replace(/^(?!<[huli]).+$/gm, m => m.trim() ? `<p>${m}</p>` : '');
}

export default function ReadmePage() {
  const nav = useNavigate();
  const [html, setHtml] = useState('');
  const [raw, setRaw] = useState('');
  const [view, setView] = useState<'preview' | 'raw'>('preview');
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const md = await (await fetch(RAW)).text();
        setRaw(md);
        const r = await fetch(API, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/vnd.github.v3+json' }, body: JSON.stringify({ text: md, mode: 'gfm', context: 'sohamjadhav95/sohamjadhav95' }) });
        setHtml(r.ok ? await r.text() : basicMd(md));
      } catch { setHtml('<p>Could not load README.</p>'); }
      finally { setLoading(false); }
    })();
  }, []);

  const copy = () => { navigator.clipboard.writeText(raw); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  return (
    <div style={{ background: 'var(--white)', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ background: 'rgba(255,255,255,0.9)', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, zIndex: 50, backdropFilter: 'blur(16px)' }}>
        <div style={{ maxWidth: '960px', margin: '0 auto', padding: '0 2rem', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button onClick={() => nav('/')} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'DM Mono', fontSize: '0.75rem', color: 'var(--muted)', transition: 'color 0.2s', cursor: 'none', background: 'none', border: 'none' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--ink)')} onMouseLeave={e => (e.currentTarget.style.color = 'var(--muted)')}>
            <ArrowLeft size={14} /> Back to Portfolio
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ display: 'flex', background: 'var(--off)', border: '1px solid var(--border)', borderRadius: '100px', overflow: 'hidden', padding: '2px' }}>
              {(['preview', 'raw'] as const).map(v => (
                <button key={v} onClick={() => setView(v)} style={{ padding: '4px 14px', fontFamily: 'DM Mono', fontSize: '0.68rem', transition: 'all 0.2s', cursor: 'none', background: view === v ? 'var(--ink)' : 'transparent', color: view === v ? 'white' : 'var(--muted)', borderRadius: '100px', border: 'none' }}>
                  {v}
                </button>
              ))}
            </div>
            {view === 'raw' && (
              <button onClick={copy} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontFamily: 'DM Mono', fontSize: '0.7rem', color: 'var(--muted)', cursor: 'none', background: 'none', border: 'none', transition: 'color 0.2s' }} onMouseEnter={e => (e.currentTarget.style.color = 'var(--ink)')} onMouseLeave={e => (e.currentTarget.style.color = 'var(--muted)')}>
                {copied ? <><Check size={12} /> Copied</> : <><Copy size={12} /> Copy</>}
              </button>
            )}
            <a href="https://github.com/sohamjadhav95" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '5px', fontFamily: 'DM Mono', fontSize: '0.7rem', color: 'var(--muted)', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={e => (e.currentTarget.style.color = 'var(--ink)')} onMouseLeave={e => (e.currentTarget.style.color = 'var(--muted)')}>
              <Github size={12} /> GitHub <ExternalLink size={10} />
            </a>
          </div>
        </div>
      </div>

      {/* Breadcrumb */}
      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '1.25rem 2rem 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'DM Mono', fontSize: '0.7rem', color: 'var(--muted2)' }}>
          <span>sohamjadhav95</span><span>/</span>
          <span style={{ color: 'var(--ink)' }}>sohamjadhav95</span><span>/</span>
          <span style={{ color: 'var(--accent)' }}>README.md</span>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '2rem 2rem 6rem' }}>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', paddingTop: '2rem' }}>
            {[100, 70, 85, 55, 92, 68, 78].map((w, i) => (
              <div key={i} style={{ height: '16px', background: 'var(--off)', borderRadius: '4px', width: `${w}%`, animation: 'pulse 1.5s ease-in-out infinite', animationDelay: `${i * 0.1}s` }} />
            ))}
            <style>{`@keyframes pulse{0%,100%{opacity:.4}50%{opacity:.8}}`}</style>
          </div>
        ) : view === 'preview' ? (
          <div className="readme-prose" style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: '16px', padding: '2.5rem' }}
            dangerouslySetInnerHTML={{ __html: html }} />
        ) : (
          <div style={{ background: 'var(--off)', border: '1px solid var(--border)', borderRadius: '16px', padding: '1.75rem', position: 'relative' }}>
            <pre style={{ fontFamily: 'DM Mono', fontSize: '0.78rem', color: 'var(--muted)', lineHeight: 1.75, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{raw}</pre>
          </div>
        )}
      </div>
    </div>
  );
}
