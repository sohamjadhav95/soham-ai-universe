import { useIsMobile } from '@/lib/useIsMobile';
import Monitor from './Monitor';

export type ScreenCover = { venue: string; title: string; authors: string; href: string; cta?: string };

/** Ask the browser's PDF viewer (Chrome, Edge) for no toolbar and a page-width fit. */
const viewerUrl = (src: string) => (/\.pdf($|\?)/i.test(src) && !src.includes('#') ? `${src}#toolbar=0&navpanes=0&view=FitH` : src);

/**
 * A live page or PDF on a desktop monitor. Phones can't show a PDF inside a
 * page, so with a `cover` they get a page-1-style cover with a link instead.
 */
export default function DeviceIframe({ src, title, bg, cover }: { src: string; title: string; bg?: string; cover?: ScreenCover }) {
  const mobile = useIsMobile();
  return (
    <Monitor screenBg={bg}>
      {mobile && cover ? (
        <div className="monitor-cover">
          <p className="monitor-cover-venue">{cover.venue}</p>
          <h4 className="monitor-cover-title">{cover.title}</h4>
          <p className="monitor-cover-authors">{cover.authors}</p>
          <a className="monitor-cover-link" href={cover.href} target="_blank" rel="noopener noreferrer">
            {cover.cta ?? 'Read the paper'} ↗
          </a>
        </div>
      ) : (
        <iframe src={viewerUrl(src)} title={title} className="monitor-iframe" loading="lazy" />
      )}
    </Monitor>
  );
}
