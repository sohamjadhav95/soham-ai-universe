import { useEffect, useRef, useState, type ComponentType } from 'react';
import Header from '@/components/Header';
import Button from '@/components/Button';
import { FooterBottom } from '@/components/Footer';
import Bit from '@/components/buddy/Bit';
import Nimbus from '@/components/buddy/Nimbus';
import Pico from '@/components/buddy/Pico';
import { PixelFilters, pixelate } from '@/components/buddy/parts';
import { FEELINGS, type CharacterProps, type Feeling, type Gesture } from '@/components/buddy/types';
import { pointer } from '@/lib/pointer';
import { useEntrance, useTitle } from '@/lib/useEntrance';
import '@/styles/footer.css';
import '@/styles/buddy.css';
import '@/styles/lab.css';

const CHARACTERS: { name: string; text: string; C: ComponentType<CharacterProps> }[] = [
  {
    name: 'Bit',
    text: 'A chubby blue plush with a cream face, glossy eyes and mitten hands. The three bouncy pixels on its head shatter and snap back smooth: your sub-pixel story.',
    C: Bit,
  },
  {
    name: 'Nimbus',
    text: 'A soft floating cloud-bean with glowing cheeks and puff hands. Its antenna orb changes colour with its mood. Dreamy and gentle.',
    C: Nimbus,
  },
  {
    name: 'Pico',
    text: 'A tiny round robot with a peach shell and a glowing screen face that turns into hearts, ^ ^ and tears. Three-finger hands point precisely.',
    C: Pico,
  },
];

const GESTURES: { key: Gesture; label: string }[] = [
  { key: 'rest', label: 'Rest' },
  { key: 'wave', label: 'Wave' },
  { key: 'point', label: 'Point at cursor' },
  { key: 'cheer', label: 'Cheer' },
];

/** Eyes and pointing angle toward the cursor, measured from `ref`'s centre. */
function useAim(ref: React.RefObject<HTMLElement>) {
  const [aim, setAim] = useState({ look: { x: 0, y: 0 }, angle: 0 });
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const dx = pointer.x - (r.left + r.width / 2);
      const dy = pointer.y - (r.top + r.height / 2);
      const clamp = (v: number) => Math.max(-1, Math.min(1, v));
      setAim({
        look: { x: clamp(dx / (r.width * 0.9)), y: clamp(dy / (r.height * 0.9)) },
        angle: (Math.atan2(dy, dx) * 180) / Math.PI,
      });
    };
    const onMove = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('scroll', onMove, { passive: true });
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('scroll', onMove);
      cancelAnimationFrame(frame);
    };
  }, [ref]);
  return aim;
}

function Card({
  name,
  text,
  C,
  feeling,
  gesture,
  px,
  shimmer,
  bubble,
}: (typeof CHARACTERS)[number] & { feeling: Feeling; gesture: Gesture; px: number; shimmer: boolean; bubble: string | null }) {
  const stage = useRef<HTMLDivElement>(null);
  const { look, angle } = useAim(stage);
  const sleepyLook = feeling === 'sleepy' ? { x: 0, y: 0 } : look;
  return (
    <article className="lab-card once-in">
      <div className="lab-stage" ref={stage}>
        {bubble && (
          <div className="lab-bubble" role="status">
            {bubble}
            <a href="/work/convo-ease" onClick={e => e.preventDefault()}>
              See Convo-Ease →
            </a>
          </div>
        )}
        <div
          className={`lab-figure${shimmer ? ' is-shimmer' : ''}`}
          style={{ filter: px ? `url(#buddy-px-${px})` : undefined }}
        >
          <C feeling={feeling} gesture={gesture} point={angle} look={sleepyLook} />
        </div>
        <span className="lab-mini-label">Real size</span>
        <div className="lab-mini">
          <C feeling={feeling} gesture={gesture} point={angle} look={sleepyLook} />
        </div>
      </div>
      <h4>{name}</h4>
      <p>{text}</p>
    </article>
  );
}

export default function BuddyLab() {
  const root = useRef<HTMLDivElement>(null);
  const [feeling, setFeeling] = useState<Feeling>('idle');
  const [gesture, setGesture] = useState<Gesture>('rest');
  const [px, setPx] = useState(0);
  const [shimmer, setShimmer] = useState(false);
  const [bubble, setBubble] = useState<string | null>(null);
  const timer = useRef(0);
  useTitle('Buddy lab • Soham Jadhav');
  useEntrance(root);

  // Hidden test page: keep it out of search results.
  useEffect(() => {
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex, nofollow';
    document.head.appendChild(meta);
    return () => meta.remove();
  }, []);

  const sayHi = () => {
    window.clearTimeout(timer.current);
    const before = { feeling, gesture };
    setFeeling('talking');
    setGesture('wave');
    setBubble('Hey! Want to see the paper I helped with?');
    timer.current = window.setTimeout(() => {
      setBubble(null);
      setFeeling(before.feeling === 'talking' ? 'idle' : before.feeling);
      setGesture(before.gesture === 'wave' ? 'rest' : before.gesture);
    }, 3200);
  };

  const doPixelate = () => {
    setShimmer(false);
    pixelate(setPx, () => {
      setShimmer(true);
      window.setTimeout(() => setShimmer(false), 650);
    });
  };

  return (
    <div className="page" ref={root}>
      <PixelFilters />
      <Header />
      <section className="page-header container medium">
        <h1 className="once-in">Meet the buddies</h1>
        <p className="lab-intro once-in">
          Three original characters, made for this site. Move your mouse around, try every feeling and gesture, and
          pick the one that should live here. The small one in each corner is the real on-site size.
        </p>
      </section>

      <section className="lab-controls container medium once-in">
        <div className="group" role="group" aria-label="Feelings">
          <h5>Feeling</h5>
          {FEELINGS.map(f => (
            <Button key={f} active={feeling === f} onClick={() => setFeeling(f)}>
              {f[0].toUpperCase() + f.slice(1)}
            </Button>
          ))}
        </div>
        <div className="group" role="group" aria-label="Gestures">
          <h5>Hands</h5>
          {GESTURES.map(g => (
            <Button key={g.key} active={gesture === g.key} onClick={() => setGesture(g.key)}>
              {g.label}
            </Button>
          ))}
        </div>
        <div className="group" role="group" aria-label="Moves">
          <h5>Moves</h5>
          <Button onClick={sayHi}>Say hi</Button>
          <Button onClick={doPixelate}>Pixelate</Button>
        </div>
      </section>

      <section className="lab-grid container">
        {CHARACTERS.map(c => (
          <Card key={c.name} {...c} feeling={feeling} gesture={gesture} px={px} shimmer={shimmer} bubble={bubble} />
        ))}
      </section>
      <div className="page theme-dark">
        <FooterBottom />
      </div>
    </div>
  );
}
