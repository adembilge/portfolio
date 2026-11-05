import { useEffect, useState } from 'react';
import { useSite } from '../site';
import { person } from '../content/facts';
import { rng } from '../lib/rng';

const r = rng(42);
const jitter = person.name.split('').map(() => r());

/** Signal-to-noise of the visitor's reading: the mini name resolves as more of the CV is seen. */
export function SignalMeter() {
  const { cv } = useSite();
  const [read, setRead] = useState(0);
  useEffect(() => {
    if (cv) return;
    const blocks = document.querySelectorAll('[data-signal]');
    const seen = new Set<Element>();
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.intersectionRatio < 0.35) continue;
        seen.add(entry.target);
        observer.unobserve(entry.target);
      }
      setRead(blocks.length ? seen.size / blocks.length : 0);
    }, { threshold: 0.35 });
    blocks.forEach((block) => observer.observe(block));
    return () => observer.disconnect();
  }, [cv]);
  const pct = Math.round(read * 100);
  return (
    <div className="meter">
      <p className="meter__name" aria-hidden="true">
        {person.name.split('').map((ch, i) => {
          const blur = Math.max(0, (1 - read) * 4 * jitter[i] - 0.2);
          return (
            <span key={i} style={{ filter: blur > 0 ? `blur(${blur.toFixed(2)}px)` : 'none', opacity: 0.35 + read * 0.65 }}>
              {ch}
            </span>
          );
        })}
      </p>
      <div className="meter__bar" role="meter" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct} aria-label="Signal to noise: how much of the CV you have read">
        <span style={{ transform: `scaleX(${read})` }} />
      </div>
      <p className="meter__label mono">
        S/N {pct}%{pct === 100 ? ' · fully resolved' : ''}
      </p>
    </div>
  );
}
