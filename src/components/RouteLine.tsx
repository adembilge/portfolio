import { useEffect, useRef, useState } from 'react';
import { projectRoute, legKm, totalKm } from '../lib/geo';
import { clamp, useInView, useReducedMotion } from '../lib/hooks';

const VW = 800;
const VH = 400;
const pts = projectRoute(VW, VH, 70);
const d = pts.map((p, i) => `${i ? 'L' : 'M'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
const legPx = pts.slice(1).map((p, i) => Math.hypot(p.x - pts[i].x, p.y - pts[i].y));
const totalPx = legPx.reduce((a, b) => a + b, 0);

/** The real route, drawn as you scroll; distance accumulates from great-circle legs. */
export function RouteLine() {
  const wrap = useRef<HTMLDivElement>(null);
  const visible = useInView(wrap, '100px 0px');
  const reduced = useReducedMotion();
  const [p, setP] = useState(reduced ? 1 : 0);

  useEffect(() => {
    if (reduced) return setP(1);
    const el = wrap.current;
    if (!visible || !el) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const rect = el.getBoundingClientRect();
      // Same endpoints as before: top at 75% of the viewport, bottom at 45%.
      const progress = clamp((innerHeight * 0.75 - rect.top) / (rect.height + innerHeight * 0.3));
      setP(progress);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    const ro = new ResizeObserver(schedule);
    ro.observe(document.body);
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    update();
    return () => {
      ro.disconnect();
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, [reduced, visible]);

  // Which leg are we on, and how many km so far.
  let px = p * totalPx;
  let km = 0;
  let reached = 0;
  for (let i = 0; i < legPx.length; i++) {
    if (px >= legPx[i]) {
      px -= legPx[i];
      km += legKm[i];
      reached = i + 1;
    } else {
      km += legKm[i] * (px / legPx[i]);
      break;
    }
  }
  if (p >= 1) km = totalKm;

  const seen = new Set<string>();
  return (
    <div ref={wrap} className="route" data-signal>
      <svg viewBox={`0 0 ${VW} ${VH}`} role="img" aria-label={`Route: ${pts.map((s) => `${s.city} ${s.year}`).join(', ')}. About ${Math.round(totalKm).toLocaleString('en-US')} km in straight lines.`}>
        <path d={d} className="route__ghost" />
        <path d={d} className="route__path" pathLength={1} style={{ strokeDashoffset: 1 - p }} />
        {pts.map((s, i) => {
          const first = !seen.has(s.city);
          seen.add(s.city);
          const on = i <= reached;
          const years = pts.filter((q) => q.city === s.city).map((q) => q.year).join(' · ');
          // Istanbul and Ankara sit close together, so their labels go out to the sides.
          const side = s.city === 'Istanbul' ? -1 : s.city === 'Ankara' ? 1 : 0;
          const lx = s.x + side * 20;
          const ly = side ? s.y + 30 : s.y - 30;
          const anchor = side < 0 ? 'end' : side > 0 ? 'start' : 'middle';
          return (
            <g key={i} className={`route__stop ${on ? 'is-on' : ''}`}>
              <circle cx={s.x} cy={s.y} r={first ? 7 : 11} />
              {first && (
                <>
                  <text x={lx} y={ly} textAnchor={anchor} className="route__city">
                    {s.city}
                  </text>
                  <text x={lx} y={ly + 16} textAnchor={anchor} className="route__year">
                    {years}
                  </text>
                </>
              )}
            </g>
          );
        })}
      </svg>
      <div className="route__readout">
        <span className="route__km tabular">{Math.round(km).toLocaleString('en-US')}</span>
        <span className="mono">km so far, in straight lines between {pts.map((s) => s.city).filter((c, i, a) => a.indexOf(c) === i).join(', ')}</span>
        <span className="mono route__now">{pts[Math.min(reached, pts.length - 1)].what}</span>
      </div>
    </div>
  );
}
