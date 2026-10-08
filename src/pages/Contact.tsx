import { useRef, useState, type FormEvent } from 'react';
import Header from '@/components/Header';
import Button from '@/components/Button';
import SplitWords from '@/components/SplitWords';
import { FooterBottom } from '@/components/Footer';
import { ArrowIcon } from '@/components/Icons';
import { SITE } from '@/data/site';
import { LINES } from '@/data/buddy';
import { buddy } from '@/lib/buddy';
import { useEntrance, useTitle } from '@/lib/useEntrance';
import '@/styles/footer.css';
import '@/styles/contact.css';

const FIELDS = [
  { name: 'name', label: 'What’s your name?', placeholder: 'Your name *', required: true, type: 'text', autoComplete: 'name' },
  { name: 'email', label: 'What’s your email?', placeholder: 'you@example.com *', required: true, type: 'email', autoComplete: 'email' },
  { name: 'organization', label: 'Where do you work or study?', placeholder: 'Company, lab or university', required: false, type: 'text', autoComplete: 'organization' },
  { name: 'services', label: 'What can I help with?', placeholder: 'Research, ML engineering, a collaboration …', required: false, type: 'text', autoComplete: 'off' },
  { name: 'message', label: 'Your message', placeholder: 'Hello Soham, I’d like to talk about … *', required: true, type: 'textarea', autoComplete: 'off' },
] as const;

type Status = 'idle' | 'sending' | 'sent' | 'error';

export default function Contact() {
  const root = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<Status>('idle');
  const [errors, setErrors] = useState<Record<string, string>>({});
  useTitle(`Contact • ${SITE.name}`);
  useEntrance(root);

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form)) as Record<string, string>;

    const next: Record<string, string> = {};
    if (!data.name?.trim()) next.name = 'Please add your name';
    if (!/^\S+@\S+\.\S+$/.test(data.email ?? '')) next.email = 'Please add a valid email';
    if (!data.message?.trim()) next.message = 'Please write a message';
    setErrors(next);
    if (Object.keys(next).length) {
      form.querySelector<HTMLElement>(`[name="${Object.keys(next)[0]}"]`)?.focus();
      return;
    }

    setStatus('sending');
    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          access_key: SITE.web3formsKey,
          subject: `New message from ${data.name} (portfolio)`,
          from_name: 'Portfolio contact form',
          ...data,
        }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      setStatus('sent');
      form.reset();
      buddy.feel('proud', 3000);
      buddy.say(LINES.sent, { ms: 4000 });
    } catch {
      setStatus('error');
      buddy.feel('sad', 3000);
      buddy.say(LINES.error, { ms: 4000 });
    }
  };

  return (
    <div className="page theme-dark contact-page" ref={root}>
      <Header light />
      <section className="page-header contact-head container medium">
        <div className="row">
          <div className="title">
            <SplitWords as="h1" trigger="reveal" text="Let’s build something together" />
          </div>
          <div className="side once-in">
            <div className="avatar">
              <img src={SITE.photos.avatar} alt={SITE.name} />
            </div>
            <ArrowIcon className="arrow" rotate={90} />
          </div>
        </div>
      </section>

      <section className="contact-body container medium">
        <div className="row">
          <form className="contact-form once-in" onSubmit={submit} noValidate>
            {FIELDS.map((f, i) => {
              const id = `field-${f.name}`;
              const common = {
                id,
                name: f.name,
                placeholder: f.placeholder,
                required: f.required,
                autoComplete: f.autoComplete,
                'aria-invalid': !!errors[f.name],
                'aria-describedby': errors[f.name] ? `${id}-error` : undefined,
              };
              return (
                <div className="form-field" key={f.name}>
                  <h5>{String(i + 1).padStart(2, '0')}</h5>
                  <label htmlFor={id}>{f.label}</label>
                  {f.type === 'textarea' ? <textarea rows={5} {...common} /> : <input type={f.type} {...common} />}
                  {errors[f.name] && (
                    <span className="error" id={`${id}-error`}>
                      {errors[f.name]}
                    </span>
                  )}
                </div>
              );
            })}
            <input type="checkbox" name="botcheck" className="form-honeypot" tabIndex={-1} autoComplete="off" aria-hidden="true" />
            <div className="form-submit">
              <Button variant="round" blue type="submit" disabled={status === 'sending'} strength={70}>
                {status === 'sending' ? 'Sending…' : 'Send message'}
              </Button>
            </div>
            <div aria-live="polite">
              {status === 'sent' && (
                <p className="form-status">Thank you! Your message is on its way. I’ll get back to you soon.</p>
              )}
              {status === 'error' && (
                <p className="form-status is-error">
                  Sorry, that didn’t send. Please email me directly at <a href={`mailto:${SITE.email}`}>{SITE.email}</a>.
                </p>
              )}
            </div>
          </form>

          <aside className="side once-in">
            <h5>Contact details</h5>
            <ul>
              <li>
                <a className="link-line" href={`mailto:${SITE.email}`}>
                  {SITE.email}
                </a>
              </li>
              <li>
                <a className="link-line" href={SITE.phoneHref}>
                  {SITE.phone}
                </a>
              </li>
            </ul>
            <h5>Based in</h5>
            <p>{SITE.location.city}</p>
            <h5>Résumé</h5>
            <ul>
              <li>
                <a className="link-line" href={SITE.resume} target="_blank" rel="noopener noreferrer">
                  View résumé
                </a>
              </li>
            </ul>
            <h5>Socials</h5>
            <ul>
              {SITE.socials.map(s => (
                <li key={s.href}>
                  <a className="link-line" href={s.href} target="_blank" rel="noopener noreferrer">
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </section>
      <FooterBottom />
    </div>
  );
}
