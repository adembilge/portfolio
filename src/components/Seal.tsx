import { useMemo, useRef } from 'react';
import { hashString, rng } from '../lib/rng';
import { noise2 } from '../lib/noise';
import { useInView, useReducedMotion } from '../lib/hooks';
import { useTicker } from '../lib/ticker';

/** A generated certification seal: issuer text orbits a ridge pattern seeded from the credential URL. */
export function Seal({ seed, text }: { seed: string; text: string }) {
  const ref = useRef<SVGSVGElement>(null);
  const spin = useRef<SVGGElement>(null);
  const visible = useInView(ref);
  const reduced = useReducedMotion();
  const st = useRef({ a: 0, v: 6, target: 6 });
  const id = `seal-${hashString(seed).toString(36)}`;

  const rings = useMemo(() => {
    const r = rng(hashString(seed));
    const ox = r() * 50;
    const oy = r() * 50;
    const cx = (r() - 0.5) * 8;
    const cy = (r() - 0.5) * 8;
    return Array.from({ length: 9 }, (_, k) => {
      const base = 6 + k * 3.6;
      const pts = Array.from({ length: 49 }, (_, i) => {
        const t = (i / 48) * Math.PI * 2;
        const rr = base + noise2(ox + Math.cos(t) * 1.2 + k * 0.15, oy + Math.sin(t) * 1.2) * 4;
        return `${(80 + cx + Math.cos(t) * rr * 1.08).toFixed(1)},${(80 + cy + Math.sin(t) * rr).toFixed(1)}`;
      });
      return `M${pts.join(' L')}Z`;
    });
  }, [seed]);

  useTicker((_, dt) => {
    const s = st.current;
    s.v += (s.target - s.v) * Math.min(1, dt * 4);
    s.a = (s.a + s.v * dt) % 360;
    spin.current?.setAttribute('transform', `rotate(${s.a.toFixed(2)} 80 80)`);
  }, visible && !reduced);

  return (
    <svg
      ref={ref}
      viewBox="0 0 160 160"
      className="seal"
      aria-hidden="true"
      onMouseEnter={() => (st.current.target = 60)}
      onMouseLeave={() => (st.current.target = 6)}
    >
      <defs>
        <path id={id} d="M80,80 m-64,0 a64,64 0 1,1 128,0 a64,64 0 1,1 -128,0" />
      </defs>
      <circle cx="80" cy="80" r="76" className="seal__outer" />
      <circle cx="80" cy="80" r="52" className="seal__inner" />
      <g ref={spin}>
        <text className="seal__text">
          <textPath href={`#${id}`} textLength={402} lengthAdjust="spacing">
            {text}
          </textPath>
        </text>
      </g>
      <g className="seal__ridges">
        {rings.map((d, i) => (
          <path key={i} d={d} />
        ))}
      </g>
      <circle cx="80" cy="80" r="3" className="seal__dot" />
    </svg>
  );
}
