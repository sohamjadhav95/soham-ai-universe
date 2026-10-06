import { useRef } from 'react';
import Header from '@/components/Header';
import Button from '@/components/Button';
import { FooterBottom } from '@/components/Footer';
import { SITE } from '@/data/site';
import { useEntrance, useTitle } from '@/lib/useEntrance';
import '@/styles/footer.css';

export default function NotFound() {
  const root = useRef<HTMLDivElement>(null);
  useTitle(`Page not found • ${SITE.name}`);
  useEntrance(root);

  return (
    <div className="page theme-dark" ref={root} style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header light />
      <section className="page-header container medium" style={{ flex: 1 }}>
        <h1 className="once-in">
          <span className="line">This page</span>
          <span className="line">doesn’t exist</span>
        </h1>
        <div className="once-in" style={{ marginTop: '3em' }}>
          <Button to="/">Back home</Button>
        </div>
      </section>
      <FooterBottom />
    </div>
  );
}
