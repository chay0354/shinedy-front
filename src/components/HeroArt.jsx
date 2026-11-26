import { useEffect, useRef, useState } from 'react';
import { usePreferStillMedia } from '../lib/media';

const DEFAULT_KICKER = 'NEW LOOK · SAME YOU';

export function CyclingKicker({ lines, className = 'hb-kicker hb-kicker-lg' }) {
  const [index, setIndex] = useState(0);
  const [shown, setShown] = useState(true);

  useEffect(() => {
    if (lines.length < 2) return undefined;
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (motion.matches) return undefined;
    let swap;
    const cycle = setInterval(() => {
      setShown(false);
      swap = setTimeout(() => {
        setIndex((current) => (current + 1) % lines.length);
        setShown(true);
      }, 420);
    }, 2800);
    return () => {
      clearInterval(cycle);
      clearTimeout(swap);
    };
  }, [lines]);

  return (
    <span className={`${className} ${shown ? 'is-in' : 'is-out'}`} dir="ltr">
      {lines.map((line, i) => (
        <span key={line} className={i === index ? 'is-current' : 'is-reserve'} aria-hidden={i !== index}>
          {line}
        </span>
      ))}
    </span>
  );
}

function useNarrowScreen() {
  const [narrow, setNarrow] = useState(() => (
    typeof window !== 'undefined' && window.matchMedia('(max-width: 720px)').matches
  ));

  useEffect(() => {
    const query = window.matchMedia('(max-width: 720px)');
    const update = () => setNarrow(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  return narrow;
}

export default function HeroArt({
  label = 'דוגמנית עונדת שרשרת יוקרתית',
  video = null,
  mobileVideo = null,
  poster = null,
  showKicker = true,
  lines = null,
}) {
  const videoRef = useRef(null);
  const still = usePreferStillMedia();
  const narrow = useNarrowScreen();
  const activeVideo = narrow && mobileVideo ? mobileVideo : video;
  const showVideo = Boolean(activeVideo) && (!still || (narrow && Boolean(mobileVideo)));

  useEffect(() => {
    const node = videoRef.current;
    if (!node) return undefined;
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => {
      if (motion.matches) node.pause();
      else node.play().catch(() => {});
    };
    sync();
    motion.addEventListener('change', sync);
    return () => motion.removeEventListener('change', sync);
  }, [showVideo, activeVideo]);

  return (
    <div className={showVideo ? 'hero-art has-video' : 'hero-art'} role="img" aria-label={label}>
      {showVideo ? (
        <video
          key={activeVideo}
          ref={videoRef}
          className="hero-video"
          autoPlay
          muted
          loop
          playsInline
          poster={poster || undefined}
          aria-hidden="true"
        >
          <source src={activeVideo} type="video/mp4" />
        </video>
      ) : poster ? (
        <img className="hero-video" src={poster} alt="" />
      ) : (
        <>
          <div className="hero-art-portrait" aria-hidden="true" />
          <div className="hero-art-dress" aria-hidden="true" />
          <div className="hero-art-chain" aria-hidden="true" />
          <div className="hero-art-jewel" aria-hidden="true" />
        </>
      )}
      {lines?.length ? (
        <CyclingKicker lines={lines} />
      ) : (
        showKicker && (
          <span className="hb-kicker" dir="ltr">
            {DEFAULT_KICKER}
          </span>
        )
      )}
    </div>
  );
}
