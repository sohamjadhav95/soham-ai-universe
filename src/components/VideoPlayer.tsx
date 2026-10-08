import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import { prefersReducedMotion } from '@/lib/motion';
import '@/styles/video.css';

type Props = {
  src: string; // MP4 (H.264)
  webm?: string; // optional WebM fallback for browsers without H.264
  poster?: string;
  title: string;
  /** Show the sound toggle (only for videos with narration or music). */
  sound?: boolean;
  /** Show the speedup toggle (top right). */
  speedup?: boolean;
  /** Crop letterboxing bars from the video */
  crop?: boolean;
  /** Show a full-screen button (bottom right); sound turns on in full screen. */
  fullscreen?: boolean;
};

type FullscreenDoc = Document & { webkitFullscreenElement?: Element | null; webkitExitFullscreen?: () => void };
type FullscreenEl = HTMLDivElement & { webkitRequestFullscreen?: () => void };
type IOSVideo = HTMLVideoElement & { webkitEnterFullscreen?: () => void };

const fullscreenElement = () => document.fullscreenElement ?? (document as FullscreenDoc).webkitFullscreenElement ?? null;

function SoundIcon({ muted }: { muted: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 9.5h3.2L12 5.5v13l-4.8-4H4z" fill="currentColor" />
      {muted ? (
        <path d="m16 9.5 5 5m0-5-5 5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      ) : (
        <>
          <path d="M15.5 9.2a4 4 0 0 1 0 5.6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
          <path d="M18.2 6.6a7.6 7.6 0 0 1 0 10.8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        </>
      )}
    </svg>
  );
}

function FullscreenIcon({ on }: { on: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d={on ? 'M9 4.5V9H4.5M15 4.5V9h4.5M9 19.5V15H4.5M15 19.5V15h4.5' : 'M4.5 9V4.5H9M19.5 9V4.5H15M4.5 15v4.5H9M19.5 15v4.5H15'}
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Clean video frame: plays muted while on screen, tap anywhere to play or
 * pause, a sound toggle bottom-right (plus an optional full-screen button),
 * and a hairline progress bar along the bottom edge that can be clicked or
 * dragged to seek.
 */
export default function VideoPlayer({ src, webm, poster, title, sound = false, speedup = false, crop = false, fullscreen = false }: Props) {
  const frame = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const fill = useRef<HTMLSpanElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const userPaused = useRef(false);
  const resumeAfterSeek = useRef(false);
  const [muted, setMuted] = useState(true);
  const [paused, setPaused] = useState(true);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [seeking, setSeeking] = useState(false);
  const [isFull, setIsFull] = useState(false);

  // Autoplay only while visible, unless the viewer paused it themselves.
  useEffect(() => {
    const el = video.current;
    if (!el || prefersReducedMotion()) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !userPaused.current) el.play().catch(() => {});
        else if (!entry.isIntersecting) el.pause();
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Smooth progress: read the playhead every frame instead of on timeupdate.
  useEffect(() => {
    let raf = 0;
    let pct = -1;
    const tick = () => {
      const el = video.current;
      if (el && fill.current && el.duration) {
        const at = el.currentTime / el.duration;
        fill.current.style.transform = `scaleX(${at})`;
        if (Math.round(at * 100) !== pct) {
          pct = Math.round(at * 100);
          bar.current?.setAttribute('aria-valuenow', String(pct));
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Track full screen (Esc or the browser's own controls can leave it too).
  useEffect(() => {
    if (!fullscreen) return;
    const onChange = () => setIsFull(!!frame.current && fullscreenElement() === frame.current);
    document.addEventListener('fullscreenchange', onChange);
    document.addEventListener('webkitfullscreenchange', onChange);
    return () => {
      document.removeEventListener('fullscreenchange', onChange);
      document.removeEventListener('webkitfullscreenchange', onChange);
    };
  }, [fullscreen]);

  const toggle = () => {
    const el = video.current;
    if (!el) return;
    if (el.paused) {
      userPaused.current = false;
      el.play().catch(() => {});
    } else {
      userPaused.current = true;
      el.pause();
    }
  };

  const toggleSound = () => {
    const el = video.current;
    if (!el) return;
    el.muted = !el.muted;
    setMuted(el.muted);
    if (!el.muted && el.paused) {
      userPaused.current = false;
      el.play().catch(() => {});
    }
  };

  const toggleSpeed = () => {
    const el = video.current;
    if (!el) return;
    const nextRate = el.playbackRate === 1 ? 2 : 1;
    el.playbackRate = nextRate;
    setPlaybackRate(nextRate);
  };

  const toggleFullscreen = () => {
    const el = video.current;
    const box = frame.current as FullscreenEl | null;
    if (!el || !box) return;
    const doc = document as FullscreenDoc;
    if (fullscreenElement()) {
      if (document.exitFullscreen) document.exitFullscreen().catch(() => {});
      else doc.webkitExitFullscreen?.();
      return;
    }
    // Ask for full screen first, while the click still counts as a user gesture.
    const ios = el as IOSVideo;
    if (box.requestFullscreen) box.requestFullscreen().catch(() => ios.webkitEnterFullscreen?.());
    else if (box.webkitRequestFullscreen) box.webkitRequestFullscreen();
    else ios.webkitEnterFullscreen?.(); // iPhone: the system player
    // Full screen means watching properly: sound on, and playing.
    el.muted = false;
    setMuted(false);
    userPaused.current = false;
    el.play().catch(() => {});
  };

  const seekTo = (clientX: number) => {
    const el = video.current;
    if (!el || !el.duration || !bar.current) return;
    const r = bar.current.getBoundingClientRect();
    el.currentTime = Math.min(Math.max((clientX - r.left) / r.width, 0), 1) * el.duration;
  };

  // Hold the video still while scrubbing, then carry on playing.
  const onSeekDown = (e: PointerEvent<HTMLDivElement>) => {
    const el = video.current;
    if (!el || (e.pointerType === 'mouse' && e.button !== 0)) return;
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    resumeAfterSeek.current = !el.paused;
    el.pause();
    setSeeking(true);
    seekTo(e.clientX);
  };
  const onSeekMove = (e: PointerEvent<HTMLDivElement>) => {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) seekTo(e.clientX);
  };
  const onSeekEnd = () => {
    setSeeking(false);
    if (resumeAfterSeek.current) video.current?.play().catch(() => {});
    resumeAfterSeek.current = false;
  };
  const onSeekKey = (e: KeyboardEvent<HTMLElement>) => {
    const el = video.current;
    if (!el) return;
    if (e.key === 'ArrowRight') el.currentTime = Math.min(el.currentTime + 5, el.duration || 0);
    else if (e.key === 'ArrowLeft') el.currentTime = Math.max(el.currentTime - 5, 0);
    else return;
    e.preventDefault();
  };

  return (
    <div className={`video-frame${paused ? ' is-paused' : ''}${seeking ? ' is-seeking' : ''}${isFull ? ' is-full' : ''}`} ref={frame}>
      <video
        ref={video}
        className={crop ? 'crop-bars' : undefined}
        poster={poster}
        muted
        loop
        playsInline
        preload="metadata"
        onPlay={() => setPaused(false)}
        onPause={() => setPaused(true)}
        aria-hidden="true"
      >
        <source src={src} type="video/mp4" />
        {webm && <source src={webm} type="video/webm" />}
      </video>

      <button className="video-surface" onClick={toggle} onKeyDown={onSeekKey} aria-label={`${paused ? 'Play' : 'Pause'} video: ${title}`} />

      {(sound || fullscreen) && (
        <div className="video-buttons">
          {sound && (
            <button
              className="video-btn video-sound"
              onClick={toggleSound}
              aria-label={muted ? 'Turn sound on' : 'Mute'}
              aria-pressed={!muted}
            >
              <SoundIcon muted={muted} />
            </button>
          )}
          {fullscreen && (
            <button
              className="video-btn video-fullscreen"
              onClick={toggleFullscreen}
              aria-label={isFull ? 'Exit full screen' : 'Full screen with sound'}
            >
              <FullscreenIcon on={isFull} />
            </button>
          )}
        </div>
      )}

      {speedup && (
        <button
          className="video-speed"
          onClick={toggleSpeed}
          aria-label="Toggle speed"
        >
          {playbackRate}x
        </button>
      )}

      <div
        ref={bar}
        className="video-progress"
        role="slider"
        tabIndex={0}
        aria-label="Seek"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={0}
        onPointerDown={onSeekDown}
        onPointerMove={onSeekMove}
        onLostPointerCapture={onSeekEnd}
        onKeyDown={onSeekKey}
      >
        <span className="video-progress-track">
          <span className="video-progress-fill" ref={fill} />
        </span>
      </div>
    </div>
  );
}
