import { useEffect, useRef, useState } from 'react';
import { prefersReducedMotion } from '@/lib/motion';
import Button from './Button';
import '@/styles/device.css';

type Props = {
  src: string; // MP4 (H.264)
  webm?: string; // optional WebM fallback for browsers without H.264
  poster?: string;
  title: string;
  /** Show a "Play with sound" button that restarts the video unmuted with controls. */
  sound?: boolean;
};

/**
 * A laptop playing a video, muted and looping while it is on screen.
 * With `sound`, a round button lets the viewer watch it properly.
 */
export default function DeviceVideo({ src, webm, poster, title, sound = false }: Props) {
  const video = useRef<HTMLVideoElement>(null);
  const [engaged, setEngaged] = useState(false);

  // Autoplay (muted) only while visible, so it never plays off-screen.
  useEffect(() => {
    const el = video.current;
    if (!el || engaged || prefersReducedMotion()) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) el.play().catch(() => {});
        else el.pause();
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [engaged]);

  const playWithSound = () => {
    const el = video.current;
    if (!el) return;
    setEngaged(true);
    el.loop = false;
    el.muted = false;
    el.controls = true;
    el.currentTime = 0;
    el.play().catch(() => {});
  };

  return (
    <div className="laptop">
      <div className="laptop-screen">
        <span className="laptop-camera" />
        <div className="laptop-display">
          <video ref={video} poster={poster} muted loop playsInline preload="metadata" aria-label={title}>
            <source src={src} type="video/mp4" />
            {webm && <source src={webm} type="video/webm" />}
          </video>
          {sound && (
            <div className={`device-play${engaged ? ' is-hidden' : ''}`}>
              <Button variant="round" blue onClick={playWithSound} strength={50}>
                Play with sound
              </Button>
            </div>
          )}
        </div>
      </div>
      <div className="laptop-base">
        <span className="laptop-notch" />
      </div>
    </div>
  );
}
