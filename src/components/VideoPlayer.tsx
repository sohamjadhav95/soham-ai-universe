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
};

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

/**
 * Clean video frame: plays muted while on screen, tap anywhere to play or
 * pause, a sound toggle bottom-right, and a hairline progress bar along the
 * bottom edge that can be clicked or dragged to seek.
 */
export default function VideoPlayer({ src, webm, poster, title, sound = false, speedup = false, crop = false }: Props) {
  const video = useRef<HTMLVideoElement>(null);
  const fill = useRef<HTMLSpanElement>(null);
  const userPaused = useRef(false);
  const [muted, setMuted] = useState(true);
  const [paused, setPaused] = useState(true);
  const [playbackRate, setPlaybackRate] = useState(1);

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
    let frame = 0;
    const tick = () => {
      const el = video.current;
      if (el && fill.current && el.duration) fill.current.style.transform = `scaleX(${el.currentTime / el.duration})`;
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

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

  const seekTo = (clientX: number, bar: HTMLElement) => {
    const el = video.current;
    if (!el || !el.duration) return;
    const r = bar.getBoundingClientRect();
    el.currentTime = Math.min(Math.max((clientX - r.left) / r.width, 0), 1) * el.duration;
  };

  const onSeekDown = (e: PointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    seekTo(e.clientX, e.currentTarget);
  };
  const onSeekMove = (e: PointerEvent<HTMLDivElement>) => {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) seekTo(e.clientX, e.currentTarget);
  };
  const onSeekKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const el = video.current;
    if (!el) return;
    if (e.key === 'ArrowRight') el.currentTime = Math.min(el.currentTime + 5, el.duration || 0);
    else if (e.key === 'ArrowLeft') el.currentTime = Math.max(el.currentTime - 5, 0);
    else return;
    e.preventDefault();
  };

  return (
    <div className={`video-frame${paused ? ' is-paused' : ''}`}>
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

      {sound && (
        <button
          className="video-sound"
          onClick={toggleSound}
          aria-label={muted ? 'Turn sound on' : 'Mute'}
          aria-pressed={!muted}
        >
          <SoundIcon muted={muted} />
        </button>
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
        className="video-progress"
        role="slider"
        tabIndex={0}
        aria-label="Seek"
        aria-valuemin={0}
        aria-valuemax={100}
        onPointerDown={onSeekDown}
        onPointerMove={onSeekMove}
        onKeyDown={onSeekKey}
      >
        <span className="video-progress-track">
          <span className="video-progress-fill" ref={fill} />
        </span>
      </div>
    </div>
  );
}
